// 生成用于无头浏览器断言/量取的副本（CSS 内联 + 可选装订脚本）。
// 用法：node _verify/mkpage.js <setupFile|-> <outFile> [sectionId]
//   sectionId：只显示该 section（并把其余部分隐藏），用于分区截图。
//   注意：虚拟时间预算下 scrollIntoView 常赶不上合成帧，故用 CSS 隔离而非滚动。
const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', 'index.html');
const setupArg = process.argv[2];
const out = path.resolve(process.argv[3]);
const only = process.argv[4] || '';

let html = fs.readFileSync(src, 'utf8');
const css = fs.readFileSync(path.resolve(__dirname, '..', 'style.css'), 'utf8');
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '\n</style>');
// 无头浏览器在 file:// 下不会去解析外链资源（CSS/JS 都不会），取证副本一律内联。
const js = fs.readFileSync(path.resolve(__dirname, '..', 'main.js'), 'utf8').replace(/^\uFEFF/, '');
html = html.replace('<script src="main.js"></script>', '<script>\n' + js + '\n</script>');
// 取证副本含中文，补一个 charset 头，避免被按 ANSI 解码
if (!/^\s*<meta charset/i.test(html)) {
  html = '<meta charset="UTF-8">\n' + html;
}

// 分区隔离：目标 section 置顶，其余全部隐藏
const isolate = only ? `
<style id="__isolate">
  .nav,.scroll-cue,.scroll-progress{display:none !important}
  main > section{display:none !important}
  #${only}{display:block !important;padding-top:3rem !important}
  #${only} .reveal{opacity:1 !important;transform:none !important}
  #hero{display:none !important}
</style>` : '';

const setup = (setupArg && setupArg !== '-')
  ? fs.readFileSync(path.resolve(setupArg), 'utf8').replace(/^\uFEFF/, '')
  : '/* 无装订 */';

// 装订：注入到 </body> 之前（main.js 之后），readyState 轮询 + 硬超时兜底。
// 结果同时写入 title 与 console，便于 --dump-dom / --enable-logging 两种取证方式。
const inject = `
<style id="__verify">
  /* 取证用：关掉过渡与动画，让展开态/入场态直接落到终态，
     否则虚拟时间预算下量到的永远是起始值（max-height:0）。 */
  *,*::before,*::after{transition:none !important;animation:none !important}
  .reveal{opacity:1 !important;transform:none !important}
</style><script>
(function(){
  var done = false;
  window.addEventListener('error', function(ev){
    try{ console.log('VERIFY_PAGE_ERROR=' + ev.message + ' @' + (ev.filename||'') + ':' + ev.lineno); }catch(e){}
  });
  function run(){
    if (done) return; done = true;
    var payload;
    try{ ${setup} payload = window.__probe || {note:'no __probe'}; }
    catch(e){ payload = {error: String(e && e.message || e)}; }
    var s = JSON.stringify(payload);
    document.title = 'READY|' + s;
    try{ console.log('VERIFY_PROBE=' + s); }catch(e){}
  }
  function tick(){
    if (document.readyState === 'complete') {
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ setTimeout(run, 80); }); });
    } else { setTimeout(tick, 30); }
  }
  tick();
  setTimeout(run, 2500); // 兜底
})();
<\/script>
</body>`;

html = html.replace('</body>', inject + isolate);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html, 'utf8');
console.log('  生成 -> ' + path.basename(out));
