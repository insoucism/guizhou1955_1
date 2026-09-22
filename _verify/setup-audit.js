window.__probe = (function(){
  function box(sel){
    var el = document.querySelector(sel);
    if(!el) return null;
    var r = el.getBoundingClientRect();
    return {h:Math.round(r.height), top:Math.round(r.top), bottom:Math.round(r.bottom), w:Math.round(r.width)};
  }
  function all(sel){
    return Array.prototype.map.call(document.querySelectorAll(sel), function(el){
      var r = el.getBoundingClientRect();
      return {tag:(el.className||'').split(' ')[0], h:Math.round(r.height), top:Math.round(r.top)};
    });
  }
  // 横向溢出检测（整页）
  var overflow = [];
  Array.prototype.forEach.call(document.querySelectorAll('main *'), function(el){
    var r = el.getBoundingClientRect();
    if (r.width > 0 && (r.right > innerWidth + 2 || r.left < -2)) {
      var cls = (el.className && typeof el.className === 'string') ? el.className.split(' ')[0] : el.tagName;
      overflow.push(cls + '@' + Math.round(r.left) + '..' + Math.round(r.right) + ' w' + Math.round(r.width));
    }
  });
  // 文字折叠检查：展开态元素高度是否为 0
  var collapsed = [];
  ['h2.sec-title','.card-value','.pillar-title','.role-name','.pane-name'].forEach(function(sel){
    var n = document.querySelector(sel);
    if (n && n.getBoundingClientRect().height < 12) collapsed.push(sel);
  });

  return {
    vp: innerWidth + 'x' + innerHeight,
    hero: box('.hero'),
    scrollH: document.documentElement.scrollHeight,
    docW: document.documentElement.scrollWidth + '/' + document.documentElement.clientWidth,
    sloganBottom: Math.round(document.querySelector('.hero-slogan').getBoundingClientRect().bottom),
    cueTop: Math.round(document.querySelector('.scroll-cue').getBoundingClientRect().top),
    navBrand: box('.nav-brand'),
    navLinks: box('.nav-links'),
    overflow: overflow.slice(0, 8),
    overflowCount: overflow.length,
    collapsed: collapsed,
    h1font: getComputedStyle(document.querySelector('.hero-title-cn')).fontFamily.split(',')[0]
  };
})();
