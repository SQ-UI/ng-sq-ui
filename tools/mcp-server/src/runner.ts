import { spawn } from 'node:child_process';
import { createServer, type Server } from 'node:http';
import { readFile, stat, mkdir, realpath } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { UiError, errorResult } from './errors';
import { Workspace, type Artifact } from './workspace';
import type { CheckResult, ValidationReport } from './types';

const require = createRequire(import.meta.url);
export function runCommand(executable: string, args: string[], cwd: string, signal: AbortSignal, timeoutMs = 180000): Promise<CheckResult> {
  return new Promise(resolve => {
    const started = Date.now();
    const command = [executable, ...args];
    const child = spawn(executable, args, { cwd, shell: false, detached: process.platform !== 'win32', env: { ...process.env, PATH: path.dirname(process.execPath) + path.delimiter + (process.env.PATH ?? '') }, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '', settled = false, killed = false;
    const record = (chunk: Buffer) => { output = (output + chunk.toString()).slice(-262144); };
    child.stdout.on('data', record); child.stderr.on('data', record);
    const kill = () => {
      killed = true;
      if (child.pid) {
        try { process.kill(process.platform === 'win32' ? child.pid : -child.pid, 'SIGTERM'); } catch { /* Already exited. */ }
        const force = setTimeout(() => { if (!settled && child.pid) try { process.kill(process.platform === 'win32' ? child.pid : -child.pid, 'SIGKILL'); } catch { /* Already exited. */ } }, 1000);
        force.unref();
      }
    };
    const timer = setTimeout(kill, timeoutMs);
    signal.addEventListener('abort', kill, { once: true });
    if (signal.aborted) kill();
    const finish = (exitCode: number | null, error?: Error) => {
      if (settled) return;
      settled = true; clearTimeout(timer); signal.removeEventListener('abort', kill);
      resolve({ name: executable, command, status: exitCode === 0 && !killed && !error ? 'passed' : 'failed', exitCode, output: output + (error ? '\n' + error.message : '') + (killed ? '\nProcess cancelled or timed out.' : ''), durationMs: Date.now() - started });
    };
    child.on('error', error => finish(null, error)); child.on('close', code => finish(code));
  });
}

export class Jobs {
  private readonly jobs = new Map<string, { id: string; status: string; controller: AbortController; result?: unknown; error?: unknown; promise: Promise<unknown> }>();
  start(task: (signal: AbortSignal) => Promise<unknown>) {
    const id = `job-${randomUUID()}`;
    const controller = new AbortController();
    const job = { id, status: 'running', controller, promise: Promise.resolve() as Promise<unknown>, result: undefined as unknown, error: undefined as unknown };
    job.promise = Promise.resolve().then(() => task(controller.signal)).then(result => { job.result = result; job.status = controller.signal.aborted ? 'cancelled' : 'complete'; return result; }, error => { job.error = errorResult(error).error; job.status = controller.signal.aborted ? 'cancelled' : 'failed'; return undefined; });
    this.jobs.set(id, job);
    return this.get(id);
  }
  get(id: string) {
    const job = this.jobs.get(id);
    if (!job) throw new UiError('UNKNOWN_JOB', `Unknown job ${id}; jobs belong to the current server process`);
    return { id, status: job.status, result: job.result, error: job.error };
  }
  cancel(id: string) { const job = this.jobs.get(id); if (!job) throw new UiError('UNKNOWN_JOB', `Unknown job ${id}`); if (job.status === 'running') job.controller.abort(); return this.get(id); }
  async wait(id: string) { const job = this.jobs.get(id); if (!job) throw new UiError('UNKNOWN_JOB', `Unknown job ${id}`); await job.promise; return this.get(id); }
  close() { for (const job of this.jobs.values()) if (job.status === 'running') job.controller.abort(); }
}

export async function servePreview(directory: string): Promise<{ server: Server; url: string }> {
  const root = await realpath(directory);
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
      let filename = path.resolve(root, '.' + pathname);
      if (filename !== root && !filename.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
      try { if (!(await stat(filename)).isFile()) filename = path.join(root, 'index.html'); } catch { filename = path.join(root, 'index.html'); }
      const resolved = await realpath(filename);
      if (!resolved.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
      const content = await readFile(resolved);
      const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
      response.writeHead(200, { 'Content-Type': types[path.extname(resolved)] ?? 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); response.end(content);
    } catch { response.writeHead(404); response.end(); }
  });
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const address = server.address();
  if (!address || typeof address === 'string') throw new UiError('PREVIEW_FAILED', 'Could not determine preview port');
  return { server, url: `http://127.0.0.1:${address.port}` };
}

export class Runner {
  readonly jobs = new Jobs();
  private readonly previews = new Map<string, Server>();
  constructor(readonly workspace: Workspace) {}
  async validate(artifactId: string, signal: AbortSignal, install = false): Promise<ValidationReport> {
    const artifact = await this.workspace.load<Artifact>('artifacts', artifactId);
    const directory = artifact.spec.output.mode === 'existing-project' ? this.workspace.root : await this.workspace.resolve(artifact.directory);
    const checks: CheckResult[] = [];
    if (artifact.spec.mode === 'theme') {
      const theme = await this.workspace.load<{ diagnostics: { severity: string }[] }>('themes', artifact.themeId);
      checks.push({ name: 'theme-contract', status: theme.diagnostics.some(item => item.severity === 'error') ? 'failed' : 'passed' });
    } else {
      if (install) checks.push({ ...await runCommand('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], directory, signal), name: 'install' });
      if (!checks.some(check => check.status === 'failed') && !signal.aborted) {
        const config = artifact.spec.output.mode === 'existing-project' ? 'tsconfig.app.json' : 'tsconfig.json';
        let typeConfig = config;
        if (artifact.spec.output.mode === 'existing-project') {
          const inspection = await this.workspace.inspect();
          const angular = inspection.angularJson as { projects?: Record<string, { architect?: { build?: { options?: { tsConfig?: string } } } }> } | null;
          typeConfig = Object.values(angular?.projects ?? {}).find(project => project.architect?.build?.options?.tsConfig)?.architect?.build?.options?.tsConfig ?? config;
        }
        checks.push({ ...await runCommand(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', typeConfig, '--noEmit'], directory, signal), name: 'typecheck' });
        if (!signal.aborted) checks.push({ ...await runCommand('npm', ['run', 'build'], directory, signal), name: 'production-build' });
      }
    }
    const report: ValidationReport = { artifactId, status: !checks.length ? 'not-run' : checks.every(check => check.status === 'passed') ? 'passed' : 'failed', checks, createdAt: new Date().toISOString() };
    artifact.report = report;
    await this.workspace.save('artifacts', artifactId, artifact);
    await this.workspace.save('reports', artifactId, report);
    return report;
  }
  async preview(artifactId: string, options: { widths: number[]; modes: ('light' | 'dark')[]; engine: 'chromium' | 'firefox' | 'webkit'; routes?: string[] }, signal: AbortSignal) {
    const artifact = await this.workspace.load<Artifact>('artifacts', artifactId);
    if (artifact.spec.output.mode !== 'new-project' || artifact.spec.mode === 'theme') throw new UiError('PREVIEW_UNSUPPORTED', 'Preview currently requires a generated Angular project; use your host preview for existing projects');
    const output = await this.workspace.resolve(`${artifact.directory}/dist/app/browser`);
    try { await stat(path.join(output, 'index.html')); } catch { throw new UiError('BUILD_REQUIRED', 'Run validate_ui and resolve its build errors before previewing'); }
    const playwright = await import('playwright');
    const screenshotDirectory = await this.workspace.resolve(`.sq-ui-mcp/screenshots/${artifactId}`, true);
    await mkdir(screenshotDirectory, { recursive: true });
    const preview = await servePreview(output);
    this.stopPreview(artifactId); this.previews.set(artifactId, preview.server);
    const executablePath = options.engine === 'chromium' ? process.env.SQ_UI_BROWSER : undefined;
    let browser: Awaited<ReturnType<typeof playwright.chromium.launch>>;
    try { browser = await playwright[options.engine].launch({ executablePath, headless: true }); }
    catch (error) { this.stopPreview(artifactId); throw new UiError('BROWSER_UNAVAILABLE', 'Install the selected Playwright browser or set SQ_UI_BROWSER for Chromium', String(error)); }
    const cancel = () => { void browser.close(); };
    signal.addEventListener('abort', cancel, { once: true });
    const results = [];
    try {
      const paths = options.routes ?? (artifact.spec.mode === 'example' ? ['example'] : artifact.spec.pages?.map(page => page.id) ?? ['dashboard', 'users', 'settings']);
      for (const route of paths) {
        if (!/^[a-z][a-z0-9-]{0,63}$/.test(route)) throw new UiError('INVALID_ROUTE', 'Use a generated page ID for a preview route');
        for (const width of options.widths) for (const mode of options.modes) {
          signal.throwIfAborted();
          const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: mode });
          const runtimeErrors: string[] = [];
          page.on('pageerror', error => runtimeErrors.push(error.message));
          await page.addInitScript(value => { try { localStorage.setItem('sq-ui-theme', value); } catch { /* Storage unavailable on initial origin. */ } }, mode);
          await page.goto(`${preview.url}/#/${route}`);
          await page.locator('h1').waitFor();
          await page.evaluate(() => document.fonts.ready);
          await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
          const accessibility = await page.evaluate(async () => {
            const axe = (window as unknown as { axe: { run: (context: Element, options: unknown) => Promise<{ violations: { id: string; impact: string | null; nodes: { target: string[]; failureSummary?: string }[] }[] }> } }).axe;
            const result = await axe.run(document.documentElement, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } });
            return result.violations.map(violation => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.map(node => ({ target: node.target, message: node.failureSummary })) }));
          });
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
          const screenshot = path.join(screenshotDirectory, `${options.engine}-${route}-${width}-${mode}.png`);
          await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
          results.push({ route, width, mode, engine: options.engine, screenshot, overflow, runtimeErrors, accessibility, status: !overflow && !runtimeErrors.length && !accessibility.some(violation => ['critical', 'serious'].includes(violation.impact ?? '')) ? 'passed' : 'failed' });
          await page.close();
        }
      }
    } finally { signal.removeEventListener('abort', cancel); await browser.close(); }
    const report = { artifactId, previewUrl: preview.url, status: results.every(result => result.status === 'passed') ? 'passed' : 'failed', checks: results, createdAt: new Date().toISOString() };
    await this.workspace.save('reports', `${artifactId}-browser`, report);
    return report;
  }
  stopPreview(artifactId: string) { const server = this.previews.get(artifactId); if (server) { server.closeAllConnections(); server.close(); this.previews.delete(artifactId); } return { stopped: !!server }; }
  close() { this.jobs.close(); for (const id of this.previews.keys()) this.stopPreview(id); }
}
