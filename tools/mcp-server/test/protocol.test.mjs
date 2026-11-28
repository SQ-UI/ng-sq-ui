import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';

const cli = fileURLToPath(new URL('../build/cli.js', import.meta.url));
test('a modern SDK client discovers tools, resources, prompts and versioned examples', async t => {
  const transport = new StdioClientTransport({ command: process.execPath, args: [cli], stderr: 'pipe' });
  const client = new Client({ name: 'sq-ui-modern-test', version: '1.0.0' });
  t.after(() => client.close());
  await client.connect(transport);
  const tools = await client.listTools();
  for (const name of ['get_overview', 'list_components', 'search_docs', 'get_component_api', 'get_component_example', 'get_migration_guide', 'get_cross_framework_links']) assert.ok(tools.tools.some(tool => tool.name === name), name);
  assert.equal(tools.tools.some(tool => tool.name === 'apply_changeset'), false);
  const response = await client.callTool({ name: 'get_overview', arguments: {} });
  assert.equal(response.structuredContent.ok, true);
  assert.equal(response.structuredContent.data.counts.skills, 18);
  const example = await client.callTool({ name: 'get_component_example', arguments: { id: 'input', variant: 'required' } });
  assert.match(example.structuredContent.data.typescript, /InputComponent/);
  const invalid = await client.callTool({ name: 'get_component_api', arguments: { id: 'invented' } });
  assert.equal(invalid.isError, true);
  assert.equal(invalid.structuredContent.error.code, 'UNKNOWN_COMPONENT');
  const resources = await client.listResources();
  assert.ok(resources.resources.some(resource => resource.uri.includes('overview')));
  const resource = await client.readResource({ uri: 'sq-ui://versions/3.0.2/components/input' });
  assert.equal(JSON.parse(resource.contents[0].text).name, 'InputComponent');
  assert.equal((await client.listPrompts()).prompts.length, 5);
});

test('a build-profile client completes plan, generate, apply and export through MCP', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'sq-ui-protocol-'));
  const transport = new StdioClientTransport({ command: process.execPath, args: [cli, '--workspace', root], stderr: 'pipe' });
  const client = new Client({ name: 'sq-ui-builder-test', version: '1.0.0' });
  t.after(async () => { await client.close(); await rm(root, { recursive: true, force: true }); });
  await client.connect(transport);
  const call = async (name, args) => { const response = await client.callTool({ name, arguments: args }); assert.equal(response.structuredContent.ok, true, JSON.stringify(response.structuredContent)); return response.structuredContent.data; };
  const spec = { mode: 'example', component: 'dropdown', output: { directory: 'example' } };
  const plan = await call('plan_ui', { spec });
  assert.equal(plan.spec.target.angularMajor, 22);
  const generated = await call('generate_ui', { spec });
  await call('apply_changeset', { id: generated.changesetId });
  assert.match(await readFile(path.join(root, 'example/src/app/example.component.html'), 'utf8'), /sq-dropdown/);
  const exported = await call('export_artifact', { artifactId: generated.artifactId, format: 'tar.gz' });
  assert.ok((await readFile(exported.filename)).length > 100);
});

test('an independent legacy JSON-RPC client can initialize and call tools over stdio', async t => {
  const processHandle = spawn(process.execPath, [cli], { stdio: ['pipe', 'pipe', 'pipe'] });
  t.after(() => processHandle.kill());
  const pending = new Map();
  const lines = createInterface({ input: processHandle.stdout });
  lines.on('line', line => { const response = JSON.parse(line); if (response.id !== undefined) { pending.get(response.id)?.(response); pending.delete(response.id); } });
  let id = 0;
  const request = (method, params) => new Promise((resolve, reject) => {
    const requestId = ++id;
    const timeout = setTimeout(() => { pending.delete(requestId); reject(new Error(`Timed out: ${method}`)); }, 10000);
    pending.set(requestId, response => { clearTimeout(timeout); resolve(response); });
    processHandle.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: requestId, method, params }) + '\n');
  });
  const initialized = await request('initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'sq-ui-raw-test', version: '1.0.0' } });
  assert.ok(initialized.result.serverInfo);
  processHandle.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  const tools = await request('tools/list', {});
  assert.ok(tools.result.tools.some(tool => tool.name === 'get_overview'));
  const result = await request('tools/call', { name: 'get_component_api', arguments: { id: 'button' } });
  assert.equal(result.result.structuredContent.data.name, 'ButtonComponent');
  processHandle.stdin.end();
});
