import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { root, packageDirectory } from './helpers.mjs';

const exec = promisify(execFile);
const output = path.join(root, '.sq-ui-mcp/releases');
await mkdir(output, { recursive: true });
const result = await exec('npm', ['pack', '--pack-destination', output, '--json'], { cwd: packageDirectory, maxBuffer: 4 * 1024 * 1024 });
// npm can forward lifecycle output; releases emit either an array or a package-name map.
const jsonStart = Math.max(result.stdout.lastIndexOf('\n['), result.stdout.lastIndexOf('\n{'));
const packed = JSON.parse(jsonStart < 0 ? result.stdout : result.stdout.slice(jsonStart + 1));
const metadata = Array.isArray(packed) ? packed[0] : packed['@sq-ui/mcp'] ?? packed;
const filenames = metadata.files.map(file => file.path);
for (const required of ['build/cli.js', 'content/registry.json', 'content/schemas/ui-spec.json', 'skills/sq-ui/SKILL.md', 'skills/sq-ui-admin/SKILL.md', 'mcp.json', 'plugin.json', 'LICENSE']) assert.ok(filenames.includes(required), required);
assert.equal(filenames.filter(file => /^skills\/[^/]+\/SKILL.md$/.test(file)).length, 18);
assert.equal(filenames.some(file => file.includes('node_modules/')), false);
const consumer = await mkdtemp(path.join(tmpdir(), 'sq-ui-package-'));
let client;
try {
  await exec('npm', ['install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund', path.join(output, metadata.filename)], { cwd: consumer, maxBuffer: 4 * 1024 * 1024 });
  const cli = path.join(consumer, 'node_modules/@sq-ui/mcp/build/cli.js');
  const doctor = await exec(process.execPath, [cli, 'doctor'], { cwd: consumer });
  assert.equal(JSON.parse(doctor.stdout).ok, true);
  client = new Client({ name: 'installed-package-test', version: '1.0.0' });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [cli], cwd: consumer, stderr: 'pipe' }));
  const response = await client.callTool({ name: 'get_component_example', arguments: { id: 'dropdown' } });
  assert.equal(response.structuredContent.ok, true);
  console.log(`Package verified outside the repository: ${metadata.filename}; ${metadata.files.length} files, ${metadata.size} compressed bytes, 18 skills and a working MCP connection.`);
  console.log(`Local release: ${path.join(output, metadata.filename)}`);
} finally { await client?.close(); await rm(consumer, { recursive: true, force: true }); }
