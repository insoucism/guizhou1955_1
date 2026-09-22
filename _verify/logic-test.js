// 用最小 DOM 桩在 Node 里跑 main.js，定位浏览器里静默失败的渲染步骤。
// 用法：node _verify/logic-test.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = path.resolve(__dirname, '..', 'index.html');
const js  = fs.readFileSync(path.resolve(__dirname, '..', 'main.js'), 'utf8');
const html = fs.readFileSync(src, 'utf8');

// 从真实 HTML 里抓出所有 id，保证桩的 querySelector('#id') 与现实一致
const ids = Array.from(html.matchAll(/\sid="([^"]+)"/g)).map(m => m[1]);

function makeEl(tag, cls, id) {
  const el = {
    tagName: (tag || 'div').toUpperCase(),
    className: cls || '',
    id: id || '',
    dataset: {},
    children: [],
    parentNode: null,
    innerHTML: '',
    textContent: '',
    style: { setProperty(){}, },
    classList: {
      _s: new Set((cls || '').split(/\s+/).filter(Boolean)),
      add(...c){ c.forEach(x => this._s.add(x)); },
      remove(...c){ c.forEach(x => this._s.delete(x)); },
      toggle(c, f){ const on = f === undefined ? !this._s.has(c) : !!f; on ? this._s.add(c) : this._s.delete(c); return on; },
      contains(c){ return this._s.has(c); }
    },
    setAttribute(k, v){ this['attr_' + k] = v; },
    getAttribute(k){ return this['attr_' + k]; },
    removeAttribute(k){ delete this['attr_' + k]; },
    addEventListener(){}, removeEventListener(){},
    getBoundingClientRect(){ return { top: 0, bottom: 100, left: 0, right: 100, width: 100, height: 100 }; },
    querySelector(){ return null; },
    querySelectorAll(){ return []; },
    closest(){ return null; },
    appendChild(c){ c.parentNode = this; this.children.push(c); return c; },
    focus(){}, click(){},
    getContext(){ return null; }
  };
  return el;
}

const registry = {};
ids.forEach(id => { registry[id] = makeEl('div', '', id); });

// tablist / tabs：静态 HTML 里有 4 个 .tab
const tabs = ['grand', 'small', 'close', 'dark'].map(k => {
  const t = makeEl('button', 'tab');
  t.dataset.key = k;
  t.setAttribute('id', 'tab-' + k);
  t.setAttribute('aria-controls', 'panel-' + k);
  return t;
});
const tabWrap = registry['endingTabs'];
tabWrap.querySelectorAll = (sel) => sel === '.tab' ? tabs : [];

const errors = [];
const documentStub = {
  readyState: 'complete',
  documentElement: makeEl('html'),
  body: makeEl('body'),
  title: '',
  getElementById(id){ return registry[id] || null; },
  querySelector(sel){
    if (sel === '#endingTabs') return tabWrap;
    const m = /^#([\w-]+)$/.exec(sel);
    if (m) return registry[m[1]] || null;
    return null;
  },
  querySelectorAll(sel){
    if (sel === '.tab') return tabs;
    return [];
  },
  addEventListener(){},
  createElement(tag){ return makeEl(tag); }
};

const rafQueue = [];
const sandbox = {
  document: documentStub,
  window: {
    matchMedia: () => ({ matches: false }),
    addEventListener(){},
    requestAnimationFrame(cb){ rafQueue.push(cb); return rafQueue.length; },
    setTimeout: (cb) => { try { cb(); } catch (e) { errors.push('setTimeout: ' + e.message); } return 1; },
    clearTimeout(){},
    scrollTo(){}, scrollY: 0, pageYOffset: 0, innerHeight: 900, innerWidth: 1400,
    history: { replaceState(){} },
    IntersectionObserver: function(){ return { observe(){}, unobserve(){} }; },
    setTimeout_: null
  },
  console,
  setTimeout: (cb) => { try { cb(); } catch (e) { errors.push('setTimeout: ' + e.message); } return 1; },
  clearTimeout(){},
  requestAnimationFrame(cb){ rafQueue.push(cb); return rafQueue.length; },
  MutationObserver: function(){ return { observe(){}, disconnect(){} }; },
  IntersectionObserver: function(){ return { observe(){}, unobserve(){} }; },
  JSON, Math, String, Number, Object, Array, RegExp, Date
};
sandbox.window.setTimeout = sandbox.setTimeout;
sandbox.window.clearTimeout = sandbox.clearTimeout;
sandbox.globalThis = sandbox;

try {
  vm.createContext(sandbox);
  vm.runInContext(js, sandbox, { filename: 'main.js' });
} catch (e) {
  errors.push('THROW: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n'));
}

// 执行排队的 rAF
let guard = 0;
while (rafQueue.length && guard++ < 50) {
  const cb = rafQueue.shift();
  try { cb(); } catch (e) { errors.push('raf: ' + e.message); }
}

const report = {
  timelineListHTML_len: (registry['timelineList'] || {}).innerHTML ? registry['timelineList'].innerHTML.length : 0,
  roleGridMainHTML_len: (registry['roleGridMain'] || {}).innerHTML ? registry['roleGridMain'].innerHTML.length : 0,
  roleGridExtraHTML_len: (registry['roleGridExtra'] || {}).innerHTML ? registry['roleGridExtra'].innerHTML.length : 0,
  endingPanelsHTML_len: (registry['endingPanels'] || {}).innerHTML ? registry['endingPanels'].innerHTML.length : 0,
  errors
};
console.log(JSON.stringify(report, null, 2));
