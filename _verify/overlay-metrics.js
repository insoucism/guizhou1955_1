// 把测量的几何值直接画进页面，随截图一起拍到——避免探针与截图不同源造成的误判。
(function () {
  function b(sel) {
    var el = document.querySelector(sel);
    if (!el) return 'null';
    var r = el.getBoundingClientRect();
    return 'w' + Math.round(r.width) + ' h' + Math.round(r.height) + ' t' + Math.round(r.top);
  }
  function cs(sel, prop) {
    var el = document.querySelector(sel);
    return el ? getComputedStyle(el)[prop] : 'null';
  }
  var lines = [
    'viewport ' + innerWidth + 'x' + innerHeight,
    'hero-inner display=' + cs('.hero-inner', 'display'),
    'hero-inner transform=' + cs('.hero-inner', 'transform'),
    'hero-inner box=' + b('.hero-inner'),
    'hero-copy   box=' + b('.hero-copy') + ' display=' + cs('.hero-copy', 'display'),
    'cig-paper   box=' + b('.cig-paper'),
    'hero-title  box=' + b('.hero-title'),
    'title-cn fs=' + cs('.hero-title-cn', 'fontSize'),
    'hero-lead fs=' + cs('.hero-lead', 'fontSize') + ' box=' + b('.hero-lead'),
    'scroll-cue  box=' + b('.scroll-cue')
  ];
  var box = document.createElement('pre');
  box.textContent = lines.join('\n');
  box.setAttribute('style', [
    'position:fixed', 'left:0', 'top:0', 'z-index:99999',
    'margin:0', 'padding:8px 12px',
    'background:#fff', 'color:#000',
    'font:12px/1.5 Consolas,monospace',
    'white-space:pre', 'pointer-events:none'
  ].join(';'));
  document.body.appendChild(box);
})();
