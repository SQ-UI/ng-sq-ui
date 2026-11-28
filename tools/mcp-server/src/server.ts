import { McpServer, ResourceTemplate } from '@modelcontextprotocol/server';
import { loadSkills } from '@modelcontextprotocol/server/ext/skills/node';
import * as z from 'zod/v4';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { Registry, page, score } from './registry';
import { Generator, blueprints, fullExample } from './generator';
import { Workspace, type Artifact } from './workspace';
import { createTheme, type Theme } from './theme';
import { idSchema, querySchema, resultSchema, themeSchema, uiSpecSchema } from './schema';
import { errorResult, UiError } from './errors';
import { Runner, runCommand } from './runner';
import { referenceLinks } from './references';

export interface ServerOptions { contentDirectory: string; skillsDirectory: string; registryFile?: string; profile?: 'docs' | 'build'; workspace?: string; version?: string; ttlMs?: number }
export async function createUiServer(options: ServerOptions) {
  const registry = new Registry(options.registryFile ?? path.join(options.contentDirectory, 'registry.json'), options.ttlMs);
  const snapshot = await registry.get(options.version);
  const profile = options.profile ?? 'docs';
  const workspace = options.workspace ? await Workspace.open(options.workspace) : undefined;
  if (profile === 'build' && !workspace) throw new UiError('WORKSPACE_REQUIRED', 'The build profile requires --workspace');
  const generator = workspace ? new Generator(registry, workspace, options.contentDirectory) : undefined;
  const runner = workspace ? new Runner(workspace) : undefined;
  const skills = await loadSkills(options.skillsDirectory, { strict: true });
  const server = new McpServer({ name: 'ng-sq-ui', version: '1.0.0' }, { instructions: 'Call get_overview first. Use versioned public APIs and runnable examples. For building, plan_ui then generate_ui, apply_changeset, validate_ui and preview_ui. Jobs require get_job until complete. Read each relevant skill instead of guessing API names.' });
  skills.attach(server);
  const names: string[] = [];
  function tool<T extends z.ZodRawShape>(name: string, description: string, schema: z.ZodObject<T>, handler: (args: z.output<z.ZodObject<T>>, signal: AbortSignal) => unknown | Promise<unknown>, readOnly = true) {
    names.push(name);
    server.registerTool(name, { description, inputSchema: schema, outputSchema: resultSchema, annotations: { readOnlyHint: readOnly, destructiveHint: false, idempotentHint: readOnly, openWorldHint: false } }, async (args, ctx) => {
      let result;
      try { result = { ok: true, data: await handler(args as z.output<z.ZodObject<T>>, ctx.mcpReq.signal) }; } catch (error) { result = errorResult(error); }
      return { content: [{ type: 'text' as const, text: JSON.stringify(result) }], structuredContent: result, ...(!result.ok ? { isError: true } : {}) };
    });
  }
  const overview = () => ({
    library: '@sq-ui/ng-sq-ui', version: snapshot.version, angularMajor: snapshot.angularMajor, serverVersion: '1.0.0', profile,
    source: { mode: 'source-snapshot', commit: snapshot.commit, digest: snapshot.sourceDigest }, availableVersions: [snapshot.version],
    imports: snapshot.modules.map(module => ({ package: module.package, exports: module.exports.map(item => item.name) })),
    counts: { declarations: snapshot.declarations.length, components: snapshot.declarations.filter(entry => entry.kind === 'component').length, examples: snapshot.examples.length, variants: snapshot.examples.reduce((sum, example) => sum + example.variants.length, 0), tokens: snapshot.tokens.length, skills: skills.entries.length },
    rules: ['Import standalone components explicitly.', 'Use signal value models or [formField]; inspect legacy compatibility exports before using them.', 'Load global Sass once and keep .sq on a parent.', 'Use known template directives and context types.', 'Workspace dependencies need built libraries; published availability is not inferred from source manifests.'],
    blueprints, tools: names, limitations: ['Data providers and login are demonstrations.', 'Full application SSR and arbitrary backend integration require an explicit implementation.', 'Browser preview requires installed Playwright browsers.'],
    skills: skills.entries.map(entry => ({ uri: entry.uri, name: entry.name, description: entry.description }))
  });
  tool('get_overview', 'Read first: version, import map, generation rules, tools and skills.', z.object({ version: z.string().optional() }), async args => { await registry.get(args.version); return overview(); });
  const list = async (args: z.infer<typeof querySchema>) => {
    const data = await registry.get(args.version);
    const candidates = data.declarations.filter(entry => (!args.category || entry.category === args.category) && (!args.package || entry.imports.some(item => item.package === args.package)) && (!args.kind || entry.kind === args.kind))
      .map(entry => ({ entry, score: score([entry.id, entry.name, entry.selector, entry.description, entry.imports.map(item => item.package)].join(' '), args.query) })).filter(item => item.score > 0).sort((left, right) => right.score - left.score || left.entry.id.localeCompare(right.entry.id));
    return page(candidates.map(({ entry }) => ({ id: entry.id, name: entry.name, kind: entry.kind, selector: entry.selector, description: entry.description, category: entry.category, imports: entry.imports, variants: entry.variants.map(variant => variant.id), supportStatus: entry.supportStatus })), args.cursor, args.limit);
  };
  tool('list_components', 'List all public declarations with fuzzy search, filters and pagination.', querySchema, list);
  tool('get_list_components', 'Taiga-compatible alias of list_components.', querySchema, list);
  tool('search_docs', 'Search versioned guides, API signatures and examples.', querySchema, async args => {
    const data = await registry.get(args.version);
    const records = [...data.documents.map(document => ({ id: document.id, kind: 'guide', text: document.markdown })), ...data.declarations.map(entry => ({ id: entry.id, kind: 'api', text: `${entry.name}\n${entry.description}\n${entry.signature}` }))];
    return page(records.map(record => ({ ...record, score: score(record.text, args.query) })).filter(record => record.score > 0).sort((left, right) => right.score - left.score).map(record => ({ id: record.id, kind: record.kind, score: record.score, excerpt: record.text.slice(0, 700) })), args.cursor, args.limit);
  });
  const docSchema = idSchema.extend({ offset: z.number().int().min(0).default(0), length: z.number().int().min(100).max(30000).default(12000) });
  tool('get_doc_page', 'Read a Markdown guide or public API page, optionally in bounded sections.', docSchema, async args => {
    const data = await registry.get(args.version);
    const document = data.documents.find(document => document.id === args.id);
    const markdown: string = document ? document.markdown : await registry.component(args.id, args.version).then(entry => `# ${entry.name}\n\n${entry.description}\n\n${entry.signature}`);
    return { id: args.id, version: data.version, markdown: markdown.slice(args.offset, args.offset + args.length), totalCharacters: markdown.length, ...(args.offset + args.length < markdown.length ? { nextOffset: args.offset + args.length } : {}) };
  });
  tool('get_component_api', 'Read exact public inputs, outputs, models, inherited members, slots and types.', idSchema, args => registry.component(args.id, args.version));
  tool('get_component_example', 'Read a complete standalone Angular component and its versioned example metadata.', idSchema.extend({ variant: z.string().optional() }), async args => {
    const { demo, variant } = await registry.example(args.id, args.variant, args.version);
    return { version: snapshot.version, component: demo.id, variant, ...fullExample(demo, variant), styles: "@use '@sq-ui/ng-sq-common/sq-ui-theme';\n@use '@sq-ui/ng-form-elements/styles/form-elements';", wrapper: '<main class="sq"><app-example /></main>' };
  });
  const references = async (args: z.infer<typeof idSchema>) => {
    const component = await registry.component(args.id, args.version);
    return { component: component.id, framework: 'angular', links: [{ provider: 'ng-sq-ui', kind: 'source', url: `https://github.com/SQ-UI/ng-sq-ui/blob/${snapshot.commit}/${component.source}` }, ...referenceLinks(component.id)], checkedOn: '2026-11-28', mapping: 'conceptual-equivalent', supportedGenerationFrameworks: ['angular'] };
  };
  tool('get_reference_links', 'Return actual source and reference-library documentation links, labelled by scope.', idSchema, references);
  tool('get_cross_framework_links', 'CoreUI-compatible reference lookup; ng-sq-ui supports Angular.', idSchema, references);
  tool('get_migration_guide', 'Read explicit version migration steps and the current library guide.', z.object({ fromVersion: z.string(), toVersion: z.string().optional() }).strict(), async args => {
    const data = await registry.get(args.toVersion);
    const major = Number(args.fromVersion.replace(/^v/, '').split('.')[0]);
    if (![1, 2, 3].includes(major)) throw new UiError('MIGRATION_UNAVAILABLE', 'Migration guides cover ng-sq-ui 1.x, 2.x and 3.x');
    return { fromVersion: args.fromVersion, toVersion: data.version, automatic: false, steps: major < 3 ? [...(major === 1 ? ['Upgrade Angular and ng-sq-ui to the 2.x compatibility line before the standalone migration.'] : []), 'Upgrade to Angular 22 and compatible Node/TypeScript.', 'Replace NgModule imports with public standalone component imports.', 'Replace formControlName/ngModel bindings on SQ controls with signal value models or Angular Signal Forms.', 'Use readonly RegExp[] for pattern and typed generic row/value models.', 'Load the published theme/form styles once under .sq.', 'Run strict Angular compilation, behavior and browser checks.'] : ['Check release notes and public API changes for your exact installed version.', 'Compile and validate affected screens.'], markdown: data.documents.find(document => document.id === 'overview')?.markdown };
  });
  tool('list_tokens', 'List actual Sass/CSS token defaults and categories.', querySchema, async args => page((await registry.get(args.version)).tokens.filter(token => (!args.category || token.category === args.category) && score(`${token.name} ${token.value}`, args.query) > 0), args.cursor, args.limit));
  tool('list_blueprints', 'List supported UI recipes and their capability status.', z.object({}), () => blueprints);
  tool('get_theme', 'Read a saved theme or generate an inspectable default theme.', z.object({ id: z.string().optional() }), async args => {
    if (args.id) { if (!workspace) throw new UiError('WORKSPACE_REQUIRED', 'Saved themes belong to a registered workspace'); return workspace.load<Theme>('themes', args.id); }
    return createTheme({}, snapshot);
  });
  if (profile === 'build' && workspace && generator && runner) {
    tool('inspect_workspace', 'Read the registered workspace configuration and dependency manifests.', z.object({}), () => workspace.inspect());
    tool('plan_ui', 'Validate a UiSpec and resolve recipes, versions, dependencies and theme checks.', z.object({ spec: uiSpecSchema }), args => generator.plan(args.spec).then(({ snapshot: _snapshot, ...plan }) => plan));
    tool('create_theme', 'Create and save a complete light/dark theme from real library tokens.', z.object({ theme: themeSchema }), async args => workspace.saveTheme(createTheme(args.theme, snapshot)), false);
    tool('update_theme', 'Plan a theme update while preserving application logic and user edits.', z.object({ artifactId: z.string(), theme: themeSchema }), args => generator.updateTheme(args.artifactId, args.theme), false);
    tool('generate_ui', 'Generate complete theme, example, page or admin files as a reviewable changeset.', z.object({ spec: uiSpecSchema, themeId: z.string().optional() }), async args => generator.generate(args.spec, args.themeId ? await workspace.load<Theme>('themes', args.themeId) : undefined), false);
    tool('apply_changeset', 'Apply a generated changeset only when all base file hashes still match.', z.object({ id: z.string() }), args => workspace.apply(args.id), false);
    const startJob = async (task: (signal: AbortSignal) => Promise<unknown>, wait: boolean, signal: AbortSignal) => {
      const job = runner.jobs.start(task);
      if (!wait) return job;
      const abort = () => runner.jobs.cancel(job.id);
      signal.addEventListener('abort', abort, { once: true });
      try { return await runner.jobs.wait(job.id); } finally { signal.removeEventListener('abort', abort); }
    };
    tool('validate_ui', 'Start production build and type checks; poll get_job. Install dependencies only when install=true.', z.object({ artifactId: z.string(), install: z.boolean().default(false), wait: z.boolean().default(false) }), (args, signal) => startJob(abort => runner.validate(args.artifactId, abort, args.install), args.wait, signal), false);
    tool('preview_ui', 'Start a browser preview with screenshots, overflow, runtime and axe checks; poll get_job.', z.object({ artifactId: z.string(), widths: z.array(z.number().int().min(320).max(2560)).min(1).max(4).default([390, 1440]), modes: z.array(z.enum(['light', 'dark'])).min(1).max(2).default(['light', 'dark']), engine: z.enum(['chromium', 'firefox', 'webkit']).default('chromium'), routes: z.array(z.string()).max(12).optional(), wait: z.boolean().default(false) }), (args, signal) => startJob(abort => runner.preview(args.artifactId, args, abort), args.wait, signal), false);
    tool('stop_preview', 'Stop a live preview server for an artifact.', z.object({ artifactId: z.string() }), args => runner.stopPreview(args.artifactId), false);
    tool('get_job', 'Read the current job status and its real result or error.', z.object({ id: z.string() }), args => runner.jobs.get(args.id));
    tool('cancel_job', 'Cancel a running build or browser job and terminate its owned processes.', z.object({ id: z.string() }), args => runner.jobs.cancel(args.id), false);
    tool('export_artifact', 'Export tracked source files as a directory or tar.gz, excluding installed dependencies.', z.object({ artifactId: z.string(), format: z.enum(['directory', 'tar.gz']).default('tar.gz') }), async (args, signal) => {
      const artifact = await workspace.load<Artifact>('artifacts', args.artifactId);
      if (args.format === 'directory') return { directory: await workspace.resolve(artifact.directory), files: Object.keys(artifact.fileHashes) };
      const destination = await workspace.resolve(`.sq-ui-mcp/exports/${artifact.id}.tar.gz`, true);
      await mkdir(path.dirname(destination), { recursive: true });
      const files = Object.keys(artifact.fileHashes).filter(file => file.startsWith(artifact.directory + '/')).map(file => file.slice(artifact.directory.length + 1));
      for (const file of files) await workspace.resolve(`${artifact.directory}/${file}`);
      const result = await runCommand('tar', ['-czf', destination, '-C', await workspace.resolve(artifact.directory), '--', ...files], workspace.root, signal);
      if (result.status !== 'passed') throw new UiError('EXPORT_FAILED', 'Could not create archive', result);
      return { filename: destination, files, sourceMode: artifact.spec.target.sourceMode, note: artifact.spec.target.sourceMode === 'workspace' ? 'Replace workspace file dependencies with published versions or tarballs before moving the project.' : undefined };
    }, false);
  }
  const jsonResource = (uri: URL, data: unknown) => ({ contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(data) }] });
  server.registerResource('overview', `sq-ui://versions/${snapshot.version}/overview`, { mimeType: 'application/json' }, uri => jsonResource(uri, overview()));
  server.registerResource('tokens', `sq-ui://versions/${snapshot.version}/tokens`, { mimeType: 'application/json' }, uri => jsonResource(uri, snapshot.tokens));
  server.registerResource('component', new ResourceTemplate('sq-ui://versions/{version}/components/{component}', { list: undefined }), { mimeType: 'application/json' }, async (uri, variables) => jsonResource(uri, await registry.component(String(variables.component), String(variables.version))));
  server.registerResource('example', new ResourceTemplate('sq-ui://versions/{version}/examples/{example}', { list: undefined }), { mimeType: 'application/json' }, async (uri, variables) => {
    const { demo, variant } = await registry.example(String(variables.example), undefined, String(variables.version)); return jsonResource(uri, fullExample(demo, variant));
  });
  server.registerResource('blueprint', new ResourceTemplate('sq-ui://blueprints/{blueprintId}', { list: undefined }), { mimeType: 'application/json' }, (uri, variables) => {
    const value = blueprints.find(blueprint => blueprint.id === String(variables.blueprintId)); if (!value) throw new UiError('UNKNOWN_BLUEPRINT', 'Unknown blueprint'); return jsonResource(uri, value);
  });
  for (const file of ['llms.txt', 'llms-full.txt']) server.registerResource(file, `sq-ui://docs/${file}`, { mimeType: 'text/markdown' }, async uri => ({ contents: [{ uri: uri.href, mimeType: 'text/markdown', text: await readFile(path.join(options.contentDirectory, file), 'utf8') }] }));
  if (workspace && profile === 'build') {
    server.registerResource('theme', new ResourceTemplate('sq-ui://themes/{themeId}', { list: undefined }), { mimeType: 'application/json' }, async (uri, variables) => jsonResource(uri, await workspace.load('themes', String(variables.themeId))));
    server.registerResource('report', new ResourceTemplate('sq-ui://artifacts/{artifactId}/report', { list: undefined }), { mimeType: 'application/json' }, async (uri, variables) => jsonResource(uri, await workspace.load('reports', String(variables.artifactId))));
  }
  for (const name of ['build-example', 'build-page', 'build-admin', 'customize-theme', 'migrate-project']) server.registerPrompt(name, { description: `Guide an agent through ${name} using versioned ng-sq-ui tools.`, argsSchema: z.object({ brief: z.string().max(4000) }) }, ({ brief }) => ({ messages: [{ role: 'user', content: { type: 'text', text: `Task: ${brief}\nUse ${name}. Read get_overview and the relevant sq-ui skill. Resolve exact APIs, form a UiSpec, call plan_ui, generate_ui, inspect the changeset and apply it within the user's authorization. Run validate_ui; poll jobs to completion and fix concrete diagnostics. Preview and report verified results, with unrun checks labelled explicitly.` } }] }));
  const close = () => runner?.close();
  return { server, registry, workspace, generator, runner, tools: names, close };
}
