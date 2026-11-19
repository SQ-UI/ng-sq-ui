/** Browser regression checks for card section corners and projected popovers. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const executable = process.env.STYLE_BASELINE_BROWSER;
assert(executable, 'Set STYLE_BASELINE_BROWSER to a Chromium/Chrome executable.');
const base = process.env.STYLE_BASELINE_URL || 'http://127.0.0.1:4201';
const profile = await mkdtemp(join(tmpdir(), 'sq-card-check-'));
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
  await cdp('Page.enable');
  for (const width of [1440, 390, 320]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 1100, deviceScaleFactor: 1, mobile: false });
    await cdp('Page.navigate', { url: 'about:blank' });
    await cdp('Page.navigate', { url: `${base}/#/embed/card` });
    await waitFor("document.querySelectorAll('sq-card').length === 5");
    const result = await evaluate(`(${(() => {
      const errors = [];
      const check = (condition, message) => { if (!condition) errors.push(message); };
      // Clone the rendered wrappers, retaining Angular's style attributes, to
      // exercise every slot combination without adding test UI to the demo.
      const card = document.querySelector('sq-card').cloneNode(true);
      const fixture = document.createElement('div');
      fixture.style.cssText = 'position:fixed;left:24px;top:24px;z-index:10000;background:white';
      fixture.style.width = Math.min(280, innerWidth - 96) + 'px';
      document.body.appendChild(fixture);
      fixture.appendChild(card);
      card.style.setProperty('--sq-card-border-radius', '24px');
      card.style.setProperty('--sq-card-media-border-radius', '9px');
      const sections = [...card.children];
      const names = ['header', 'media', 'content', 'actions', 'footer'];
      names.forEach(name => card.style.setProperty('--sq-card-' + name + '-background', '#ff0000'));
      sections.forEach(section => { section.style.minHeight = '60px'; });
      let cases = 0;
      for (const appearance of ['outlined', 'elevated', 'filled']) {
        card.dataset.appearance = appearance;
        for (let mask = 0; mask < 32; mask++) {
          const label = appearance + ' slots=' + mask;
          sections.forEach((section, index) => {
            section.replaceChildren();
            if (mask & (1 << index)) section.appendChild(document.createElement('span'));
          });
          const visible = sections.filter(section => getComputedStyle(section).display !== 'none');
          const expected = sections.filter((_, index) => mask & (1 << index));
          check(visible.length === expected.length, label + ': empty sections must be hidden');
          visible.forEach((section, index) => {
            const style = getComputedStyle(section);
            const interior = section.classList.contains('card-media') ? '9px' : '0px';
            check(style.borderTopLeftRadius === (index === 0 ? '24px' : interior), label + ': top left');
            check(style.borderTopRightRadius === (index === 0 ? '24px' : interior), label + ': top right');
            check(style.borderBottomLeftRadius === (index === visible.length - 1 ? '24px' : interior), label + ': bottom left');
            check(style.borderBottomRightRadius === (index === visible.length - 1 ? '24px' : interior), label + ': bottom right');
          });
          if (visible.length) {
            const rect = card.getBoundingClientRect();
            for (const [x, y] of [
              [rect.left + 3, rect.top + 3], [rect.right - 3, rect.top + 3],
              [rect.left + 3, rect.bottom - 3], [rect.right - 3, rect.bottom - 3],
            ]) {
              const hit = document.elementFromPoint(x, y);
              check(!visible.some(section => section.contains(hit)), label + ': section paints outside a rounded corner');
            }
          }
          cases++;
        }
      }
      // Removing a section must immediately transfer its outer corners.
      sections.forEach(section => section.replaceChildren(document.createElement('span')));
      sections[0].replaceChildren();
      check(getComputedStyle(sections[1]).borderTopLeftRadius === '24px', 'removed header: media gains top corners');
      sections[4].replaceChildren();
      check(getComputedStyle(sections[3]).borderBottomRightRadius === '24px', 'removed footer: actions gain bottom corners');
      for (const index of [0, 2, 3, 4]) {
        sections.forEach(section => section.replaceChildren());
        const section = sections[index];
        section.style.position = 'relative';
        const popup = document.createElement('button');
        popup.textContent = 'Popup';
        popup.style.cssText = 'position:absolute;left:calc(100% + 8px);top:0;width:24px;height:24px;padding:0';
        section.appendChild(popup);
        const rect = popup.getBoundingClientRect();
        check(rect.left > card.getBoundingClientRect().right, names[index] + ': popup must extend outside the card');
        check(document.elementFromPoint(rect.x + 12, rect.y + 12) === popup, names[index] + ': popup must remain hittable');
        check(getComputedStyle(card).overflow === 'visible', names[index] + ': host overflow');
        section.style.removeProperty('position');
      }
      fixture.remove();
      return { errors, cases };
    }).toString()})()`);
    assert.equal(result.errors.length, 0, `Card corners at ${width}px:\n${result.errors.slice(0, 8).join('\n')}`);
    console.log(`Cards ${width}px: ${result.cases} appearance/slot combinations, dynamic sections and popup overflow passed.`);
  }
} finally {
  socket?.close();
  if (browser.exitCode === null && browser.signalCode === null && browser.pid) {
    await new Promise(resolve => { browser.once('exit', resolve); browser.kill(); });
  }
  await rm(profile, { recursive: true, force: true, maxRetries: 3 });
}
