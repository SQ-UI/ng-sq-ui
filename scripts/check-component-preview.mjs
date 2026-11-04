/** Browser verification for the expanded preview. No dependencies installed. */
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.STYLE_BASELINE_URL || 'http://127.0.0.1:4201';
const phase = ['5', '6'].includes(process.env.STYLE_PREVIEW_PHASE) ? process.env.STYLE_PREVIEW_PHASE : '4';
const phase5 = Number(phase) >= 5;
const phase6 = phase === '6';
const output = resolve(process.env.STYLE_PREVIEW_OUTPUT || `docs/style-migration/phase-${phase}/screenshots`);
const profile = resolve('tmp', `component-preview-chrome-${Date.now()}`);
await mkdir(output, { recursive: true }); await mkdir(profile, { recursive: true });
const browser = spawn(process.env.STYLE_BASELINE_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1', `--user-data-dir=${profile}`, 'about:blank'],
  { windowsHide: true, stdio: 'ignore' });
let socket; let id = 0; const pending = new Map();
const delay = ms => new Promise(resolveDelay => setTimeout(resolveDelay, ms));
const report = { capturedAt: new Date().toISOString(), sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), phase, route: '/#/preview', success: false, captures: [], checks: [], runtimeErrors: [] };
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
async function key(keyName, shift = false) {
  const codes = { Tab: 9, Enter: 13, ' ': 32, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, Escape: 27 };
  const event = { key: keyName, windowsVirtualKeyCode: codes[keyName], modifiers: shift ? 8 : 0 };
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', ...event });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', ...event });
  await delay(60);
}
async function focus(selector) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
}
async function visibleFocus(selector) {
  const result = await evaluate(`(() => {const e=document.querySelector(${JSON.stringify(selector)});const s=getComputedStyle(e);return {style:s.outlineStyle,width:s.outlineWidth};})()`);
  assert.equal(result.style, 'solid', selector);
  assert.equal(result.width, '2px', selector);
  return result;
}
let width; let height = 1000;
async function capture(name, selector, crop = false) {
  await evaluate(`(() => {
    const e=document.querySelector(${JSON.stringify(selector)}); if(!e)throw new Error('Missing capture target');
    e.scrollIntoView({block:'start',inline:'nearest'});
    const scroller=document.querySelector('.scrollable');
    if(scroller.scrollHeight>scroller.clientHeight+1) scroller.scrollTop-=100; else window.scrollBy(0,-100);
    return true;
  })()`);
  await delay(150);
  const measurement = await evaluate(`(() => {const e=document.querySelector(${JSON.stringify(selector)});const r=e.getBoundingClientRect();const s=getComputedStyle(e);return {bounds:{x:r.x,y:r.y,width:r.width,height:r.height},font:s.fontFamily,overflow:document.documentElement.scrollWidth>innerWidth};})()`);
  const clip = crop ? { ...measurement.bounds, scale: 1 } : undefined;
  const png = await cdp('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false, ...(clip ? { clip } : {}) });
  const file = `${name}-${width}.png`;
  await writeFile(join(output, file), Buffer.from(png.data, 'base64'));
  report.captures.push({ file, selector, viewport: { width, height }, cropped: crop, ...measurement });
  console.log(`Captured ${file}`);
}
async function checkButtonVariants() {
  const variants = await evaluate(`Array.from(document.querySelectorAll('[data-button-variant]')).map(host => {
    const b=host.querySelector('button'),s=getComputedStyle(b);
    return {name:host.dataset.buttonVariant,secondary:b.classList.contains('sq-button-secondary'),
      background:s.backgroundColor,color:s.color,outline:s.boxShadow,disabled:b.disabled,
      height:b.getBoundingClientRect().height,font:s.fontFamily,size:s.fontSize,lineHeight:s.lineHeight,weight:s.fontWeight,radius:s.borderRadius};
  })`);
  assert.equal(variants.length, 12);
  const colors = {Brand:'rgb(0, 196, 116)',OK:'rgb(0, 210, 20)',Warning:'rgb(255, 184, 0)',Critical:'rgb(255, 56, 21)',Hover:'rgb(32, 32, 32)',Disabled:'rgb(170, 170, 170)'};
  for (const v of variants) {
    assert.equal(v.height,24); assert.equal(v.size,'14px'); assert.equal(v.lineHeight,'24px');
    assert.equal(v.weight,'600'); assert.equal(v.radius,'4px'); assert(v.font.includes('Space Grotesk'));
    assert.equal(v.disabled,v.name==='Disabled');
    assert.equal(v.background,v.secondary?(v.disabled?'rgb(250, 250, 250)':'rgb(255, 255, 255)'):colors[v.name]);
    assert.equal(v.color,v.secondary?colors[v.name]:'rgb(255, 255, 255)');
    if(v.secondary) { assert(v.outline.includes(colors[v.name])); assert(v.outline.includes('inset')); }
  }
  const hover = [];
  for (const name of ['Brand','OK','Warning','Critical','Disabled']) {
    for (const secondary of [false,true]) {
      const selector = '[data-button-variant="'+name+'"] button'+(secondary?'.sq-button-secondary':':not(.sq-button-secondary)');
      await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);
      const r = await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
      await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...r});
      const s=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),s=getComputedStyle(e);return {hover:e.matches(':hover'),background:s.backgroundColor,color:s.color};})()`);
      assert(s.hover);
      assert.equal(s.background,secondary?(name==='Disabled'?'rgb(250, 250, 250)':'rgb(255, 255, 255)'):(name==='Disabled'?colors.Disabled:colors.Hover));
      assert.equal(s.color,secondary?(name==='Disabled'?colors.Disabled:colors.Hover):'rgb(255, 255, 255)');
      hover.push({name,secondary,...s});
    }
  }
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});
  // The color hook must continue to inherit at runtime for both appearances.
  await evaluate(`document.querySelector('sq-button-preview').style.setProperty('--sq-color-brand','#123456')`);
  const inherited=await evaluate(`Array.from(document.querySelectorAll('[data-button-variant="Brand"] button')).map(b=>{const s=getComputedStyle(b);return [s.backgroundColor,s.color];})`);
  assert.deepEqual(inherited,[['rgb(18, 52, 86)','rgb(255, 255, 255)'],['rgb(255, 255, 255)','rgb(18, 52, 86)']]);
  await evaluate(`document.querySelector('sq-button-preview').style.removeProperty('--sq-color-brand')`);
  return {variants,hover,inherited};
}
async function checkLinkStyles() {
  const read = selector => evaluate(`(()=>{const a=document.querySelector(${JSON.stringify(selector)}),s=getComputedStyle(a);return {color:s.color,line:s.textDecorationLine,underline:s.textDecorationColor,thickness:s.textDecorationThickness,offset:s.textUnderlineOffset,fontSize:s.fontSize,lineHeight:s.lineHeight,href:a.getAttribute('href'),disabled:a.getAttribute('aria-disabled')};})()`);
  const states = {};
  for (const state of ['brand','hover','active','disabled']) states[state] = await read('[data-link-state='+state+']');
  for (const [name,color,line] of [
    ['brand','rgb(0, 196, 116)','underline'],['hover','rgb(32, 32, 32)','underline'],
    ['active','rgb(32, 32, 32)','none'],['disabled','rgb(170, 170, 170)','underline'],
  ]) {
    assert.equal(states[name].color,color,name); assert.equal(states[name].line,line,name);
    assert.equal(states[name].underline,color,name);
  }
  assert.equal(states.disabled.href,null); assert.equal(states.disabled.disabled,'true');
  const selector='[data-link-state=brand]';
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);
  const center = await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...center});
  const hover=await read(selector);assert.equal(hover.color,'rgb(32, 32, 32)');assert.equal(hover.line,'underline');
  await cdp('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,...center});
  const pressed=await read(selector);assert.equal(pressed.color,'rgb(32, 32, 32)');assert.equal(pressed.line,'none');
  await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,...center});
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});
  await focus(selector);await key('Tab');
  assert.equal(await evaluate('document.activeElement.dataset.linkState'),'hover');
  const focusRing=await visibleFocus('[data-link-state=hover]');
  await key('Tab');assert.equal(await evaluate('document.activeElement.dataset.linkState'),'active');
  await key('Tab');assert.equal(await evaluate('document.activeElement.id'),'previewInlineLink');
  const inline=await read('#previewInlineLink');
  const parent=await evaluate(`(()=>{const s=getComputedStyle(document.querySelector('#previewInlineLink').parentElement);return {fontSize:s.fontSize,lineHeight:s.lineHeight}})()`);
  assert.equal(inline.fontSize,parent.fontSize);assert.equal(inline.lineHeight,parent.lineHeight);
  await evaluate(`document.querySelector('sq-link-preview').style.setProperty('--sq-color-brand','#123456')`);
  const inherited=await read(selector);assert.equal(inherited.color,'rgb(18, 52, 86)');
  await evaluate(`document.querySelector('sq-link-preview').style.removeProperty('--sq-color-brand')`);
  await evaluate(`(()=>{const a=document.createElement('a');a.href='#';a.id='outsideLinkProbe';a.textContent='Outside theme';document.body.append(a)})()`);
  const outside=await read('#outsideLinkProbe');assert.notEqual(outside.color,states.brand.color);
  await evaluate(`document.getElementById('outsideLinkProbe').remove()`);
  const anchors=await evaluate(`Array.from(document.querySelectorAll('[data-anchor-state]')).map(a=>{
    const icon=a.querySelector('svg'),label=a.querySelector('.sq-anchor-label'),s=getComputedStyle(a),ls=getComputedStyle(label),is=getComputedStyle(icon),ir=icon.getBoundingClientRect(),lr=label.getBoundingClientRect();
    return {name:a.dataset.anchorState,color:s.color,iconColor:is.stroke,line:ls.textDecorationLine,underline:ls.textDecorationColor,
      fontSize:s.fontSize,href:a.getAttribute('href'),disabled:a.getAttribute('aria-disabled'),iconHidden:icon.getAttribute('aria-hidden'),iconFocusable:icon.getAttribute('focusable'),centerDelta:Math.abs(ir.y+ir.height/2-lr.y-lr.height/2)};
  })`);
  assert.equal(anchors.length,4);
  for(const a of anchors) {
    assert.equal(a.color,states[a.name].color);assert.equal(a.iconColor,a.color);
    assert.equal(a.line,states[a.name].line);assert.equal(a.underline,a.color);
    assert.equal(a.fontSize,inline.fontSize);assert(a.centerDelta<1);
    assert.equal(a.iconHidden,'true');assert.equal(a.iconFocusable,'false');
    if(a.name==='disabled'){assert.equal(a.href,null);assert.equal(a.disabled,'true');}
  }
  await evaluate(`document.querySelector('[data-anchor-state=brand]').scrollIntoView({block:'center'})`);
  const iconCenter=await evaluate(`(()=>{const r=document.querySelector('[data-anchor-state=brand] svg').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...iconCenter});
  const iconState=()=>evaluate(`(()=>{const a=document.querySelector('[data-anchor-state=brand]');return {color:getComputedStyle(a).color,stroke:getComputedStyle(a.querySelector('svg')).stroke,line:getComputedStyle(a.querySelector('.sq-anchor-label')).textDecorationLine}})()`);
  const iconHover=await iconState();assert.deepEqual(iconHover,{color:'rgb(32, 32, 32)',stroke:'rgb(32, 32, 32)',line:'underline'});
  await cdp('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,...iconCenter});
  const iconPressed=await iconState();assert.equal(iconPressed.line,'none');
  await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,...iconCenter});
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});
  await focus('#previewInlineLink');await key('Tab');assert.equal(await evaluate('document.activeElement.dataset.anchorState'),'brand');
  const anchorFocus=await visibleFocus('[data-anchor-state=brand]');
  await key('Tab');await key('Tab');assert.equal(await evaluate('document.activeElement.dataset.anchorState'),'active');
  await key('Tab');assert.notEqual(await evaluate('document.activeElement.dataset.anchorState'),'disabled');
  return {states,hover,pressed,focusRing,inline,inherited,outside,anchors,iconHover,iconPressed,anchorFocus,disabledSkipped:true};
}
async function checkCheckboxStyles() {
  const states=await evaluate(`Array.from(document.querySelectorAll('[data-checkbox-state]')).map(e=>{
    const input=e.querySelector('input'),box=e.querySelector('.checkbox'),label=e.querySelector('label'),tick=e.querySelector('svg'),bs=getComputedStyle(box),ls=getComputedStyle(label),ts=getComputedStyle(tick),r=box.getBoundingClientRect(),lr=label.getBoundingClientRect();
    return {name:e.dataset.checkboxState,checked:input.checked,disabled:input.disabled,label:ls.color,fontSize:ls.fontSize,lineHeight:ls.lineHeight,weight:ls.fontWeight,font:ls.fontFamily,
      width:r.width,height:r.height,gap:lr.x-r.right,radius:bs.borderRadius,border:bs.borderTopColor,stroke:bs.borderTopWidth,background:bs.backgroundColor,tickOpacity:ts.opacity,tickBackground:ts.backgroundColor,tickColor:getComputedStyle(tick.querySelector('path')).stroke,decorative:tick.getAttribute('aria-hidden')};
  })`);
  assert.equal(states.length,5);
  for(const s of states){
    const disabled=s.name.startsWith('disabled'),selected=s.name==='selected'||s.name==='disabled-selected';
    assert.equal(s.width,20);assert.equal(s.height,20);assert.equal(s.gap,10);assert.equal(s.radius,'4px');assert.equal(s.stroke,'1px');
    assert.equal(s.fontSize,'14px');assert.equal(s.lineHeight,'24px');assert.equal(s.weight,'400');assert(s.font.includes('Space Grotesk'));
    assert.equal(s.checked,selected);assert.equal(s.disabled,disabled);
    assert.equal(s.border,disabled?'rgb(170, 170, 170)':'rgb(0, 196, 116)');
    assert.equal(s.background,disabled?'rgb(235, 235, 235)':selected?'rgb(0, 196, 116)':'rgb(255, 255, 255)');
    assert.equal(s.label,disabled?'rgb(170, 170, 170)':s.name==='hover'?'rgb(0, 196, 116)':'rgb(32, 32, 32)');
    assert.equal(s.tickOpacity,selected?'1':'0');assert.equal(s.tickBackground,'rgba(0, 0, 0, 0)');
    assert.equal(s.tickColor,disabled?'rgb(170, 170, 170)':'rgb(255, 255, 255)');assert.equal(s.decorative,'true');
  }
  const click=async selector=>{
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);
    const p=await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...p});
    await cdp('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,...p});
    await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,...p});
  };
  await click('[data-checkbox-state=default] .checkbox');
  assert.equal(await evaluate('document.querySelector("#previewCheckboxDefault").checked'),true);
  assert.equal(await evaluate('getComputedStyle(document.querySelector("label[for=previewCheckboxDefault]")).color'),'rgb(0, 196, 116)');
  await click('label[for=previewCheckboxDefault]');
  assert.equal(await evaluate('document.querySelector("#previewCheckboxDefault").checked'),false);
  await click('[data-checkbox-state=disabled] .checkbox');
  assert.equal(await evaluate('document.querySelector("#previewCheckboxDisabled").checked'),false);
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});
  await focus('#previewCheckboxDefault');await key(' ');
  assert.equal(await evaluate('document.querySelector("#previewCheckboxDefault").checked'),true);
  const focusRing=await visibleFocus('[data-checkbox-state=default] .checkbox');
  await key(' ');assert.equal(await evaluate('document.querySelector("#previewCheckboxDefault").checked'),false);
  await focus('#previewCheckboxSelected');await key('Tab');
  assert.equal(await evaluate('document.activeElement.tagName'), 'INPUT');
  assert.notEqual(await evaluate('document.activeElement.type'),'checkbox');
  await focus('#previewCustomCheckbox');await key('Tab');await key('Tab',true);
  const customFocus=await visibleFocus('#previewCustomChecks sq-checkbox .checkable');
  await evaluate(`document.querySelector('#previewCheckboxes').style.setProperty('--sq-color-brand','#123456')`);
  const inherited=await evaluate(`getComputedStyle(document.querySelector('[data-checkbox-state=selected] .checkbox')).backgroundColor`);
  assert.equal(inherited,'rgb(18, 52, 86)');
  await evaluate(`document.querySelector('#previewCheckboxes').style.removeProperty('--sq-color-brand')`);
  const radio=await evaluate(`(()=>{const r=document.querySelector('#previewFields .radio'),s=getComputedStyle(r),b=r.getBoundingClientRect();return {width:b.width,height:b.height,radius:s.borderRadius,padding:s.padding,border:s.borderTopColor}})()`);
  assert.deepEqual(radio,{width:20,height:20,radius:'50%',padding:'0px',border:'rgb(0, 196, 116)'});
  return {states,focusRing,customFocus,inherited,radio,squareAndLabelToggle:true,disabledSkipped:true};
}
async function checkRadioStyles() {
  const states=await evaluate(`Array.from(document.querySelectorAll('[data-radio-state]')).map(e=>{
    const input=e.querySelector('input'),circle=e.querySelector('.radio'),label=e.querySelector('label'),dot=e.querySelector('.inner'),cs=getComputedStyle(circle),ls=getComputedStyle(label),ds=getComputedStyle(dot),r=circle.getBoundingClientRect(),lr=label.getBoundingClientRect(),dr=dot.getBoundingClientRect();
    return {name:e.dataset.radioState,checked:input.checked,disabled:input.disabled,label:ls.color,fontSize:ls.fontSize,lineHeight:ls.lineHeight,weight:ls.fontWeight,font:ls.fontFamily,
      width:r.width,height:r.height,gap:lr.x-r.right,radius:cs.borderRadius,border:cs.borderTopColor,stroke:cs.borderTopWidth,background:cs.backgroundColor,dotWidth:dr.width,dotHeight:dr.height,dotRadius:ds.borderRadius,dotOpacity:ds.opacity,dotColor:ds.backgroundColor,decorative:circle.getAttribute('aria-hidden'),centerDelta:Math.abs(r.x+r.width/2-dr.x-dr.width/2)+Math.abs(r.y+r.height/2-dr.y-dr.height/2)};
  })`);
  assert.equal(states.length,4);
  for(const s of states){
    const disabled=s.name==='disabled',selected=s.name==='selected';
    assert.equal(s.width,20);assert.equal(s.height,20);assert.equal(s.gap,10);assert.equal(s.radius,'50%');assert.equal(s.stroke,'1px');
    assert.equal(s.fontSize,'14px');assert.equal(s.lineHeight,'24px');assert.equal(s.weight,'400');assert(s.font.includes('Space Grotesk'));
    assert.equal(s.checked,selected);assert.equal(s.disabled,disabled);
    assert.equal(s.border,disabled?'rgb(170, 170, 170)':'rgb(0, 196, 116)');
    assert.equal(s.background,disabled?'rgb(235, 235, 235)':selected?'rgb(0, 196, 116)':'rgb(255, 255, 255)');
    assert.equal(s.label,disabled?'rgb(170, 170, 170)':s.name==='hover'?'rgb(0, 196, 116)':'rgb(32, 32, 32)');
    assert.equal(s.dotWidth,8);assert.equal(s.dotHeight,8);assert.equal(s.dotRadius,'50%');assert(s.centerDelta<1);
    assert.equal(s.dotOpacity,selected?'1':'0');assert.equal(s.dotColor,disabled?'rgb(170, 170, 170)':'rgb(255, 255, 255)');assert.equal(s.decorative,'true');
  }
  const click=async selector=>{
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);
    const p=await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...p});
    await cdp('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,...p});
    await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,...p});
  };
  await click('[data-radio-state=default] .radio');
  assert.equal(await evaluate('document.querySelector("#previewRadioDefault").checked'),true);
  assert.equal(await evaluate('document.querySelectorAll("input[name=previewRadioStates]:checked").length'),1);
  assert.equal(await evaluate('getComputedStyle(document.querySelector("label[for=previewRadioDefault]")).color'),'rgb(0, 196, 116)');
  await click('label[for=previewRadioSelected]');
  assert.equal(await evaluate('document.querySelector("#previewRadioSelected").checked'),true);
  assert.equal(await evaluate('document.querySelector("#previewRadioDefault").checked'),false);
  await click('[data-radio-state=disabled] .radio');
  assert.equal(await evaluate('document.querySelector("#previewRadioDisabled").checked'),false);
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});
  await focus('#previewRadioDefault');await key(' ');
  assert.equal(await evaluate('document.querySelector("#previewRadioDefault").checked'),true);
  await key('ArrowRight');assert.equal(await evaluate('document.activeElement.id'),'previewRadioHover');
  await key('ArrowRight');assert.equal(await evaluate('document.activeElement.id'),'previewRadioSelected');
  const focusRing=await visibleFocus('[data-radio-state=selected] .radio');
  await key('ArrowRight');assert.equal(await evaluate('document.activeElement.id'),'previewRadioDefault');
  await key('ArrowLeft');assert.equal(await evaluate('document.activeElement.id'),'previewRadioSelected');
  assert.equal(await evaluate('document.querySelectorAll("input[name=previewRadioStates]:checked").length'),1);
  assert.equal(await evaluate('document.querySelector("#previewRadioGroup .checkable.checked label").textContent'),'Standard');
  await key('Tab');assert.notEqual(await evaluate('document.activeElement.id'),'previewRadioDisabled');
  await focus('#previewCustomWeekly');await key('ArrowLeft');
  assert.equal(await evaluate('document.querySelector("#previewCustomDaily").checked'),true);
  const customFocus=await visibleFocus('#previewCustomChecks sq-radiobutton .checkable:has(:focus-visible)');
  await evaluate(`document.querySelector('#previewRadios').style.setProperty('--sq-color-brand','#123456')`);
  const inherited=await evaluate(`getComputedStyle(document.querySelector('[data-radio-state=selected] .radio')).backgroundColor`);assert.equal(inherited,'rgb(18, 52, 86)');
  await evaluate(`document.querySelector('#previewRadios').style.removeProperty('--sq-color-brand')`);
  return {states,focusRing,customFocus,inherited,singleSelection:true,groupIsolation:true,circleAndLabelSelect:true,disabledSkipped:true};
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
  for (width of (phase6 ? [1440, 390, 320] : [1440, 390])) {
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
    assert.deepEqual(sizes.buttons.map(x => x.height), [24,32,40,56]);
    assert.deepEqual(sizes.fields.map(x => x.height), [28,32,40]);
    assert.deepEqual(sizes.progress.map(x => x.height), [4,8,12]);
    assert(sizes.progress.every(x => x.value === '62'));
    if (width === 1440) assert.deepEqual(sizes.rows.map(x => x.height), [36,40,44]);
    assert.equal(sizes.calendar, 320); assert.equal(sizes.time, 56); assert.equal(sizes.overflow, false);
    const checks = { width, sizes, buttonVariants: await checkButtonVariants(), links: await checkLinkStyles(), checkboxes: await checkCheckboxStyles(), radios: await checkRadioStyles() }; report.checks.push(checks);
    const targets = [
      ['overview','#componentPreview'],['buttons','#previewButtons'],['links','#previewLinks'],['anchors','#previewLinks .link-states:last-child'],['fields','#previewFields'],['checkboxes','#previewCheckboxes'],['radios','#previewRadios'],
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
    if (phase6) {
      await focus('#stylePrimaryButton button');
      await key('Tab');
      assert.equal(await evaluate('document.activeElement.classList.contains("sq-button-secondary")'), true);
      await visibleFocus('[data-button-size=M] .sq-button-secondary');
      await key('Tab');
      assert.equal(await evaluate('document.activeElement===document.querySelector("#styleNeutralButton button")'), true);
      await visibleFocus('#styleNeutralButton button');
      await capture('button-focus', '#styleNeutralButton button');
      await key('Tab');
      assert.equal(await evaluate('document.activeElement.closest("[data-button-size]")?.dataset.buttonSize'), 'L');
      checks.disabledButtonSkipped = true;

      await focus('#styleDefaultField'); await key('Tab'); await key('Tab', true);
      await visibleFocus('#formStylePreview sq-input:first-child .input-field');
      await capture('input-focus', '#formStylePreview sq-input:first-child');
      await evaluate('document.querySelector("label[for=styleDefaultField]").click()');
      assert.equal(await evaluate('document.activeElement.id'), 'styleDefaultField');
      await focus('#styleErrorField'); await key('Tab');
      assert.notEqual(await evaluate('document.activeElement.id'), 'styleDisabledField');
      checks.fieldLabelAndDisabledTab = true;

      const trigger = '[data-field-size=S] [role=combobox]';
      await focus(trigger); await key('ArrowDown'); await key('ArrowDown'); await key('ArrowDown');
      await visibleFocus(trigger);
      const menu = await evaluate(`(() => {const e=document.querySelector('[data-field-size=S] [role=listbox]');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {left:r.left,right:r.right,screenWidth:document.documentElement.clientWidth,maxHeight:getComputedStyle(e).maxHeight};})()`);
      assert(menu.left >= 0 && menu.right <= menu.screenWidth && menu.maxHeight === '200px');
      await capture('dropdown-keyboard', '[data-field-size=S]');
      await key('Enter');
      await waitFor('document.querySelector("[data-field-size=S] .chosen-item")?.textContent==="Development"');
      await key('ArrowDown'); await key('Escape');
      assert.equal(await evaluate('document.querySelector("[data-field-size=S] [role=combobox]").getAttribute("aria-expanded")'), 'false');
      await key('ArrowDown'); await key('Tab');
      assert.equal(await evaluate('document.querySelector("[data-field-size=S] [role=combobox]").getAttribute("aria-expanded")'), 'false');
      checks.dropdownKeyboard = menu;

      const checkbox = '#previewFields sq-checkbox input';
      await focus(checkbox);
      const before = await evaluate('document.querySelector("#previewFields sq-checkbox input").checked');
      await key(' ');
      assert.equal(await evaluate('document.querySelector("#previewFields sq-checkbox input").checked'), !before);
      await visibleFocus('#previewFields sq-checkbox .checkbox');
      await capture('checkbox-focus', '#previewFields sq-checkbox');
      await focus('#previewFields sq-radiobutton input'); await key('ArrowRight');
      assert.equal(await evaluate('document.querySelectorAll("#previewFields sq-radiobutton input")[1].checked'), true);
      await visibleFocus('#previewFields sq-radiobutton:nth-of-type(2) .radio');
      await capture('radio-focus', '#previewFields sq-radiobutton:nth-of-type(2)');
      await focus('#previewCustomCheckbox'); await key(' ');
      await visibleFocus('#previewCustomChecks sq-checkbox .checkable');
      await capture('custom-checkbox-focus', '#previewCustomChecks sq-checkbox');
      await focus('#previewCustomWeekly'); await key('ArrowLeft');
      assert.equal(await evaluate('document.querySelector("#previewCustomDaily").checked'), true);
      await visibleFocus('#previewCustomChecks sq-radiobutton .checkable');
      await capture('custom-radio-focus', '#previewCustomChecks sq-radiobutton');
      checks.nativeKeyboardAndFocus = true;

      const labels = await evaluate(`(() => {
        const root=document.querySelector('#componentPreview');const ids=[...root.querySelectorAll('[id]')].map(e=>e.id);
        return {duplicates:ids.filter((id,index)=>ids.indexOf(id)!==index),missingTargets:[...root.querySelectorAll('label[for]')].filter(e=>!document.getElementById(e.htmlFor)).map(e=>e.htmlFor),
          checkableNames:[...root.querySelectorAll('input[type=checkbox],input[type=radio]')].map(e=>[...e.labels].map(l=>l.textContent.trim()).join(' '))};
      })()`);
      assert.equal(labels.duplicates.length, 0); assert.equal(labels.missingTargets.length, 0);
      assert(labels.checkableNames.every(Boolean));
      checks.labelAssociations = labels;
      const reference = await evaluate(`(() => {
        const b=getComputedStyle(document.querySelector('#styleNeutralButton button'));const f=getComputedStyle(document.querySelector('#formStylePreview sq-input:nth-child(2) .input-field'));
        const e=getComputedStyle(document.querySelector('#formStylePreview sq-input:nth-child(2) .sq-field-message'));
        const p=getComputedStyle(document.querySelector('#stylePrimaryButton button'));
        return {button:{fontSize:b.fontSize,lineHeight:b.lineHeight,weight:b.fontWeight,radius:b.borderRadius,background:b.backgroundColor,text:b.color},
          primary:{background:p.backgroundColor,text:p.color},
          field:{radius:f.borderRadius,stroke:f.boxShadow,fontSize:f.fontSize,lineHeight:f.lineHeight,padding:f.padding,groupHeight:document.querySelector('#formStylePreview sq-input:nth-child(2) .sq-form-field').getBoundingClientRect().height},
          error:{fontSize:e.fontSize,lineHeight:e.lineHeight,color:e.color},fonts:[400,600,700].map(w=>document.fonts.check(w+' 14px "Space Grotesk"'))};
      })()`);
      assert.deepEqual(reference.button, {fontSize:'14px',lineHeight:'24px',weight:'600',radius:'4px',background:'rgb(250, 250, 250)',text:'rgb(32, 32, 32)'});
      assert.equal(reference.field.radius, '4px'); assert(reference.field.stroke.includes('rgb(220, 220, 220)'));
      assert.equal(reference.field.fontSize, '12px'); assert.equal(reference.field.lineHeight, '20px');
      assert.equal(reference.field.padding, '4px 8px'); assert.equal(reference.field.groupHeight, 64);
      assert.deepEqual(reference.primary, {background:'rgb(0, 196, 116)',text:'rgb(255, 255, 255)'});
      assert.deepEqual(reference.error, {fontSize:'10px',lineHeight:'16px',color:'rgb(255, 56, 21)'});
      assert(reference.fonts.every(Boolean)); checks.savedReferenceProperties = reference;
      await capture('reference-neutral-m', '#styleNeutralButton button', true);
      await capture('reference-small-field-error', '#formStylePreview sq-input:nth-child(2) .sq-form-field', true);
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
      if (phase6) {
        const ax = await cdp('Accessibility.getFullAXTree');
        const dialog = ax.nodes.find(node => node.role?.value === 'dialog' && !node.ignored);
        assert(dialog?.name?.value.includes('Example dialog'));
        checks.dialogAccessibleName = dialog.name.value;
      }
      if (size === 'small') await evaluate('document.querySelector(".modal-window .close").click()');
      else if (size === 'medium') await evaluate('document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))');
      else await evaluate('document.querySelector(".modal-cover").click()');
      await waitFor('!!document.querySelector(".modal-cover.display-none")');
    }
    console.log(`Preview geometry and Phase ${phase} interactions passed at ${width}px`);
  }
  if (phase6) {
    report.tableBreakpoints = [];
    for (width of [861, 860]) {
      height = 1000;
      await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
      await cdp('Page.navigate', { url: 'about:blank' }); await cdp('Page.navigate', { url: `${base}/#/preview` });
      await waitFor('!!document.querySelector("[data-table-size=medium] tbody tr")');
      await evaluate('document.fonts.ready.then(()=>true)');
      const state = await evaluate('({header:getComputedStyle(document.querySelector("[data-table-size=medium] thead")).display,overflow:document.documentElement.scrollWidth>innerWidth})');
      assert.equal(state.header, width === 860 ? 'none' : 'table-header-group'); assert.equal(state.overflow, false);
      report.tableBreakpoints.push({width,...state});
      await capture('table-breakpoint', '[data-table-size=medium]');
    }
  }
  if (process.env.STYLE_SHOWCASE_REFRESH === '1') {
    report.showcase = [];
    await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `
      const demoFetch=window.fetch.bind(window);
      window.fetch=(input,init)=>{
        const url=String(input?.url||input);
        if(url.includes('jsonplaceholder.typicode.com/todos')) return Promise.resolve(new Response(JSON.stringify(Array.from({length:12},(_,i)=>({userId:1,id:i+1,title:'Example task '+(i+1),completed:i%2===0}))),{headers:{'Content-Type':'application/json'}}));
        if(url.includes('reqres.in/api/')) return Promise.resolve(new Response('{}',{headers:{'Content-Type':'application/json'}}));
        return demoFetch(input,init);
      };
    ` });
    for (width of [1440, 960, 390, 320]) {
      height = 1000;
      await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
      await cdp('Page.navigate', { url: 'about:blank' }); await cdp('Page.navigate', { url: `${base}/#/about` });
      await waitFor('!!document.querySelector(".home-hero")'); await evaluate('document.fonts.ready.then(()=>true)');
      const shell = await evaluate(`(() => {const e=document.querySelector('.scrollable');const header=document.querySelector('.demo-topbar');const logo=document.querySelector('.demo-logo');const r=logo.getBoundingClientRect();return {width:innerWidth,overflow:e.scrollWidth>e.clientWidth+1,headerOverflow:header.scrollWidth>header.clientWidth+1,sidebar:getComputedStyle(document.querySelector('.app-nav')).display,logoLoaded:logo.complete&&logo.naturalWidth>0,logo:{src:logo.getAttribute('src'),naturalWidth:logo.naturalWidth,naturalHeight:logo.naturalHeight,width:r.width,height:r.height},background:getComputedStyle(document.querySelector('.sq-app')).backgroundColor};})()`);
      assert.equal(shell.overflow, false); assert.equal(shell.logoLoaded, true); assert.equal(shell.background, 'rgb(250, 250, 250)');
      assert.equal(shell.sidebar, width > 960 ? 'flex' : 'none');
      assert.equal(shell.headerOverflow, false);
      assert.equal(shell.logo.src, 'assets/logo.svg');
      assert.equal(shell.logo.naturalWidth, 896); assert.equal(shell.logo.naturalHeight, 576);
      assert(Math.abs(shell.logo.width/shell.logo.height-shell.logo.naturalWidth/shell.logo.naturalHeight)<0.001);
      await capture('demo-home', '.home-hero');
      await evaluate('document.querySelector(".hero-preview-actions sq-button button").click()');
      await waitFor('document.querySelector(".hero-save-status").textContent.includes("saved")');
      await evaluate('document.querySelectorAll(".hero-preview-actions sq-button button")[1].click()');
      await waitFor('document.querySelector(".hero-save-status").textContent.includes("Try the components")');
      if (width <= 960) {
        await evaluate('document.querySelector(".demo-menu-button").click()');
        await waitFor('document.querySelector(".demo-menu-button").getAttribute("aria-expanded")==="true"');
        await capture('demo-navigation', '.app-nav');
        await key('Escape');
        assert.equal(await evaluate('document.activeElement===document.querySelector(".demo-menu-button")'), true);
        assert.equal(await evaluate('getComputedStyle(document.querySelector(".app-nav")).display'), 'none');
        await evaluate('document.querySelector(".demo-menu-button").click()');
        await evaluate(`document.querySelector('.app-nav a[href="#/preview"]').click()`);
        await waitFor('!!document.querySelector("#componentPreview")');
        assert.equal(await evaluate('getComputedStyle(document.querySelector(".app-nav")).display'), 'none');
        shell.mobileNavigation = true;
      }
      shell.routes = [];
      for (const route of (width === 1440 || width === 390 ? ['preview','sq-ui','sq-common','datatable','datetime-picker','modal'] : ['preview'])) {
        await cdp('Page.navigate', { url: `${base}/#/${route}` });
        await waitFor(`location.hash==='#/${route}'&&!!document.querySelector('router-outlet')?.nextElementSibling`);
        await delay(250);
        const routeState = await evaluate(`(() => {const e=document.querySelector('.scrollable');return {hash:location.hash,overflow:e.scrollWidth>e.clientWidth+1,active:document.querySelector('.app-nav [aria-current=page]')?.getAttribute('href')};})()`);
        assert.equal(routeState.overflow, false, route); assert.equal(routeState.active, '#/'+route);
        shell.routes.push(routeState);
        await capture('demo-'+route, '.scrollable > :not(router-outlet)');
      }
      report.showcase.push(shell);
      console.log('Demo shell, navigation and routes passed at '+width+'px');
    }
  }
  assert.equal(report.runtimeErrors.length, 0); report.success = true;
} finally {
  await writeFile(join(output, 'manifest.json'), JSON.stringify(report, null, 2)+'\n');
  if (socket?.readyState === WebSocket.OPEN) { try { await cdp('Browser.close'); } catch {} socket.close(); }
  browser.kill();
}
