import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fixture, registry, root } from './helpers.mjs';
import { fullExample, runCommand } from '../build/index.js';

const { absolute } = await fixture('catalog-validation', { mode: 'example', component: 'input' });
let count = 0;
for (const demo of (await registry.get()).examples) for (const variant of demo.variants) {
  const directory = path.join(absolute, 'src/catalog', demo.id, variant.id);
  await mkdir(directory, { recursive: true });
  const example = fullExample(demo, variant);
  await writeFile(path.join(directory, 'example.component.ts'), example.typescript);
  await writeFile(path.join(directory, 'example.component.html'), example.html);
  count += 1;
}
const result = await runCommand(process.execPath, [path.join(root, 'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js'), '-p', 'tsconfig.json', '--noEmit'], absolute, new AbortController().signal);
if (result.status !== 'passed') console.error(result.output);
assert.equal(result.status, 'passed', 'All generated examples must pass real strict Angular compilation');
console.log(`Strict Angular compilation passed for all ${count} catalog variants in an isolated consumer.`);
