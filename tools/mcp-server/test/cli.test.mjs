import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm, readFile, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'smol-toml';

const exec = promisify(execFile);
const cli = fileURLToPath(new URL('../build/cli.js', import.meta.url));
test('client initialization preserves existing settings and is idempotent for all supported formats', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'sq-ui-init-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const formats = { cursor: '.cursor/mcp.json', vscode: '.vscode/mcp.json', 'claude-code': '.mcp.json', 'claude-desktop': 'claude_desktop_config.json', windsurf: '.codeium/windsurf/mcp_config.json', opencode: 'opencode.json', codex: '.codex/config.toml' };
  for (const [client, file] of Object.entries(formats)) {
    const directory = path.join(root, client);
    const filename = path.join(directory, file);
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, client === 'codex' ? '[mcp_servers.existing]\ncommand = "keep-me"\n' : JSON.stringify({ preference: 'keep-me' }));
    const args = [cli, 'init', '--client', client, '--directory', directory, '--workspace', root];
    await exec(process.execPath, args);
    const first = await readFile(filename, 'utf8');
    await exec(process.execPath, args);
    assert.equal(await readFile(filename, 'utf8'), first);
    const value = client === 'codex' ? parse(first) : JSON.parse(first);
    if (client === 'codex') assert.equal(value.mcp_servers.existing.command, 'keep-me');
    else assert.equal(value.preference, 'keep-me');
    const servers = value[client === 'codex' ? 'mcp_servers' : client === 'vscode' ? 'servers' : client === 'opencode' ? 'mcp' : 'mcpServers'];
    assert.ok(servers['sq-ui']);
  }
});

test('initialization refuses conflicting servers and keeps their exact contents', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'sq-ui-conflict-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, '.cursor'));
  const filename = path.join(root, '.cursor/mcp.json');
  const content = '{ "mcpServers": { "sq-ui": { "command": "custom-server" } } }\n';
  await writeFile(filename, content);
  await assert.rejects(exec(process.execPath, [cli, 'init', '--client', 'cursor', '--directory', root]), error => error.stderr.includes('CONFIG_CONFLICT'));
  assert.equal(await readFile(filename, 'utf8'), content);
});
