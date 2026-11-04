/** Capture the unchanged demo with installed Chrome using its local debugging protocol.
 * No packages are installed. Start ng serve separately; run with Node 24+.
 * Output: docs/style-migration/baseline/. Uses a fresh temporary browser profile.
 */
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const baseUrl = process.env.STYLE_BASELINE_URL || 'http://127.0.0.1:4200';
const browserPath = process.env.STYLE_BASELINE_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const output = resolve(process.env.STYLE_BASELINE_OUTPUT || 'docs/style-migration/baseline');
const profile = resolve('tmp', `style-baseline-chrome-${Date.now()}`);
await mkdir(output, { recursive: true });
await mkdir(profile, { recursive: true });
const browser = spawn(browserPath, [
  '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1',
  `--user-data-dir=${profile}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
browser.on('error', error => { console.error(error.message); });
const delay = ms => new Promise(resolveDelay => setTimeout(resolveDelay, ms));
let socket;
let nextId = 0;
const pending = new Map();
const report = {
  capturedAt: new Date().toISOString(),
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  baseUrl, browser: browserPath, fixtures: 'Synthetic todo rows; bundled user/resource fallbacks; no source changes.',
  screenshotScope: 'Viewport context with the target scrolled into view; component bounds and computed styles are recorded separately.',
  captures: [], runtimeErrors: [],
};
const cdp = (method, params = {}) => new Promise((resolveCall, rejectCall) => {
  const id = ++nextId;
  const timer = setTimeout(() => { pending.delete(id); rejectCall(new Error(`CDP timeout: ${method}`)); }, 20000);
  pending.set(id, { resolve: value => { clearTimeout(timer); resolveCall(value); }, reject: error => { clearTimeout(timer); rejectCall(error); } });
  socket.send(JSON.stringify({ id, method, params }));
});
async function evaluate(expression) {
  const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function waitFor(expression) {
  for (let attempt = 0; attempt < 80; attempt++) {
    if (await evaluate(expression)) return;
    await delay(250);
  }
  throw new Error(`Page did not become ready: ${expression}`);
}
async function navigate(route, width) {
  await cdp('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
  // Navigating to the same hash can retain Angular state between viewport runs.
  await cdp('Page.navigate', { url: 'about:blank' });
  await cdp('Page.navigate', { url: `${baseUrl}/#/${route}` });
  await waitFor('!!document.querySelector("router-outlet")?.nextElementSibling');
  await evaluate('document.fonts.ready.then(() => true)');
  await delay(750);
  await cdp('Animation.setPlaybackRate', { playbackRate: 0 });
}
async function capture(name, selector, route, width, state = 'default') {
  if (selector) {
    await evaluate(`(() => { const e=document.querySelector(${JSON.stringify(selector)}); if(!e) throw new Error('Missing: '+${JSON.stringify(selector)}); e.scrollIntoView({block:'center',inline:'nearest'}); return true; })()`);
    await delay(120);
  }
  const measurement = await evaluate(`(() => {
    const selector=${JSON.stringify(selector)};
    const e=selector?document.querySelector(selector):document.documentElement;
    const r=e.getBoundingClientRect(); const s=getComputedStyle(e);
    const props=['fontFamily','fontSize','fontWeight','lineHeight','color','backgroundColor','borderTop','borderRight','borderBottom','borderLeft','borderRadius','padding','margin','boxShadow','outline','outlineOffset','display','position','width','height','overflow','maxWidth','maxHeight','textTransform'];
    return {bounds:{x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height},viewportBounds:{x:r.x,y:r.y,width:r.width,height:r.height},styles:Object.fromEntries(props.map(p=>[p,s[p]])),text:e.innerText?.slice(0,500),fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>({family:f.family,weight:f.weight,status:f.status})),documentOverflow:document.documentElement.scrollWidth>innerWidth};
  })()`);
  if (selector && (measurement.bounds.width <= 0 || measurement.bounds.height <= 0)) throw new Error(`Empty target: ${selector}`);
  // Cropping/resizing screenshots changes this demo's nested viewport-height scroller.
  // Keep the original viewport and capture its visible context instead.
  const params = { format: 'png', fromSurface: true, captureBeyondViewport: false };
  const png = await cdp('Page.captureScreenshot', params);
  await writeFile(join(output, `${name}.png`), Buffer.from(png.data, 'base64'));
  report.captures.push({ name, route, viewport: { width, height: 1000 }, selector, state, ...measurement });
  console.log(`Captured ${name}`);
}

try {
  let port;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch { await delay(250); }
  }
  if (!port) throw new Error('Chrome did not expose a local debugging port.');
  const response = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  const target = await response.json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolveOpen, rejectOpen) => { socket.addEventListener('open', resolveOpen); socket.addEventListener('error', rejectOpen); });
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const call = pending.get(message.id); if (!call) return;
      pending.delete(message.id);
      if (message.error) call.reject(new Error(JSON.stringify(message.error))); else call.resolve(message.result);
    } else if (message.method === 'Runtime.exceptionThrown') report.runtimeErrors.push(message.params.exceptionDetails);
  });
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setFocusEmulationEnabled', { enabled: true });
  await cdp('Animation.enable');
  await cdp('Network.enable');
  await cdp('Network.setBlockedURLs', { urls: ['*googletagmanager.com*', '*google-analytics.com*', '*buttons.github.io*'] });
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `
    const realFetch=window.fetch.bind(window);
    window.fetch=(input,init)=>{
      const url=String(input?.url||input);
      if(url.includes('jsonplaceholder.typicode.com/todos')) return Promise.resolve(new Response(JSON.stringify(Array.from({length:40},(_,i)=>({userId:1,id:i+1,title:'Baseline task '+(i+1),completed:i%2===0}))),{headers:{'Content-Type':'application/json'}}));
      if(url.includes('reqres.in/api/')) return Promise.resolve(new Response('{}',{headers:{'Content-Type':'application/json'}}));
      return realFetch(input,init);
    };
  ` });
  report.browserVersion = await cdp('Browser.getVersion');
  for (const width of [1440, 390]) {
    const suffix = width === 1440 ? 'desktop' : 'mobile';
    await navigate('sq-ui', width);
    await waitFor('!!document.querySelector("sq-input input")');
    if (process.env.STYLE_VERIFY_FOUNDATIONS === '1') {
      // The capture freezes animations; overrides must finish their CSS transitions.
      await cdp('Animation.setPlaybackRate', { playbackRate: 1 });
      const checks = await evaluate(`(async () => {
        const root=document.querySelector('.sq-app');
        const input=document.querySelector('sq-input input');
        const field=input.closest('.input-field');
        const button=document.querySelector('sq-button button');
        const modernField=!!input.closest('.sq-form-field');
        root.style.setProperty('--sq-color-brand','#123456');
        root.style.setProperty('--sq-color-border','#123456');
        root.style.setProperty('--sq-color-text','#232425');
        await new Promise(resolve => setTimeout(resolve,350));
        const override={field:modernField?getComputedStyle(field).boxShadow:getComputedStyle(field).borderLeftColor,button:modernField?getComputedStyle(button).backgroundColor:getComputedStyle(button).borderColor,text:getComputedStyle(input).color};
        root.style.removeProperty('--sq-color-brand'); root.style.removeProperty('--sq-color-border'); root.style.removeProperty('--sq-color-text');
        await new Promise(resolve => setTimeout(resolve,350));
        const probe=document.createElement('div'); probe.className='input-field disabled checkable'; document.body.append(probe);
        const outside={border:getComputedStyle(probe).borderLeftWidth,pointerEvents:getComputedStyle(probe).pointerEvents,display:getComputedStyle(probe).display}; probe.remove();
        const p=document.createElement('p'); document.body.append(p); const resetMargin=getComputedStyle(p).marginTop; p.remove();
        input.focus(); await new Promise(resolve => setTimeout(resolve,80));
        const focusTarget=modernField?field:input;
        const focus={width:getComputedStyle(focusTarget).outlineWidth,style:getComputedStyle(focusTarget).outlineStyle,active:document.activeElement===input,visible:input.matches(':focus-visible')}; input.blur();
        const icon=document.querySelector('.fas');
        return {viewport:innerWidth,override,outside,resetMargin,focus,font:getComputedStyle(input).fontFamily,iconFont:getComputedStyle(icon).fontFamily};
      })()`);
      if (!checks.override.field.includes('rgb(18, 52, 86)') || checks.override.button!=='rgb(18, 52, 86)' || checks.override.text!=='rgb(35, 36, 37)') throw new Error('Inherited token override failed: '+JSON.stringify(checks));
      if (checks.outside.border!=='0px' || checks.outside.pointerEvents!=='auto' || checks.outside.display!=='block' || checks.resetMargin==='0px') throw new Error('Theme styles leaked outside .sq: '+JSON.stringify(checks));
      if(checks.focus.width!=='2px'||checks.focus.style!=='solid'||!checks.iconFont.includes('Font Awesome')) throw new Error('Focus or icon font regression: '+JSON.stringify(checks));
      (report.foundationChecks ||= []).push(checks);
      await cdp('Animation.setPlaybackRate', { playbackRate: 0 });
      console.log('Foundation checks passed at '+width+'px');
    }
    await capture(`forms-page-${suffix}`, null, 'sq-ui', width);
    const controls = [
      ['input', 'sq-input .input-field'], ['textarea', 'sq-textarea .input-field'],
      ['radio-group', 'sq-form-group .select-group'], ['dropdown', 'sq-dropdown .input-field'],
      ['tags', 'sq-tags-input .tags-input-wrapper'], ['typeahead', 'sq-typeahead .typeahead-wrapper'],
      ['checkbox', 'sq-checkbox .checkable'], ['button', 'sq-button .action-button'],
      ['progress', '#progressBarModule [sq-collapse-body]'],
    ];
    for (const [name, selector] of controls) {
      if (process.env.STYLE_PHASE3 === '1' && name === 'progress') continue;
      await capture(`${name}-${suffix}`, selector, 'sq-ui', width);
    }
    await evaluate('document.querySelector("sq-dropdown [role=combobox]").click()');
    await capture(`dropdown-open-${suffix}`, 'sq-dropdown .input-field', 'sq-ui', width, 'open');
    await evaluate('document.querySelector("sq-dropdown [role=combobox]").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))');
    await evaluate('document.querySelector("sq-checkbox input").click()');
    await capture(`checkbox-selected-${suffix}`, 'sq-checkbox .checkable', 'sq-ui', width, 'selected');
    if (process.env.STYLE_PHASE3 === '1') {
      const checks=await evaluate(`(() => {
        const primary=document.querySelector('#stylePrimaryButton button');
        const neutral=document.querySelector('#styleNeutralButton button');
        const field=document.querySelector('#styleDefaultField').closest('.input-field');
        const error=document.querySelector('#styleErrorField');
        const errorWrapper=error.closest('.sq-form-field');
        const rect=e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height});
        const style=getComputedStyle(primary); const text=getComputedStyle(document.querySelector('#styleDefaultField'));
        return {primary:{...rect(primary),fontSize:style.fontSize,lineHeight:style.lineHeight,fontWeight:style.fontWeight,radius:style.borderRadius,color:style.color,background:style.backgroundColor},neutral:{background:getComputedStyle(neutral).backgroundColor,color:getComputedStyle(neutral).color},field:{...rect(field),fontSize:text.fontSize,lineHeight:text.lineHeight,radius:getComputedStyle(field).borderRadius},error:{height:rect(errorWrapper).height,labelHeight:rect(errorWrapper.querySelector('.sq-field-label')).height,messageHeight:rect(errorWrapper.querySelector('.sq-field-message')).height,color:getComputedStyle(errorWrapper.querySelector('.sq-field-message')).color,invalid:error.getAttribute('aria-invalid'),describedBy:error.getAttribute('aria-describedby')},disabled:document.querySelector('#styleDisabledField').disabled};
      })()`);
      if(checks.primary.height!==32||checks.primary.fontSize!=='14px'||checks.primary.lineHeight!=='24px'||checks.primary.fontWeight!=='600'||checks.primary.radius!=='4px'||checks.primary.color!=='rgb(255, 255, 255)'||checks.primary.background!=='rgb(0, 196, 116)') throw new Error('M button reference mismatch: '+JSON.stringify(checks));
      if(checks.neutral.background!=='rgb(250, 250, 250)'||checks.neutral.color!=='rgb(32, 32, 32)') throw new Error('Neutral button reference mismatch');
      if(checks.field.width!==240||checks.field.height!==28||checks.field.fontSize!=='12px'||checks.field.lineHeight!=='20px'||checks.field.radius!=='4px'||checks.error.height!==64||checks.error.labelHeight!==20||checks.error.messageHeight!==16||checks.error.color!=='rgb(255, 56, 21)'||checks.error.invalid!=='true'||!checks.disabled) throw new Error('Small field reference mismatch: '+JSON.stringify(checks));
      (report.formChecks ||= []).push(checks);
      const examples=[['button-primary-reference','#stylePrimaryButton button'],['button-neutral-reference','#styleNeutralButton button'],['field-reference','#styleDefaultField'],['field-error','#styleErrorField'],['field-disabled','#styleDisabledField'],['form-preview','#formStylePreview']];
      for(const [name,selector] of examples) await capture(name+'-'+suffix,selector,'sq-ui',width);
      await evaluate('document.querySelector("sq-input input").focus()');
      await capture('input-focus-'+suffix,'sq-input .input-field','sq-ui',width,'focus-visible');
      await evaluate('document.querySelector("#stylePrimaryButton button").focus()');
      await capture('button-focus-'+suffix,'#stylePrimaryButton button','sq-ui',width,'focus-visible');
      await evaluate(`(() => {
        const trigger=document.querySelector('sq-dropdown [role=combobox]');
        for(const key of ['ArrowDown','ArrowDown','Enter']) trigger.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));
        return true;
      })()`);
      await waitFor('document.querySelector("sq-dropdown .chosen-item")?.textContent.trim()==="option1"');
      const interaction=await evaluate(`(() => {
        const trigger=document.querySelector('sq-dropdown [role=combobox]');
        return {closed:trigger.getAttribute('aria-expanded')==='false',choice:trigger.querySelector('.chosen-item')?.textContent.trim()};
      })()`);
      if(!interaction.closed||interaction.choice!=='option1')throw new Error('Keyboard dropdown regression: '+JSON.stringify(interaction));
      await evaluate('document.querySelectorAll("sq-dropdown [role=combobox]")[1].click()');
      await waitFor('document.querySelectorAll("sq-dropdown")[1].querySelectorAll("[role=option]").length>1');
      await evaluate('document.querySelectorAll("sq-dropdown")[1].querySelectorAll("[role=option]")[1].click()');
      await waitFor('document.querySelectorAll("sq-dropdown")[1].querySelector(".custom.tag")?.textContent.trim()==="option2"');
      report.formChecks.at(-1).keyboard=interaction;
      report.formChecks.at(-1).customDropdown=true;
      await evaluate('document.querySelector("#sqTagsInputWithCustomTemplate .custom.tag button").click()');
      await waitFor('!document.querySelector("#sqTagsInputWithCustomTemplate .custom.tag")');
      report.formChecks.at(-1).customTags=true;
      await evaluate(`(() => {const input=document.querySelector('#sqTypeaheadWithTemplates input');input.value='option';input.dispatchEvent(new Event('input',{bubbles:true}));return true;})()`);
      await waitFor('document.querySelector("#sqTypeaheadWithTemplates .options:not(.display-none) .custom.dropdown-option")');
      await evaluate('document.querySelector("#sqTypeaheadWithTemplates .options > div").click()');
      await waitFor('!!document.querySelector("#sqTypeaheadWithTemplates .custom.chosen-item button")');
      await evaluate('document.querySelector("#sqTypeaheadWithTemplates .custom.chosen-item button").click()');
      await waitFor('!document.querySelector("#sqTypeaheadWithTemplates .custom.chosen-item")');
      report.formChecks.at(-1).customTypeahead=true;
      console.log('Form reference and interaction checks passed at '+width+'px');
      continue;
    }
    await navigate('datatable', width);
    await waitFor('document.querySelectorAll("sq-datatable tbody tr").length>=5');
    await capture(`datatable-${suffix}`, 'sq-datatable .datatable-wrapper', 'datatable', width);
    await capture(`paginator-${suffix}`, 'sq-datatable sq-paginator ol', 'datatable', width);
    await evaluate('document.querySelector("sq-datatable th button").click()');
    await capture(`datatable-sorted-${suffix}`, 'sq-datatable .datatable-wrapper', 'datatable', width, 'ascending');
    await navigate('datetime-picker', width);
    await waitFor('!!document.querySelector("sq-datetime-picker .datetime-picker")');
    await capture(`calendar-${suffix}`, 'sq-datetime-picker .datetime-picker-wrapper', 'datetime-picker', width);
    await capture(`timepicker-${suffix}`, 'sq-time-picker .time-picker', 'datetime-picker', width);
    await evaluate('document.querySelector("sq-datetime-picker .month-name").click()');
    await capture(`calendar-months-${suffix}`, 'sq-datetime-picker .datetime-picker-wrapper', 'datetime-picker', width, 'month picker');
    await navigate('modal', width);
    await waitFor('!!document.querySelector("sq-button button")');
    await evaluate('document.querySelector("sq-button button").click()');
    // Do not pause the entrance animation before the dialog reaches its final position.
    await cdp('Animation.setPlaybackRate', { playbackRate: 1 });
    await delay(750);
    await capture(`modal-open-${suffix}`, null, 'modal', width, 'open');
  }
  await writeFile(join(output, 'manifest.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Saved ${report.captures.length} screenshots and measured styles.`);
} finally {
  await writeFile(join(output, 'manifest.json'), `${JSON.stringify(report, null, 2)}\n`);
  if (socket?.readyState === WebSocket.OPEN) {
    try { await cdp('Browser.close'); } catch { /* Browser may close before replying. */ }
    socket.close();
  }
  browser.kill();
}
