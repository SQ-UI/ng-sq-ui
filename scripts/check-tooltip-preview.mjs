/** Verify real tooltip geometry and interactions against a running demo. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Build and serve the demo first. Override TOOLTIP_BASE_URL and TOOLTIP_BROWSER as needed.
const base = process.env.TOOLTIP_BASE_URL || 'http://127.0.0.1:4201';
const profile = await mkdtemp(join(tmpdir(), 'sq-tooltip-'));
const browser = spawn(process.env.TOOLTIP_BROWSER || 'chromium', [
  '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
], { stdio: 'ignore' });
let launchError;
browser.on('error', error => { launchError = error; });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
let nextId = 0;
const pending = new Map();
const errors = [];
const checks = [];

function cdp(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 15000);
    pending.set(id, {
      resolve: result => { clearTimeout(timeout); resolve(result); },
      reject: error => { clearTimeout(timeout); reject(error); },
    });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}

async function waitFor(expression) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await evaluate(expression)) return;
    await delay(50);
  }
  throw new Error(`Not ready: ${expression}`);
}

async function bounds() {
  return evaluate(`(() => {
    const e=document.querySelector('[role=tooltip]');
    if(!e) throw new Error('Missing tooltip');
    const r=e.getBoundingClientRect();
    return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,
      position:e.dataset.position,visible:getComputedStyle(e).visibility,parent:e.parentElement.tagName,
      scrollHeight:e.scrollHeight,clientHeight:e.clientHeight};
  })()`);
}

function assertInside(rect, width, height) {
  assert(rect.left >= 7.5 && rect.top >= 7.5, JSON.stringify(rect));
  assert(rect.right <= width - 7.5 && rect.bottom <= height - 7.5, JSON.stringify(rect));
  assert.equal(rect.visible, 'visible');
  assert.equal(rect.parent, 'BODY');
}

try {
  let port;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (launchError) throw launchError;
    try { port = Number((await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); break; }
    catch { await delay(50); }
  }
  assert(port, 'Browser did not start');
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve);
    socket.addEventListener('error', reject);
  });
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const call = pending.get(message.id);
      if (!call) return;
      pending.delete(message.id);
      if (message.error) call.reject(new Error(JSON.stringify(message.error)));
      else call.resolve(message.result);
    } else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
  });
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Page.bringToFront');
  await cdp('Emulation.setFocusEmulationEnabled', { enabled: true });

  for (const [width, height] of [[1440, 900], [390, 640], [320, 480]]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await cdp('Page.navigate', { url: `${base}/#/sq-common` });
    await waitFor('!!document.querySelector("[data-tooltip-position]")');
    await evaluate('document.fonts.ready.then(()=>true)');
    const cases = [
      ['center', (width - 80) / 2, (height - 32) / 2],
      ['top', (width - 80) / 2, 0], ['bottom', (width - 80) / 2, height - 32],
      ['left', 0, (height - 32) / 2], ['right', width - 80, (height - 32) / 2],
      ['top-left', 0, 0], ['top-right', width - 80, 0],
      ['bottom-left', 0, height - 32], ['bottom-right', width - 80, height - 32],
    ];
    for (const preferred of ['top', 'bottom', 'left', 'right']) {
      for (const [edge, left, top] of cases) {
        await evaluate(`(() => {
          document.activeElement?.blur();
          const e=document.querySelector('[data-tooltip-position="${preferred}"]');
          e.style.cssText='position:fixed;z-index:1200;left:${left}px;top:${top}px;width:80px;height:32px';
          e.focus({preventScroll:true});
        })()`);
        try {
          await waitFor('!!document.querySelector("[role=tooltip]")');
        } catch (error) {
          console.error({ width, preferred, edge, errors, state: await evaluate(`(() => {
            const e=document.querySelector('[data-tooltip-position="${preferred}"]');
            return {active:document.activeElement.outerHTML,trigger:e.outerHTML,bounds:e.getBoundingClientRect().toJSON()};
          })()`) });
          throw error;
        }
        const rect = await bounds();
        assertInside(rect, width, height);
        if (edge === preferred) assert.notEqual(rect.position, preferred);
        checks.push({ width, preferred, edge, actual: rect.position });
        await evaluate(`document.activeElement.blur();document.querySelector('[data-tooltip-position="${preferred}"]').removeAttribute('style')`);
      }
    }

    await evaluate(`(() => {
      const e=document.querySelector('[data-tooltip-long]');
      e.style.cssText='position:fixed;left:0;top:0';
      e.style.setProperty('--sq-tooltip-background','rgb(55, 89, 199)');
      e.focus({preventScroll:true});
    })()`);
    assertInside(await bounds(), width, height);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('[role=tooltip]')).backgroundColor`), 'rgb(55, 89, 199)');
    // Change the ancestor's theme while the tooltip is already open, without a resize event.
    await evaluate(`(() => {
      const e=document.querySelector('[data-tooltip-long]');
      e.style.removeProperty('--sq-tooltip-background');
      const root=e.closest('sq-tooltip-preview');
      const style=document.createElement('style');
      style.id='tooltipThemeRegression';
      style.textContent='sq-tooltip-preview[data-theme="tooltip-test"] {--sq-tooltip-background:rgb(120, 30, 60);--sq-font-size-tooltip:16px;--sq-tooltip-padding-block:12px}';
      document.head.append(style);
      root.setAttribute('data-theme','tooltip-test');
    })()`);
    await waitFor(`getComputedStyle(document.querySelector('[role=tooltip]')).backgroundColor==='rgb(120, 30, 60)'`);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('[role=tooltip]')).fontSize`), '16px');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('[role=tooltip]')).paddingTop`), '12px');
    assertInside(await bounds(), width, height);
    await evaluate(`document.querySelector('sq-tooltip-preview').removeAttribute('data-theme');document.getElementById('tooltipThemeRegression').remove()`);
    await waitFor(`getComputedStyle(document.querySelector('[role=tooltip]')).backgroundColor==='rgb(32, 32, 32)'`);
    await evaluate(`document.querySelector('[role=tooltip]').textContent='VeryLongUnbrokenContent'.repeat(150)`);
    await delay(100); // ResizeObserver must reposition after the content changes size.
    const tall = await bounds();
    assertInside(tall, width, height);
    assert(tall.scrollHeight > tall.clientHeight);
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' });
    assert.equal(await evaluate('!!document.querySelector("[role=tooltip]")'), false);
    await evaluate(`document.activeElement.blur();document.querySelector('[data-tooltip-long]').removeAttribute('style')`);

    // Exercise real hover and movement into the body-mounted tooltip.
    await evaluate(`document.querySelector('[data-tooltip-clipped]').scrollIntoView({block:'center'})`);
    await delay(100);
    const point = await evaluate(`(() => {const r=document.querySelector('[data-tooltip-clipped]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
    await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
    await waitFor('!!document.querySelector("[role=tooltip]")');
    const hovered = await bounds();
    assertInside(hovered, width, height);
    await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x: hovered.left + 10, y: hovered.top + 10 });
    await delay(150);
    assert.equal(await evaluate('!!document.querySelector("[role=tooltip]")'), true);
    await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x: width - 1, y: height - 1 });
    await waitFor('!document.querySelector("[role=tooltip]")');

    // A focused trigger can leave a nested scrollport while its coordinates remain in the window.
    await evaluate(`(() => {
      const trigger=document.querySelector('[data-tooltip-position="top"]');
      const parent=trigger.parentElement, next=trigger.nextSibling;
      const clip=document.createElement('div');
      clip.style.cssText='position:fixed;left:40px;top:${height / 2}px;width:240px;height:100px;overflow:auto';
      const spacer=document.createElement('div');spacer.style.height='1000px';
      clip.append(trigger,spacer);document.body.append(clip);
      window.tooltipScrollRegression={clip,trigger,parent,next};
      trigger.focus({preventScroll:true});
    })()`);
    await waitFor('!!document.querySelector("[role=tooltip]")');
    await evaluate('window.tooltipScrollRegression.clip.scrollTop=180');
    await waitFor('!document.querySelector("[role=tooltip]")');
    assert.equal(await evaluate(`(() => {
      const {trigger,clip}=window.tooltipScrollRegression;
      const r=trigger.getBoundingClientRect(),c=clip.getBoundingClientRect();
      return r.top>=0&&r.bottom<c.top;
    })()`), true);
    await evaluate(`(() => {
      const {trigger,parent,next,clip}=window.tooltipScrollRegression;
      trigger.blur();parent.insertBefore(trigger,next);clip.remove();delete window.tooltipScrollRegression;
    })()`);
    console.log(`Tooltip edges, wrapping, live theme, clipping, focus, Escape and hover passed at ${width}px`);
  }
  assert.equal(errors.length, 0, JSON.stringify(errors));
  console.log(`${checks.length} edge/position combinations passed; no browser exceptions.`);
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    try { await cdp('Browser.close'); } catch { /* Browser may have already exited. */ }
    socket.close();
  }
  browser.kill();
  if (browser.pid && browser.exitCode === null && browser.signalCode === null) {
    await new Promise(resolve => browser.once('exit', resolve));
  }
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
}
