/** Browser verification for the expanded preview. No dependencies installed. */
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.STYLE_BASELINE_URL || 'http://127.0.0.1:4201';
const phase5 = process.env.STYLE_PREVIEW_PHASE === '5';
const output = resolve(`docs/style-migration/phase-${phase5 ? '5' : '4'}/screenshots`);
const profile = resolve('tmp', `component-preview-chrome-${Date.now()}`);
await mkdir(output, { recursive: true }); await mkdir(profile, { recursive: true });
const browser = spawn(process.env.STYLE_BASELINE_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1', `--user-data-dir=${profile}`, 'about:blank'],
  { windowsHide: true, stdio: 'ignore' });
let socket; let id = 0; const pending = new Map();
const delay = ms => new Promise(resolveDelay => setTimeout(resolveDelay, ms));
const report = { capturedAt: new Date().toISOString(), sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), route: '/#/preview', success: false, captures: [], checks: [], runtimeErrors: [] };
function cdp(method, params = {}) {
  return new Promise((resolveCall, rejectCall) => {
    const callId = ++id;
    const timer = setTimeout(() => { pending.delete(callId); rejectCall(new Error(`CDP timeout: ${method}`)); }, 15000);
    pending.set(callId, { resolve: value => { clearTimeout(timer); resolveCall(value); }, reject: error => { clearTimeout(timer); rejectCall(error); } });
    socket.send(JSON.stringify({ id: callId, method, params }));
  });
}
async function evaluate(expression) {
  const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function waitFor(expression) {
  for (let attempt = 0; attempt < 80; attempt++) { if (await evaluate(expression)) return; await delay(250); }
  throw new Error(`Preview did not become ready: ${expression}`);
}
let width; let height = 1000;
async function capture(name, selector) {
  await evaluate(`(() => {
    const e=document.querySelector(${JSON.stringify(selector)}); if(!e)throw new Error('Missing capture target');
    e.scrollIntoView({block:'start',inline:'nearest'});
    const scroller=document.querySelector('.scrollable');
    if(scroller.scrollHeight>scroller.clientHeight+1) scroller.scrollTop-=100; else window.scrollBy(0,-100);
    return true;
  })()`);
  await delay(150);
  const measurement = await evaluate(`(() => {const e=document.querySelector(${JSON.stringify(selector)});const r=e.getBoundingClientRect();const s=getComputedStyle(e);return {bounds:{x:r.x,y:r.y,width:r.width,height:r.height},font:s.fontFamily,overflow:document.documentElement.scrollWidth>innerWidth};})()`);
  const png = await cdp('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  const file = `${name}-${width}.png`;
  await writeFile(join(output, file), Buffer.from(png.data, 'base64'));
  report.captures.push({ file, selector, viewport: { width, height }, ...measurement });
  console.log(`Captured ${file}`);
}
try {
  let port;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch { await delay(250); }
  }
  if (!port) throw new Error('Chrome did not start.');
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolveOpen, rejectOpen) => { socket.addEventListener('open', resolveOpen); socket.addEventListener('error', rejectOpen); });
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const call = pending.get(message.id); if (!call) return; pending.delete(message.id);
      if (message.error) call.reject(new Error(JSON.stringify(message.error))); else call.resolve(message.result);
    } else if (message.method === 'Runtime.exceptionThrown') report.runtimeErrors.push(message.params.exceptionDetails);
  });
  await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Animation.enable'); await cdp('Network.enable');
  await cdp('Emulation.setFocusEmulationEnabled', { enabled: true });
  await cdp('Network.setBlockedURLs', { urls: ['*googletagmanager.com*', '*google-analytics.com*', '*buttons.github.io*'] });
  report.browser = await cdp('Browser.getVersion');
  for (width of [1440, 390]) {
    height = 1000;
    await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await cdp('Page.navigate', { url: 'about:blank' }); await cdp('Page.navigate', { url: `${base}/#/preview` });
    await waitFor('document.querySelectorAll("#previewTables table tbody tr").length>=9');
    await evaluate('document.fonts.ready.then(()=>true)'); await delay(500);
    await cdp('Animation.setPlaybackRate', { playbackRate: 0 });
    const sizes = await evaluate(`(() => ({
      buttons:[...document.querySelectorAll('[data-button-size]')].map(e=>({size:e.dataset.buttonSize,height:e.querySelector('button').getBoundingClientRect().height})),
      fields:[...document.querySelectorAll('[data-field-size]')].map(e=>({size:e.dataset.fieldSize,height:e.querySelector('.input-field').getBoundingClientRect().height})),
      progress:[...document.querySelectorAll('[data-progress-size]')].map(e=>({size:e.dataset.progressSize,height:e.querySelector('.progress').getBoundingClientRect().height,value:e.querySelector('.progress').getAttribute('aria-valuenow')})),
      rows:[...document.querySelectorAll('[data-table-size]')].map(e=>({size:e.dataset.tableSize,height:e.querySelector('tbody tr').getBoundingClientRect().height})),
      calendar:document.querySelector('#previewSingleCalendar .datetime-picker-wrapper').getBoundingClientRect().height,
      time:document.querySelector('#previewTime .time-picker').getBoundingClientRect().height,
      overflow:document.documentElement.scrollWidth>innerWidth,
      fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family)
    }))()`);
    assert.deepEqual(sizes.buttons.map(x => x.height), [24,32,40,48]);
    assert.deepEqual(sizes.fields.map(x => x.height), [28,32,40]);
    assert.deepEqual(sizes.progress.map(x => x.height), [4,8,12]);
    assert(sizes.progress.every(x => x.value === '62'));
    if (width === 1440) assert.deepEqual(sizes.rows.map(x => x.height), [36,40,44]);
    assert.equal(sizes.calendar, 320); assert.equal(sizes.time, 56); assert.equal(sizes.overflow, false);
    const checks = { width, sizes }; report.checks.push(checks);
    const targets = [
      ['overview','#componentPreview'],['buttons','#previewButtons'],['fields','#previewFields'],
      ['extra-fields','#previewFields .preview-grid:nth-of-type(3)'],['progress','#previewProgress'],
      ['table-small','[data-table-size=small]'],['table-medium','[data-table-size=medium]'],['table-large','[data-table-size=large]'],
      ['empty-table','#previewEmptyTable'],['paginator','#previewPaginator'],['calendar','#previewSingleCalendar'],['range','#previewRangeCalendar'],['time','#previewTime'],
    ];
    for (const [name, selector] of targets) await capture(name, selector);
    await evaluate('document.querySelector("#previewPaginator [data-btn-type=next]").click()');
    await waitFor('document.querySelector("#previewPaginator [aria-current=page]")?.textContent.trim()==="2"');
    await evaluate('document.querySelector("#previewPaginator [data-btn-type=last]").click()');
    await waitFor('document.querySelector("#previewPaginator [data-btn-type=next]")?.disabled');
    assert.equal(await evaluate('document.querySelector("#previewPaginator .page-summary").textContent.trim()'), '1 items on this page');
    checks.pagination = true;
    if (width === 1440) {
      for (const expected of ['Calendar','Pagination','Design tokens']) {
        await evaluate('document.querySelector("[data-table-size=small] th button").click()');
        await waitFor(`document.querySelector('[data-table-size=small] tbody td')?.textContent.trim()===${JSON.stringify(expected)}`);
      }
      checks.sortCycle = true;
    } else checks.mobileCards = await evaluate('getComputedStyle(document.querySelector("[data-table-size=small] thead")).display==="none"');
    const dateCell = day => `(()=>[...document.querySelectorAll('#previewRangeCalendar .cell:not(.beyond-current-period)')].find(e=>e.textContent.trim()==='${day}'))()`;
    await evaluate(`${dateCell(20)}.click()`); await waitFor('!!document.querySelector("#previewRangeCalendar .range-pending")');
    await evaluate(`${dateCell(23)}.dispatchEvent(new PointerEvent('pointerenter',{pointerType:'mouse'}))`);
    await waitFor('document.querySelectorAll("#previewRangeCalendar .range-preview").length>=2');
    await capture('range-preview','#previewRangeCalendar');
    await evaluate(`${dateCell(23)}.click()`);
    await waitFor('!document.querySelector("#previewRangeCalendar .range-pending")&&document.querySelectorAll("#previewRangeCalendar .cell.selected").length===4');
    checks.rangeSelection = true; await capture('range-selected','#previewRangeCalendar');
    const hours = await evaluate('document.querySelector("#previewTime input[aria-label=Hours]").value');
    await evaluate('document.querySelector("#previewTime .spinner").click()');
    await waitFor(`document.querySelector('#previewTime input[aria-label=Hours]').value!==${JSON.stringify(hours)}`);
    checks.timeSpinner = true;
    if (phase5) {
      await evaluate('document.querySelector("#previewToggleError button").click()');
      await waitFor('document.querySelector("#previewValidatedName")?.getAttribute("aria-invalid")==="true"');
      assert.equal(await evaluate('document.querySelector("#previewValidatedName").getAttribute("aria-describedby")'), 'previewValidatedName-message');
      assert.equal(await evaluate('document.querySelector("#previewValidatedName-message").getAttribute("role")'), 'alert');
      await capture('validation-error', '#previewValidation');
      await evaluate('document.querySelector("#previewToggleError button").click()');
      await waitFor('!document.querySelector("#previewValidatedName")?.hasAttribute("aria-invalid")');
      assert.equal(await evaluate('document.querySelector("#previewValidatedName-message").textContent.trim()'), 'Choose a name for your profile');
      assert.equal(await evaluate('document.querySelector("#previewValidatedName-message").hasAttribute("role")'), false);
      checks.messageRecovery = true;

      await evaluate('document.querySelector("#previewCustomDropdown [role=combobox]").click()');
      await waitFor('document.querySelector("#previewCustomDropdown [role=option]")?.textContent.includes("Team: Design")');
      assert.equal(await evaluate('document.querySelector("#previewCustomDropdown .template-chevron").textContent'), '−');
      await evaluate('document.querySelector("#previewCustomDropdown [role=option]").click()');
      await waitFor('document.querySelector("#previewCustomDropdown .template-selected")?.textContent==="Design"');
      assert.equal(await evaluate('document.querySelector("#previewCustomDropdown .template-chevron").textContent'), '+');
      await evaluate(`document.querySelector('#previewCustomTags button[aria-label="Remove Design"]').click()`);
      await waitFor('document.querySelectorAll("#previewCustomTags .template-chip").length===1');
      assert.equal(await evaluate('document.querySelector("#previewCustomTags .template-chip").textContent.trim()'), 'Angular×');
      await evaluate(`(() => {const e=document.querySelector('#previewCustomTypeahead input');e.focus();e.value='Design';e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
      await waitFor('document.querySelector("#previewCustomTypeahead .template-option")?.textContent==="Result: Design"');
      await evaluate('document.querySelector("#previewCustomTypeahead .template-option").click()');
      await waitFor('!!document.querySelector("#previewCustomTypeahead .template-chip")');
      await evaluate(`document.querySelector('#previewCustomTypeahead button[aria-label="Remove Design"]').click()`);
      await waitFor('!document.querySelector("#previewCustomTypeahead .template-chip")');
      await evaluate('document.querySelector("#previewCustomCheckbox").click()');
      await waitFor('document.querySelector("#previewCustomChecks label[for=previewCustomCheckbox]").textContent.includes("disabled")');
      await evaluate('document.querySelector("#previewCustomWeekly").click()');
      await waitFor('document.querySelector("#previewCustomChecks label[for=previewCustomWeekly]").textContent==="weekly: selected"');
      assert.equal(await evaluate('document.querySelector("#previewCustomChecks label[for=previewCustomDaily]").textContent'), 'daily: unselected');
      assert.equal(await evaluate('document.querySelectorAll("#previewCustomTable tbody tr").length'), 3);
      assert.equal(await evaluate('!!document.querySelector("#previewCustomTable .datatable-empty")'), false);
      checks.customTemplates = true;
      await capture('custom-templates', '#previewTemplates');
      await capture('custom-table', '#previewCustomTable');

      const theme = await evaluate(`(() => {
        const color = selector => getComputedStyle(document.querySelector(selector)).backgroundColor;
        return {nested:color('#previewNestedTheme button'),normal:color('#previewDefaultTheme button'),
          inheritedProgress:color('#previewNestedTheme .loading-line'),inlineProgress:color('#previewDefaultTheme .loading-line'),
          inlineTrack:color('#previewDefaultTheme .background'),overflow:document.documentElement.scrollWidth>innerWidth};
      })()`);
      assert.equal(theme.nested, 'rgb(55, 89, 199)');
      assert.equal(theme.normal, 'rgb(0, 196, 116)');
      assert.equal(theme.inheritedProgress, theme.nested);
      assert.equal(theme.inlineProgress, theme.nested);
      assert.equal(theme.inlineTrack, 'rgb(238, 238, 238)');
      assert.equal(theme.overflow, false);
      checks.themeOverrides = theme;
      await capture('theme-overrides', '#previewTheme');
      assert.equal(await evaluate(`document.querySelectorAll('.preview-section a[href^="https://www.figma.com/design/"]').length`), 7);
      checks.referenceLinks = true;
    }
    height = 640; await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await cdp('Animation.setPlaybackRate', { playbackRate: 1 });
    checks.modals = [];
    for (const [size, expectedWidth] of [['small',360],['medium',400],['large',440]]) {
      await evaluate(`document.querySelector('sq-button[data-modal-size=${size}] button').click()`);
      await waitFor('!!document.querySelector(".modal-cover:not(.display-none)")'); await delay(650);
      const modal = await evaluate(`(() => {const e=document.querySelector('.modal-window');const r=e.getBoundingClientRect();const content=e.querySelector(':scope > .content');return {width:r.width,height:r.height,left:r.left,right:r.right,screenWidth:document.documentElement.clientWidth,scrollable:content.scrollHeight>content.clientHeight};})()`);
      assert.equal(modal.width, Math.min(expectedWidth, modal.screenWidth-32));
      assert(modal.height <= 608 && modal.left >= 15 && modal.right <= modal.screenWidth-15 && modal.scrollable);
      checks.modals.push({ size, ...modal }); await capture('modal-'+size,'.modal-window');
      if (size === 'small') await evaluate('document.querySelector(".modal-window .close").click()');
      else if (size === 'medium') await evaluate('document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))');
      else await evaluate('document.querySelector(".modal-cover").click()');
      await waitFor('!!document.querySelector(".modal-cover.display-none")');
    }
    console.log(`Preview geometry and Phase ${phase5 ? '5' : '4'} interactions passed at ${width}px`);
  }
  assert.equal(report.runtimeErrors.length, 0); report.success = true;
} finally {
  await writeFile(join(output, 'manifest.json'), JSON.stringify(report, null, 2)+'\n');
  if (socket?.readyState === WebSocket.OPEN) { try { await cdp('Browser.close'); } catch {} socket.close(); }
  browser.kill();
}
