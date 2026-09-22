window.__probe = (function(){
  function n(sel){ return document.querySelectorAll(sel).length; }
  var tl = document.querySelectorAll('.tl-item');
  var fact = document.querySelectorAll('.tl-item.is-fact').length;
  var art  = document.querySelectorAll('.tl-item.is-art').length;
  var rc = document.querySelectorAll('.role-card');
  var panes = document.querySelectorAll('.tabpane');
  var tabs = document.querySelectorAll('.tab');
  var activePanes = document.querySelectorAll('.tabpane.active:not([hidden])').length;
  var openRoles = document.querySelectorAll('.role-card.open').length;
  var openTl = document.querySelectorAll('.tl-item.open').length;
  var bub = document.querySelector('.tl-item.open .tl-bubble');
  return {
    vp: innerWidth + 'x' + innerHeight,
    tlCount: tl.length, factCount: fact, artCount: art,
    roleCount: rc.length,
    veilCount: n('.role-card--veil'),
    tabCount: tabs.length, paneCount: panes.length, activePanes: activePanes,
    openRoles: openRoles, openTl: openTl,
    bubbleH: bub ? Math.round(bub.getBoundingClientRect().height) : -1,
    bubbleOpacity: bub ? getComputedStyle(bub).opacity : 'n/a',
    roleMoreH: openRoles ? Math.round(document.querySelector('.role-card.open .role-more').getBoundingClientRect().height) : -1,
    veilFilter: (function(){ var v=document.querySelector('.role-card--veil .role-name'); return v?getComputedStyle(v).filter:'n/a'; })(),
    activeTab: (function(){ var t=document.querySelector('.tab[aria-selected="true"]'); return t?t.dataset.key:'none'; })(),
    paneName: (function(){ var p=document.querySelector('.tabpane.active .pane-name'); return p?p.textContent:'none'; })(),
    cascade: document.documentElement.scrollHeight,
    docW: document.documentElement.scrollWidth + '/' + document.documentElement.clientWidth
  };
})();
