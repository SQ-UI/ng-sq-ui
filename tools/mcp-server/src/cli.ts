#!/usr/bin/env node
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { randomUUID } from 'node:crypto';
import { parse as parseToml, stringify as stringifyToml } from 'smol-toml';
import { createUiServer } from './server';
import { UiError, errorResult } from './errors';

const packageDirectory = fileURLToPath(new URL('../', import.meta.url));
const { values, positionals } = parseArgs({ allowPositionals: true, options: {
  workspace: { type: 'string' }, profile: { type: 'string' }, registry: { type: 'string' },
  'library-version': { type: 'string' }, ttl: { type: 'string' }, client: { type: 'string' },
  directory: { type: 'string' }, spec: { type: 'string' }, apply: { type: 'boolean' },
  version: { type: 'boolean' }, help: { type: 'boolean', short: 'h' }
} });

async function main() {
  if (values.help) {
    console.log(`sq-ui-mcp [serve] [--profile docs|build] [--workspace PATH]\n  init --client cursor|vscode|claude-code|claude-desktop|windsurf|opencode|codex [--directory PATH]\n  generate --spec FILE --workspace PATH [--apply]\n  doctor [--workspace PATH]\n  --library-version VERSION  Require an exact packaged library snapshot\n  --registry FILE            Use a trusted local registry file\n  --ttl MINUTES             Registry reload interval (default 6)\n  --version                 Print server version\n\nBuild and browser jobs use get_job. Set SQ_UI_BROWSER to an installed Chromium executable or install Playwright browsers.`);
    return;
  }
  if (values.version) { console.log('1.0.0'); return; }
  const command = positionals[0] ?? 'serve';
  if (!['serve', 'init', 'doctor', 'generate'].includes(command)) throw new UiError('UNKNOWN_COMMAND', `Unknown command ${command}`);
  const profile = values.profile ?? (values.workspace ? 'build' : 'docs');
  if (profile !== 'docs' && profile !== 'build') throw new UiError('INVALID_PROFILE', 'Use docs or build');
  if (profile === 'build' && !values.workspace) throw new UiError('WORKSPACE_REQUIRED', 'The build profile requires --workspace');
  const ttlMs = values.ttl === undefined ? undefined : Number(values.ttl) * 60000;
  if (ttlMs !== undefined && (!Number.isFinite(ttlMs) || ttlMs < 0)) throw new UiError('INVALID_TTL', 'TTL must be a nonnegative number of minutes');
  if (command === 'init') { await initialize(); return; }
  const app = await createUiServer({ contentDirectory: path.join(packageDirectory, 'content'), skillsDirectory: path.join(packageDirectory, 'skills'), workspace: values.workspace, profile, registryFile: values.registry, version: values['library-version'], ttlMs });
  if (command === 'doctor') {
    const snapshot = await app.registry.get();
    console.log(JSON.stringify({ ok: true, serverVersion: '1.0.0', libraryVersion: snapshot.version, profile, tools: app.tools, workspace: app.workspace?.root, registryDigest: snapshot.sourceDigest }, null, 2));
    app.close(); await app.server.close(); return;
  }
  if (command === 'generate') {
    if (!app.generator || !values.spec) throw new UiError('SPEC_REQUIRED', 'Use generate --workspace PATH --spec FILE');
    const spec = JSON.parse(await readFile(values.spec, 'utf8'));
    const generated = await app.generator.generate(spec);
    const applied = values.apply ? await app.workspace!.apply(generated.changesetId) : undefined;
    console.log(JSON.stringify({ ...generated, files: generated.files.map(file => ({ path: file.path, baseHash: file.baseHash, bytes: Buffer.byteLength(file.content) })), applied }, null, 2));
    app.close(); await app.server.close(); return;
  }
  const handle = serveStdio(() => app.server, { onerror: error => console.error(error.message) });
  const close = () => { app.close(); void handle.close(); };
  process.once('SIGINT', close); process.once('SIGTERM', close); process.stdin.once('end', close);
}

async function initialize() {
  const client = values.client;
  const files: Record<string, string> = { cursor: '.cursor/mcp.json', vscode: '.vscode/mcp.json', 'claude-code': '.mcp.json', 'claude-desktop': 'claude_desktop_config.json', windsurf: '.codeium/windsurf/mcp_config.json', opencode: 'opencode.json', codex: '.codex/config.toml' };
  if (!client || !files[client]) throw new UiError('CLIENT_REQUIRED', `Use --client ${Object.keys(files).join('|')}`);
  const root = path.resolve(values.directory ?? process.cwd());
  const destination = path.join(root, files[client]);
  let source = '';
  try { source = await readFile(destination, 'utf8'); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  const args = [fileURLToPath(import.meta.url), '--profile', values.profile ?? (values.workspace ? 'build' : 'docs'), ...(values.workspace ? ['--workspace', path.resolve(values.workspace)] : []), ...(values['library-version'] ? ['--library-version', values['library-version']] : [])];
  let next: string;
  if (client === 'codex') {
    const config = source ? parseToml(source) : {};
    const servers = (config.mcp_servers ?? {}) as ReturnType<typeof parseToml>;
    const desired = { command: process.execPath, args };
    if (servers['sq-ui'] && JSON.stringify(servers['sq-ui']) !== JSON.stringify(desired)) throw new UiError('CONFIG_CONFLICT', 'An sq-ui server is already configured; preserve it or choose another configuration file');
    servers['sq-ui'] = desired; config.mcp_servers = servers;
    next = stringifyToml(config);
  } else {
    const config = source ? JSON.parse(source) as Record<string, unknown> : {};
    const key = client === 'vscode' ? 'servers' : client === 'opencode' ? 'mcp' : 'mcpServers';
    const servers = (config[key] ?? {}) as Record<string, unknown>;
    const desired = client === 'opencode' ? { type: 'local', command: [process.execPath, ...args], enabled: true } : { ...(client === 'vscode' ? { type: 'stdio' } : {}), command: process.execPath, args };
    if (servers['sq-ui'] && JSON.stringify(servers['sq-ui']) !== JSON.stringify(desired)) throw new UiError('CONFIG_CONFLICT', 'An sq-ui server is already configured; existing settings were preserved');
    servers['sq-ui'] = desired; config[key] = servers; next = JSON.stringify(config, null, 2) + '\n';
  }
  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.${randomUUID()}.tmp`;
  await writeFile(temporary, next, { flag: 'wx' }); await rename(temporary, destination);
  console.log(JSON.stringify({ filename: destination, client, command: process.execPath, args, note: 'Load or restart the selected MCP client, then call get_overview.' }, null, 2));
}

main().catch(error => { console.error(JSON.stringify(errorResult(error))); process.exitCode = 1; });
