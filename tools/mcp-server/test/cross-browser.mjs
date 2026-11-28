import assert from 'node:assert/strict';
import { fixture } from './helpers.mjs';
import { Runner } from '../build/index.js';

const { workspace, generated } = await fixture('localized-validation', {
  mode: 'application', title: 'Работно пространство', locale: 'bg-BG', direction: 'rtl',
  pages: [{ id: 'home', recipe: 'dashboard-summary' }, { id: 'people', recipe: 'crud-list' }, { id: 'preferences', recipe: 'settings-form' }]
});
const runner = new Runner(workspace);
const signal = new AbortController().signal;
try {
  const build = await runner.validate(generated.artifactId, signal);
  if (build.status !== 'passed') console.error(JSON.stringify(build, null, 2));
  assert.equal(build.status, 'passed');
  for (const engine of ['firefox', 'webkit']) {
    const report = await runner.preview(generated.artifactId, { engine, widths: [390, 1440], modes: ['light', 'dark'], routes: ['home', 'people', 'preferences'] }, signal);
    if (report.status !== 'passed') console.error(JSON.stringify(report.checks.filter(check => check.status !== 'passed'), null, 2));
    assert.equal(report.status, 'passed', `${engine}: custom routes, Bulgarian and RTL pages`);
    console.log(`${engine}: 12 localized RTL page/theme/viewport checks passed.`);
  }
} finally { runner.close(); }
