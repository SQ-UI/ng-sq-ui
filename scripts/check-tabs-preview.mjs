/** Browser regression checks for tabs accessibility, content preservation and responsive layouts. Requires a running demo. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const executable = process.env.STYLE_BASELINE_BROWSER;
assert(executable, 'Set STYLE_BASELINE_BROWSER to a Chromium/Chrome executable.');
const base = process.env.STYLE_BASELINE_URL || 'http://127.0.0.1:4201';
const profile = await mkdtemp(join(tmpdir(), 'sq-tabs-check-'));
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
    const state = await evaluate(`({ focus: document.activeElement?.outerHTML,
      tabs: [...document.querySelectorAll('[data-tabs-example=workspace] [role=tab]')].map(e => ({ text: e.textContent, selected: e.getAttribute('aria-selected'), disabled: e.disabled })) })`);
    throw new Error(`Condition timed out: ${expression}\n${JSON.stringify(state)}`);
  };
  const key = async (keyName, shift = false) => {
    const codes = { Tab: 9, Enter: 13, ' ': 32, Home: 36, End: 35, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, Delete: 46 };
    const event = { key: keyName, windowsVirtualKeyCode: codes[keyName], modifiers: shift ? 8 : 0 };
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', ...event });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', ...event });
  };
  await cdp('Page.enable');
  await cdp('Page.bringToFront');
  await cdp('Emulation.setFocusEmulationEnabled', { enabled: true });
  await cdp('Runtime.enable');
  const runtimeErrors = [];
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails);
  });
  const workspace = "document.querySelector('[data-tabs-example=workspace]')";
  const tabs = `${workspace}.querySelectorAll('[role=tab]')`;
  const selected = `${workspace}.querySelector('[role=tab][aria-selected=true]')`;
  const list = `${workspace}.querySelector('[role=tablist]')`;
  const toggle = index => `document.querySelectorAll('.toggles input')[${index}].click()`;
  const output = process.env.TABS_PREVIEW_OUTPUT || 'tmp/tabs-preview';
  await mkdir(output, { recursive: true });
  for (const width of [1440, 390, 320]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 1100, deviceScaleFactor: 1, mobile: false });
    await cdp('Page.navigate', { url: 'about:blank' });
    await cdp('Page.navigate', { url: `${base}/#/embed/tabs` });
    await waitFor(`${workspace} && ${tabs}.length === 4 && !!${selected}`);
    await evaluate('document.fonts.ready');
    assert(await evaluate(`[...document.querySelectorAll('.toggles input')].every(input => getComputedStyle(input).appearance !== 'none' && input.getBoundingClientRect().width >= 14)`), 'Example settings must have visible checkboxes');
    assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `Page overflows at ${width}px`);
    assert(await evaluate(`(() => {
      const all = [...document.querySelectorAll('[id]')].map(e => e.id);
      return new Set(all).size === all.length && [...${tabs}].every(tab => {
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        return panel?.getAttribute('aria-labelledby') === tab.id && panel.hidden === (tab.getAttribute('aria-selected') !== 'true');
      });
    })()`));

    // Automatic activation, disabled skipping, wrapping and keyboard focus styling.
    await evaluate(`${tabs}[2].focus()`);
    await waitFor(`${selected}.textContent.trim() === 'Settings'`);
    await key('ArrowRight');
    await waitFor(`${selected}.textContent.trim() === 'Overview'`);
    await key('ArrowLeft');
    await waitFor(`${selected}.textContent.trim() === 'Settings'`);
    assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineWidth'), '2px');
    await key('Tab');
    assert.equal(await evaluate('document.activeElement.getAttribute("role")'), 'tabpanel');
    await key('Tab');
    assert.equal(await evaluate('document.activeElement.getAttribute("aria-label")'), 'Project name');

    // A truly lazy panel remains the same instance while preservation is enabled.
    await evaluate(`(() => {
      const input = ${workspace}.querySelector('input[aria-label="Project name"]');
      input.value = 'Preserved draft'; window.tabsInput = input;
      ${tabs}[0].click();
    })()`);
    await waitFor(`${selected}.textContent.trim() === 'Overview'`);
    await evaluate(`${tabs}[2].click()`);
    await waitFor(`${selected}.textContent.trim() === 'Settings'`);
    assert(await evaluate(`${workspace}.querySelector('input[aria-label="Project name"]') === window.tabsInput`));
    assert.equal(await evaluate('window.tabsInput.value'), 'Preserved draft');
    await evaluate(toggle(3));
    await evaluate(`${tabs}[0].click()`);
    await waitFor('!window.tabsInput.isConnected');
    await evaluate(`${tabs}[2].click()`);
    await waitFor(`${selected}.textContent.trim() === 'Settings'`);
    assert.equal(await evaluate(`${workspace}.querySelector('input[aria-label="Project name"]').value`), 'Untitled project');

    // Manual activation must move focus without changing the active panel.
    await evaluate(toggle(2));
    await evaluate(`${tabs}[0].focus(); ${tabs}[0].click()`);
    await waitFor(`${selected}.textContent.trim() === 'Overview'`);
    await key('ArrowRight');
    assert((await evaluate('document.activeElement.textContent')).includes('Activity'));
    assert.equal(await evaluate(`${selected}.textContent.trim()`), 'Overview');
    await key('Enter');
    await waitFor(`${selected}.textContent.includes('Activity')`);

    // Tab must leave the list even when manual focus precedes the selected tab.
    await evaluate(`${tabs}[2].click(); ${tabs}[2].focus()`);
    await waitFor(`${selected}.textContent.trim() === 'Settings'`);
    await key('Home');
    await waitFor(`document.activeElement === ${tabs}[0] && ${tabs}[0].tabIndex === 0`);
    await key('Tab');
    await waitFor(`document.activeElement.getAttribute('role') === 'tabpanel' && ${tabs}[2].tabIndex === 0`);
    await key('Tab', true);
    await waitFor(`document.activeElement === ${tabs}[2]`);

    // Shift+Tab leaves through the preceding control, then reentry uses selection.
    await evaluate(`${tabs}[0].click(); ${tabs}[0].focus()`);
    await waitFor(`${selected}.textContent.trim() === 'Overview'`);
    await key('End');
    await waitFor(`document.activeElement === ${tabs}[2] && ${tabs}[2].tabIndex === 0`);
    await key('Tab', true);
    await waitFor(`document.activeElement === ${workspace}.querySelector('.add-tab') && ${tabs}[0].tabIndex === 0`);
    await key('Tab');
    await waitFor(`document.activeElement === ${tabs}[0]`);

    // Disabling a group with unselected manual focus recovers to its container.
    await key('ArrowRight');
    await waitFor(`document.activeElement === ${tabs}[1] && ${tabs}[1].tabIndex === 0`);
    await evaluate(toggle(5));
    await waitFor(`document.activeElement === ${workspace}.querySelector('.tabs')`);
    assert(await evaluate(`[...${tabs}].every(tab => tab.disabled && tab.tabIndex === -1)`));
    assert.equal(await evaluate(`${selected}.textContent.trim()`), 'Overview');
    await evaluate(toggle(5));
    await waitFor(`!${tabs}[0].disabled`);
    await evaluate(toggle(2));

    // Explicit RTL reverses the horizontal arrow direction.
    await evaluate(toggle(1));
    await evaluate(`${tabs}[0].focus()`);
    await key('ArrowRight');
    await waitFor(`${selected}.textContent.trim() === 'Settings'`);
    await evaluate(toggle(1));

    for (let appearance = 0; appearance < 3; appearance++) {
      await evaluate(`document.querySelectorAll('.choices button')[${appearance}].click()`);
      for (let size = 0; size < 3; size++) {
        await evaluate(`document.querySelectorAll('.choices button')[${size + 3}].click()`);
        await waitFor(`${tabs}[0].getBoundingClientRect().height >= ${[32, 40, 48][size]}`);
        assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
      }
      await evaluate(toggle(0));
      await waitFor(`${list}.getAttribute('aria-orientation') === 'vertical'`);
      await evaluate(`${tabs}[0].focus()`);
      await key('ArrowDown');
      await waitFor(`${selected}.textContent.includes('Activity')`);
      assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Vertical tabs overflow');
      await evaluate(toggle(0));
    }

    // Disable all headers while retaining the selected panel.
    await evaluate(toggle(5));
    await waitFor(`[...${tabs}].every(tab => tab.disabled)`);
    assert.equal(await evaluate(`${workspace}.querySelectorAll('[role=tabpanel]:not([hidden])').length`), 1);
    await evaluate(toggle(5));

    // A long list scrolls its selected header into view, including in RTL.
    await evaluate(`for (let i = 0; i < 8; i++) ${workspace}.querySelector('.add-tab').click()`);
    await waitFor(`${tabs}.length === 12`);
    assert(await evaluate(`${list}.scrollWidth > ${list}.clientWidth`));
    const inView = `(() => { const r = ${selected}.getBoundingClientRect(); const l = ${list}.getBoundingClientRect(); return r.left >= l.left - 1 && r.right <= l.right + 1; })()`;
    await waitFor(inView);
    await evaluate(toggle(1));
    await evaluate(`${tabs}[0].focus()`);
    await key('ArrowRight');
    await waitFor(`${selected}.textContent.trim() === 'Document 8'`);
    await waitFor(inView);
    await evaluate(toggle(1));

    // Closing a focused tab returns focus to its neighbor; no nested buttons.
    await evaluate(`${selected}.focus()`);
    await key('Delete');
    await waitFor(`${tabs}.length === 11`);
    assert.equal(await evaluate('document.activeElement.getAttribute("role")'), 'tab');
    assert.equal(await evaluate('document.querySelectorAll("button button").length'), 0);
    assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'));

    // In manual mode, reveal the focused replacement rather than the distant selection.
    await evaluate(toggle(2));
    const focusInView = `(() => {
      const f = document.activeElement, r = f.getBoundingClientRect(), l = ${list}.getBoundingClientRect();
      return f.getAttribute('role') === 'tab' && r.left >= l.left - 1 && r.right <= l.right + 1;
    })()`;
    for (let rtl = 0; rtl < 2; rtl++) {
      if (rtl) await evaluate(toggle(1));
      await evaluate(`${tabs}[0].click(); ${tabs}[0].focus()`);
      await waitFor(`${selected}.textContent.trim() === 'Overview'`);
      await key('End');
      await waitFor(`document.activeElement === ${tabs}[${10 - rtl}] && document.activeElement.tabIndex === 0`);
      await key('Delete');
      await waitFor(`${tabs}.length === ${10 - rtl}`);
      await waitFor(`document.activeElement.textContent.trim() === 'Document ${6 - rtl}'`);
      await waitFor(focusInView);
      assert.equal(await evaluate(`${selected}.textContent.trim()`), 'Overview');
    }

    // Save a clean, default-state screenshot for visual inspection.
    await cdp('Page.navigate', { url: 'about:blank' });
    await cdp('Page.navigate', { url: `${base}/#/embed/tabs` });
    await waitFor(`${workspace} && ${tabs}.length === 4 && !!${selected}`);
    await evaluate('document.fonts.ready');
    const screenshot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(join(output, `tabs-${width}.png`), Buffer.from(screenshot.data, 'base64'));
    console.log(`Tabs ${width}px: ARIA, keyboard/Tab exits, lazy preservation, appearances/sizes, vertical/RTL, overflow and manual close/disable focus passed.`);
  }
  assert.deepEqual(runtimeErrors, [], 'The demo must not report runtime exceptions.');
} finally {
  socket?.close();
  if (browser.exitCode === null && browser.signalCode === null && browser.pid) {
    await new Promise(resolve => { browser.once('exit', resolve); browser.kill(); });
  }
  await rm(profile, { recursive: true, force: true, maxRetries: 3 });
}
