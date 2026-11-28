import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, mkdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Registry, Generator, Workspace, createTheme, contrast, uiSpecSchema, mergeRoutes, Jobs, runCommand } from '../build/index.js';

const directory = fileURLToPath(new URL('../', import.meta.url));
const registry = new Registry(path.join(directory, 'content/registry.json'));
const spec = { mode: 'application', name: 'test-admin', output: { directory: 'apps/admin' } };
async function isolated(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'sq-ui-mcp-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const workspace = await Workspace.open(root);
  return { root, workspace, generator: new Generator(registry, workspace, path.join(directory, 'content')) };
}

test('registry follows every public export and exposes signal and inherited contracts', async () => {
  const data = await registry.get();
  for (const module of data.modules) for (const exported of module.exports) assert.ok(data.declarations.some(item => item.declarationId === exported.declarationId), `${module.package}:${exported.name}`);
  const input = await registry.component('input');
  assert.ok(input.inputs.some(item => item.name === 'pattern' && item.type.includes('RegExp')));
  assert.ok(input.outputs.some(item => item.alias === 'valueChange' && item.generated));
  const range = await registry.component('range-slider');
  assert.ok(range.inputs.some(item => item.inherited));
  assert.ok(data.modules.some(item => item.package.endsWith('/temporal')));
  await assert.rejects(registry.get('99.0.0'), { code: 'VERSION_UNAVAILABLE' });
  await assert.rejects(registry.example('input', 'invented'), { code: 'UNKNOWN_VARIANT' });
});

test('registry detects modified snapshot bytes and reloads after its TTL', async t => {
  const { root } = await isolated(t);
  const filename = path.join(root, 'registry.json');
  await writeFile(filename, await readFile(registry.filename));
  const local = new Registry(filename, 0);
  await local.get();
  const record = JSON.parse(await readFile(filename, 'utf8'));
  record.snapshot.version = '99.0.0';
  await writeFile(filename, JSON.stringify(record));
  await assert.rejects(local.get(), { code: 'INVALID_REGISTRY' });
});

test('themes derive complete readable modes, reject unknown tokens and flag invalid overrides', async () => {
  const snapshot = await registry.get();
  for (const brand of ['#00c474', '#ffffff', '#000000', '#fa00ff', '#124acc']) {
    const theme = createTheme({ brand }, snapshot);
    assert.ok(theme.checks.every(check => check.passed), JSON.stringify(theme.checks));
    for (const token of snapshot.tokens) assert.ok(token.name in theme.light && token.name in theme.dark);
    assert.ok(contrast(theme.light['color-on-brand'], theme.light['color-brand']) >= 4.5);
  }
  assert.throws(() => createTheme({ overrides: { invented: '#000000' } }, snapshot), { code: 'UNKNOWN_TOKEN' });
  const invalid = createTheme({ overrides: { 'color-text': '#ffffff' } }, snapshot);
  assert.ok(invalid.diagnostics.some(item => item.severity === 'error'));
});

test('schemas reject traversal, duplicate pages and unsupported configuration', () => {
  for (const directory of ['../outside', '/absolute', 'a/../../outside', 'a\\outside', 'a//b']) assert.equal(uiSpecSchema.safeParse({ ...spec, output: { directory } }).success, false);
  assert.equal(uiSpecSchema.safeParse({ ...spec, pages: [] }).success, false);
  assert.equal(uiSpecSchema.safeParse({ ...spec, pages: [{ id: 'x', recipe: 'login' }, { id: 'x', recipe: 'login' }] }).success, false);
  assert.equal(uiSpecSchema.safeParse({ ...spec, target: { angularMajor: 21 } }).success, false);
});

test('generation is reviewable, persistent and idempotent; user edits and stale plans are preserved', async t => {
  const { root, workspace, generator } = await isolated(t);
  const generated = await generator.generate(spec);
  await assert.rejects(readFile(path.join(root, 'apps/admin/package.json')), { code: 'ENOENT' });
  const applied = await workspace.apply(generated.changesetId);
  assert.ok(applied.written.length > 10);
  assert.equal((await workspace.apply(generated.changesetId)).written.length, 0);
  const repeated = await generator.generate(spec);
  assert.equal((await workspace.apply(repeated.changesetId)).written.length, 0);
  const next = await generator.generate({ ...spec, title: 'Updated' });
  const filename = path.join(root, 'apps/admin/src/app/app.component.ts');
  await writeFile(filename, '// user edit\n' + await readFile(filename, 'utf8'));
  await assert.rejects(workspace.apply(next.changesetId), { code: 'STALE_CHANGESET' });
  await assert.rejects(generator.generate(spec), { code: 'USER_CHANGES' });
  assert.match(await readFile(filename, 'utf8'), /user edit/);
});

test('theme updates preserve ownership and custom page logic', async t => {
  const { root, workspace, generator } = await isolated(t);
  const generated = await generator.generate(spec); await workspace.apply(generated.changesetId);
  const filename = path.join(root, 'apps/admin/src/app/users.component.ts');
  await writeFile(filename, '// custom behavior\n' + await readFile(filename, 'utf8'));
  const update = await generator.updateTheme(generated.artifactId, { brand: '#4455dd' });
  await workspace.apply(update.changesetId);
  assert.match(await readFile(filename, 'utf8'), /custom behavior/);
  const artifact = await workspace.load('artifacts', generated.artifactId);
  assert.ok(artifact.fileHashes['apps/admin/src/app/users.component.ts']);
});

test('workspace rejects symlink escape before creating any generated files', async t => {
  const { root, generator } = await isolated(t);
  const outside = await mkdtemp(path.join(tmpdir(), 'sq-ui-outside-'));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await symlink(outside, path.join(root, 'escape'));
  await assert.rejects(generator.generate({ ...spec, output: { directory: 'escape/admin' } }), { code: 'SYMLINK_PATH' });
  await assert.rejects(readFile(path.join(outside, 'admin/package.json')), { code: 'ENOENT' });
});

test('route merging uses the routes AST, keeps unrelated code and detects conflicts', () => {
  const original = "import { Routes } from '@angular/router';\nexport const appRoutes: Routes = [{path: 'home', redirectTo: 'welcome'}];\nconst other = [1, 2];\n";
  const result = mergeRoutes(original, 'src/app/routes.ts', 'src/app/generated/routes.ts', 'admin');
  assert.match(result, /sqUiRoutes_admin/);
  assert.ok(result.includes("{path: 'home', redirectTo: 'welcome'}"));
  assert.ok(result.includes('const other = [1, 2]'));
  assert.equal(mergeRoutes(result, 'src/app/routes.ts', 'src/app/generated/routes.ts', 'admin'), result);
  assert.throws(() => mergeRoutes('export const routes = [{path: "admin"}];', 'routes.ts', 'generated/routes.ts', 'admin'), { code: 'ROUTES_CONFLICT' });
});

test('existing-project generation extends chosen routes and styles without replacing the application', async t => {
  const { root, generator, workspace } = await isolated(t);
  await mkdir(path.join(root, 'src/app'), { recursive: true });
  await writeFile(path.join(root, 'package.json'), JSON.stringify({ dependencies: { '@angular/core': '^22.0.0' } }));
  await writeFile(path.join(root, 'src/app/routes.ts'), "export const routes = [{path: 'home', redirectTo: 'welcome'}];\n");
  await writeFile(path.join(root, 'src/styles.scss'), 'body { margin: 0; }\n');
  const generated = await generator.generate({ ...spec, output: { mode: 'existing-project', directory: 'src/app/admin', routesFile: 'src/app/routes.ts', stylesFile: 'src/styles.scss' } });
  await workspace.apply(generated.changesetId);
  assert.match(await readFile(path.join(root, 'src/app/routes.ts'), 'utf8'), /home/);
  assert.match(await readFile(path.join(root, 'src/app/admin/ui-config.ts'), 'utf8'), /\/test-admin/);
  assert.equal(JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).dependencies['@angular/core'], '^22.0.0');
});

test('jobs expose errors and cancellation terminates an owned long-running process', async t => {
  const { root } = await isolated(t);
  const jobs = new Jobs();
  const failed = jobs.start(async () => { throw new Error('expected failure'); });
  assert.equal((await jobs.wait(failed.id)).status, 'failed');
  const job = jobs.start(signal => runCommand(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], root, signal));
  await new Promise(resolve => setTimeout(resolve, 30));
  jobs.cancel(job.id);
  const result = await jobs.wait(job.id);
  assert.equal(result.status, 'cancelled');
  assert.equal(result.result.status, 'failed');
  jobs.close();
});
