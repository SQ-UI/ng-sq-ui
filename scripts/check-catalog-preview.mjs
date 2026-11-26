/** Check the built component explorer with Chromium and no extra dependencies. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const executable = process.env.STYLE_BASELINE_BROWSER;
assert(executable, 'Set STYLE_BASELINE_BROWSER to a Chromium/Chrome executable.');
const base = process.env.STYLE_BASELINE_URL || 'http://127.0.0.1:4201';
const output = resolve(process.env.CATALOG_PREVIEW_OUTPUT || 'tmp/catalog-preview');
await mkdir(output, { recursive: true });
const profile = await mkdtemp(join(tmpdir(), 'sq-catalog-'));
const browser = spawn(executable, [
  '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`,
  ...(process.getuid?.() === 0 || process.env.STYLE_BASELINE_NO_SANDBOX === '1' ? ['--no-sandbox'] : []), 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });
const delay = ms => new Promise(resolveDelay => setTimeout(resolveDelay, ms));
const report = { success: false, configurations: 0, screenshots: [], runtimeErrors: [], checks: [] };
let socket;
try {
  const endpoint = await new Promise((resolveEndpoint, reject) => {
    let log = '';
    const timer = setTimeout(() => reject(new Error('Browser startup timed out.')), 15000);
    browser.on('error', error => { clearTimeout(timer); reject(error); });
    browser.on('exit', code => { clearTimeout(timer); reject(new Error(`Browser exited: ${code}. ${log}`)); });
    browser.stderr.on('data', chunk => {
      log += chunk;
      const match = log.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) { clearTimeout(timer); resolveEndpoint(match[1]); }
    });
  });
  const devtools = endpoint.replace('ws:', 'http:').split('/devtools/')[0];
  const pages = await (await fetch(`${devtools}/json/list`)).json();
  socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolveOpen, reject) => {
    socket.addEventListener('open', resolveOpen, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') report.runtimeErrors.push(message.params.exceptionDetails);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      report.runtimeErrors.push(message.params.args.map(arg => arg.value ?? arg.description).join(' '));
    }
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timer);
    if (message.error) request.reject(new Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  });
  const cdp = (method, params = {}) => new Promise((resolveCall, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timed out: ${method}`)); }, 15000);
    pending.set(id, { resolve: resolveCall, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const waitFor = async expression => {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await evaluate(expression)) return;
      await delay(50);
    }
    const state = await evaluate(`({ hash: location.hash, title: document.querySelector('#configuration-title')?.textContent, selected: document.querySelector('.detail-variants [aria-current]')?.outerHTML })`);
    throw new Error(`Condition timed out: ${expression}\n${JSON.stringify(state)}`);
  };
  const go = async (route, selector) => {
    const hash = '#/' + route;
    const clicked = await evaluate(`(() => {
      const link = Array.from(document.querySelectorAll('.detail-variants a')).find(link => link.getAttribute('href') === ${JSON.stringify(hash)});
      if (!link) return false;
      link.click();
      return true;
    })()`);
    if (!clicked) {
      await cdp('Page.navigate', { url: 'about:blank' });
      await waitFor("location.href === 'about:blank'");
      await cdp('Page.navigate', { url: base + '/' + hash });
    }
    await waitFor(`!!document.querySelector(${JSON.stringify(selector)})`);
    const match = route.match(/^components\/([^?#]+)/);
    if (match) {
      await waitFor(`document.querySelector('.component-detail')?.dataset.component === ${JSON.stringify(match[1])}`);
      const variant = new URL('http://localhost/' + route).searchParams.get('variant');
      if (variant) await waitFor(`document.querySelector('.detail-variants [aria-current]')?.getAttribute('href').includes(${JSON.stringify('variant=' + encodeURIComponent(variant))})`);
    }
    await delay(30);
  };
  const noOverflow = async label => {
    const layout = await evaluate(`(() => {
      const main = document.querySelector('.scrollable');
      return { body: document.documentElement.scrollWidth > innerWidth + 1, main: main.scrollWidth > main.clientWidth + 1 };
    })()`);
    assert.deepEqual(layout, { body: false, main: false }, label);
  };
  const capture = async name => {
    await evaluate('document.fonts.ready');
    const png = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const file = `${name}.png`;
    await writeFile(join(output, file), Buffer.from(png.data, 'base64'));
    report.screenshots.push(file);
  };

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Page.navigate', { url: `${base}/#/components` });
  await waitFor("document.querySelectorAll('.catalog-card').length === 21");

  for (const width of [1440, 960, 390, 320]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 1050, deviceScaleFactor: 1, mobile: false });
    await go('components', '.catalog-card');
    await noOverflow(`Catalog ${width}px`);
    await capture(`catalog-${width}`);
    const links = await evaluate("Array.from(document.querySelectorAll('.catalog-card')).map(link => link.getAttribute('href'))");
    if (width === 1440 || width === 320) {
      for (const link of links) {
        await go(link.replace('#/', ''), '.detail-example');
        await noOverflow(`${link} ${width}px`);
        if (width === 1440) {
          const variants = await evaluate("Array.from(document.querySelectorAll('.detail-variants a:not(.detail-compare)')).map(link => ({ href: link.getAttribute('href'), name: link.textContent.replace('→', '').trim() }))");
          for (const variant of variants) {
            await go(variant.href.replace('#/', ''), '.detail-example');
            assert.equal(await evaluate("document.querySelector('#configuration-title').textContent"), variant.name);
            assert(await evaluate("!!document.querySelector('sq-demo-example') && document.querySelectorAll('.detail-code pre').length === 2"));
            await noOverflow(variant.href);
            report.configurations++;
          }
        }
      }
    }
    for (const id of ['button', 'input', 'datatable', 'datetime-picker']) {
      await go(`components/${id}`, '.detail-example');
      await capture(`${id}-${width}`);
    }
    console.log(`Catalog and component pages passed at ${width}px.`);
  }

  await go('components', '.catalog-search input');
  await evaluate("(() => { const input = document.querySelector('.catalog-search input'); input.value = 'sq-input'; input.dispatchEvent(new Event('input', { bubbles: true })); })()");
  await waitFor("document.querySelectorAll('.catalog-card').length === 1");
  assert((await evaluate('location.hash')).includes('q=sq-input'));
  await evaluate("document.querySelector('.catalog-card').click()");
  await waitFor("!!document.querySelector('sq-input input')");
  await evaluate("(() => { const input = document.querySelector('sq-input input'); input.value = 'Edited name'; input.dispatchEvent(new Event('input', { bubbles: true })); })()");
  await waitFor("document.querySelector('sq-demo-example output').textContent.includes('Edited name')");
  await evaluate("document.querySelector('.detail-reset').click()");
  await waitFor("document.querySelector('sq-input input').value === 'Alex'");
  await evaluate("document.querySelector('.detail-back').click()");
  await waitFor("!!document.querySelector('.catalog-search input')");
  assert.equal(await evaluate("document.querySelector('.catalog-search input').value"), 'sq-input');
  report.checks.push('Search, filter-preserving navigation, editable value and reset');

  await go('components/modal?variant=large', '.detail-example');
  await evaluate("document.querySelector('sq-demo-example .example-trigger').click()");
  await waitFor("!!document.querySelector('sq-modal .modal-cover:not(.display-none)')");
  assert.equal(await evaluate("document.querySelector('sq-modal .modal-window').dataset.size"), 'large');
  await capture('modal-open-320');
  await evaluate("document.querySelector('sq-modal .close').click()");
  await waitFor("document.querySelector('sq-demo-example output').textContent.includes('Dialog closed')");
  report.checks.push('Large dialog opens and closes on mobile');

  await go('components/button', '.detail-compare');
  await evaluate("document.querySelector('.detail-compare').click()");
  await waitFor("!!document.querySelector('#previewButtons')");
  const anchorPosition = await evaluate("document.querySelector('#previewButtons').getBoundingClientRect().top");
  assert(anchorPosition >= 64 && anchorPosition < 150, `Playground anchor position: ${anchorPosition}`);
  report.checks.push('Playground comparison scrolls to the selected component');
  assert.deepEqual(report.runtimeErrors, []);
  report.success = true;
  console.log(`${report.configurations} live configurations, responsive layouts and interactions passed.`);
} finally {
  await writeFile(join(output, 'manifest.json'), JSON.stringify(report, null, 2) + '\n');
  socket?.close();
  browser.kill();
  await delay(200);
  await rm(profile, { recursive: true, force: true, maxRetries: 3 });
}
