/** Browser regression checks for projected navbar popovers. Requires a running demo. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const executable = process.env.STYLE_BASELINE_BROWSER;
assert(executable, 'Set STYLE_BASELINE_BROWSER to a Chromium/Chrome executable.');
const base = process.env.STYLE_BASELINE_URL || 'http://127.0.0.1:4201';
const profile = await mkdtemp(join(tmpdir(), 'sq-navbar-check-'));
const browser = spawn(executable, [
  '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`,
  ...(process.getuid?.() === 0 ? ['--no-sandbox'] : []), 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
try {
  const endpoint = await new Promise((resolve, reject) => {
    let log = '';
    const timer = setTimeout(() => reject(new Error('Browser startup timed out.')), 15000);
    browser.on('error', error => { clearTimeout(timer); reject(error); });
    browser.on('exit', code => { clearTimeout(timer); reject(new Error(`Browser exited: ${code}. ${log}`)); });
    browser.stderr.on('data', chunk => {
      log += chunk;
      const match = log.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  const devtools = endpoint.replace('ws:', 'http:').split('/devtools/')[0];
  const pages = await (await fetch(`${devtools}/json/list`)).json();
  socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timer);
    if (message.error) request.reject(new Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  });
  const cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`CDP timed out: ${method}`));
    }, 15000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const waitFor = async expression => {
    for (let attempt = 0; attempt < 80; attempt++) {
      if (await evaluate(expression)) return;
      await delay(100);
    }
    throw new Error(`Condition timed out: ${expression}`);
  };
  const key = async keyName => {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code: keyName });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code: keyName });
  };
  await cdp('Page.enable');
  for (const width of [390, 320]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 1100, deviceScaleFactor: 1, mobile: false });
    await cdp('Page.navigate', { url: 'about:blank' });
    await cdp('Page.navigate', { url: `${base}/#/embed/navbar` });
    await waitFor("!!document.querySelector('sq-navbar sq-dropdown [role=combobox]')");
    await evaluate('document.fonts.ready');
    const toggle = "document.querySelector('sq-navbar .navbar-toggle')";
    const inner = "document.querySelector('sq-navbar .navbar-panel-inner')";
    const combo = "document.querySelector('sq-navbar [role=combobox]')";
    const nav = "document.querySelector('sq-navbar .navbar')";
    const closedHeight = await evaluate(`${nav}.getBoundingClientRect().height`);
    await evaluate(`${toggle}.click()`);
    await delay(60);
    const intermediateHeight = await evaluate(`${nav}.getBoundingClientRect().height`);
    assert.equal(await evaluate(`getComputedStyle(${inner}).overflow`), 'hidden');
    await waitFor(`getComputedStyle(${inner}).overflow === 'visible'`);
    const openHeight = await evaluate(`${nav}.getBoundingClientRect().height`);
    assert(intermediateHeight > closedHeight && intermediateHeight < openHeight, 'Expansion must animate.');

    await evaluate(`${combo}.focus(); ${combo}.click()`);
    await waitFor("!!document.querySelector('sq-navbar [role=listbox]')");
    const option = await evaluate(`(() => {
      const e = document.querySelectorAll('sq-navbar [role=option]')[1];
      const r = e.getBoundingClientRect();
      const wrapper = ${inner}.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2,
        belowWrapper: r.top >= wrapper.bottom,
        hittable: e.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)) };
    })()`);
    assert(option.belowWrapper, 'The option must exercise overflow beyond the animation wrapper.');
    assert(option.hittable, 'Projected dropdown options must remain clickable.');
    await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: option.x, y: option.y, button: 'left', clickCount: 1 });
    await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: option.x, y: option.y, button: 'left', clickCount: 1 });
    await waitFor("document.querySelector('sq-navbar .chosen-item').textContent.trim() === 'Engineering'");

    await evaluate(`${combo}.focus(); ${combo}.click()`);
    await waitFor(`${combo}.getAttribute('aria-expanded') === 'true'`);
    await key('Escape');
    await waitFor(`${combo}.getAttribute('aria-expanded') === 'false'`);
    assert.equal(await evaluate(`${toggle}.getAttribute('aria-expanded')`), 'true');
    assert(await evaluate(`document.activeElement === ${combo}`));
    await key('Escape');
    await waitFor(`${toggle}.getAttribute('aria-expanded') === 'false'`);
    assert(await evaluate(`document.activeElement === ${toggle}`));
    await delay(250);
    assert.equal(await evaluate(`${nav}.getBoundingClientRect().height`), closedHeight);

    await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await evaluate(`${toggle}.click()`);
    await waitFor(`getComputedStyle(${inner}).overflow === 'visible'`);
    assert.equal(await evaluate(`getComputedStyle(${inner}).animationName`), 'none');
    assert.equal(await evaluate("getComputedStyle(document.querySelector('sq-navbar .navbar-panel')).transitionDuration"), '0s');
    assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
    await cdp('Emulation.setEmulatedMedia', { features: [] });
    console.log(`Navbar ${width}px: animation, popup pointer selection, nested Escape and reduced motion passed.`);
  }
} finally {
  socket?.close();
  if (browser.exitCode === null && browser.signalCode === null && browser.pid) {
    await new Promise(resolve => { browser.once('exit', resolve); browser.kill(); });
  }
  await rm(profile, { recursive: true, force: true, maxRetries: 3 });
}
