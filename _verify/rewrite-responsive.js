// 重写 style.css 的「19. 响应式」段落：用互斥区间取代层层叠加的补丁。
// 「20. 降级与无障碍」及其后的规则原样保留。
// 用法：node _verify/rewrite-responsive.js
const fs = require('fs');
const path = require('path');

const cssPath = path.resolve(__dirname, '..', 'style.css');
const css = fs.readFileSync(cssPath, 'utf8');

const marker = '/* ══════════════════════════════════════════════════════════\n   19. 响应式';
const idx = css.indexOf(marker);
if (idx < 0) throw new Error('未找到「19. 响应式」段落标记');

const head = css.slice(0, idx);
const rest = css.slice(idx);
const tailIdx = rest.indexOf('/* ---------- 20. 降级与无障碍 ---------- */');
if (tailIdx < 0) throw new Error('未找到「20. 降级与无障碍」段落标记');
const tail = rest.slice(tailIdx);

const responsive = `/* ══════════════════════════════════════════════════════════
   19. 响应式
   首屏四档版式，区间互斥，且宽屏档位一律不写 .hero-inner 的 transform，
   只有分栏档位会放大——避免矮屏缩放规则反向压住分栏版式。

     ① ≥1501 宽                    堆叠居中
     ② 861—1500 宽 且 高≤820       左右分栏（文案在左，香烟纸在右）
     ③ ≤860 宽                     手机单列
     ④ 矮屏（按屏高分档，排除分栏区间以外的宽度）

   数值一律用 px / vw / rem，不用 ch、不用 fr——它们会随字号变化而改变列宽。
   ══════════════════════════════════════════════════════════ */

/* ── ① 分栏版式：矮而宽（笔记本外接屏、投影，含高 DPI 缩放后的 1388×755 这类视口）──
   上下堆叠会撑得太高、中间空出一条，改为左右分栏。 */
@media (min-width:861px) and (max-width:1500px) and (max-height:820px){
  .hero{
    padding-top:calc(var(--nav-h) + .9rem);
    padding-bottom:1.5rem;
  }
  .hero-inner{
    display:flex;
    flex-direction:row;
    flex-wrap:nowrap;
    align-items:center;
    justify-content:center;
    gap:clamp(1.5rem,2.6vw,2.8rem);
    text-align:left;
    max-width:1120px;
    margin-inline:auto;
    transform:none;
  }
  .hero-copy{
    display:flex;
    flex-direction:column;
    align-items:flex-start;
    text-align:left;
    flex:0 0 auto;
    width:clamp(400px,40vw,540px);
    max-width:none;
  }
  .cig-paper{
    flex:0 0 auto;
    width:clamp(288px,26vw,344px);
    margin:0;
  }
  .hero-kicker,
  .hero-sub,
  .hero-slogan{text-indent:0}
  .scroll-cue{margin-top:1.2rem;align-items:flex-start}
  .scroll-cue-text{text-indent:0}
}
/* 分栏内容规格：高 ≤680 的屏高度富余，整体微放大填满屏高；
   681—820 屏高更高，改用大字号档位填满（两者互斥，不叠加）。 */
@media (min-width:861px) and (max-width:1500px) and (min-height:560px) and (max-height:680px){
  .hero-inner{transform:scale(1.08)}
  .hero-title-cn{font-size:clamp(2.7rem,4vw,3.5rem)}
  .hero-title-year{font-size:clamp(1.45rem,2.1vw,1.95rem)}
  .hero-title-sep{height:clamp(2rem,3.2vw,2.8rem)}
  .hero-sub{font-size:clamp(.95rem,1.6vw,1.2rem);margin-bottom:.75rem}
  .hero-lead{max-width:100%;margin:1rem 0 1.2rem;font-size:.9rem;line-height:1.85}
  .hero-meta{justify-content:flex-start;margin-bottom:1.05rem}
  .cig-paper-inner{padding:1.25rem 1.3rem 1rem}
  .cig-line-2,.cig-line-3{font-size:.96rem}
}
@media (min-width:861px) and (max-width:1500px) and (min-height:681px) and (max-height:820px){
  .hero-inner{transform:none}
  .hero-title-cn{font-size:clamp(3rem,4.4vw,4.2rem)}
  .hero-title-year{font-size:clamp(1.6rem,2.4vw,2.3rem)}
  .hero-title-sep{height:clamp(2.1rem,3.6vw,3rem)}
  .hero-sub{font-size:clamp(1rem,1.8vw,1.3rem);margin-bottom:.8rem}
  .hero-lead{max-width:100%;margin:1.1rem 0 1.3rem;font-size:1rem;line-height:1.9}
  .hero-meta{justify-content:flex-start;margin-bottom:1.15rem}
  .cig-paper-inner{padding:1.45rem 1.5rem 1.15rem}
  .cig-line-2,.cig-line-3{font-size:1.02rem}
}
/* 极矮屏：场景压到最低，别让台灯桌面吃掉半屏 */
@media (max-height:680px) and (min-width:861px){
  .hero-desk{height:11%}
  .hero-desk .desk-leaf,
  .hero-desk .desk-paper,
  .hero-desk .desk-pen{display:none}
  .hero-lamp{width:82px;left:8%;bottom:8%;opacity:.6}
  .hero-boat{bottom:14%;width:min(210px,24vw);opacity:.55}
  .hero-sea{height:38%}
}

/* ── ② 宽屏堆叠版式：按屏高分档收紧节奏。
   这里不写 .hero-inner 的 transform——只用留白与字号，读起来才不显小。 ── */
@media (min-width:1501px) and (max-height:940px){
  .hero{padding-top:calc(var(--nav-h) + 1.1rem);padding-bottom:2rem}
  .hero-title-cn{font-size:clamp(3rem,4.2vw,4.3rem)}
  .hero-title-year{font-size:clamp(1.6rem,2.3vw,2.2rem)}
  .hero-title-sep{height:clamp(2.1rem,3.5vw,3rem)}
  .hero-sub{font-size:clamp(1rem,1.7vw,1.28rem);margin-bottom:.8rem}
  .hero-lead{font-size:1rem;line-height:1.88;max-width:64ch;margin:1.05rem 0 1.3rem}
  .hero-meta{margin-bottom:1.15rem}
  .hero-slogan{font-size:clamp(1.02rem,1.4vw,1.24rem)}
  .cig-paper{width:min(408px,34vw);margin-bottom:1.3rem}
  .cig-paper-inner{padding:1.4rem 1.4rem 1.1rem}
  .cig-line-2,.cig-line-3{font-size:1rem}
  .scroll-cue{margin-top:1.7rem}
}
@media (min-width:1501px) and (max-height:830px){
  .hero{padding-top:calc(var(--nav-h) + .9rem);padding-bottom:1.7rem}
  .hero-title{margin-bottom:.6rem}
  .hero-title-cn{font-size:clamp(2.8rem,3.6vw,3.7rem)}
  .hero-sub{margin-bottom:.65rem}
  .hero-lead{margin:.9rem 0 1.05rem;line-height:1.82}
  .cig-paper{margin-bottom:1.05rem}
  .scroll-cue{margin-top:1.4rem}
}
@media (min-width:1501px) and (max-height:750px){
  .hero{padding-top:calc(var(--nav-h) + .7rem);padding-bottom:1.4rem}
  .hero-kicker{font-size:.72rem;margin-bottom:.6rem}
  .hero-title-cn{font-size:clamp(2.5rem,3.1vw,3.2rem)}
  .hero-title-year{font-size:clamp(1.25rem,1.7vw,1.7rem)}
  .hero-sub{font-size:clamp(.88rem,1.2vw,1.05rem);margin-bottom:.55rem}
  .hero-lead{margin:.75rem 0 .9rem;line-height:1.76;font-size:.92rem}
  .hero-meta{margin-bottom:.8rem}
  .cig-paper{width:min(384px,30vw);margin-bottom:.9rem}
  .cig-paper-inner{padding:1.15rem 1.25rem .95rem}
  .cig-line-1{font-size:.82rem}
  .cig-line-2,.cig-line-3{font-size:.94rem}
  .cig-sign{margin-top:.85rem;padding-top:.5rem;font-size:.76rem}
  .cig-meta{margin-top:.65rem}
  .cig-hint{margin-top:.65rem;font-size:.72rem}
  .scroll-cue{margin-top:1.1rem}
  .hero-desk{height:13%}
  .hero-lamp{width:100px;left:10%;bottom:11%}
  .hero-boat{bottom:17%;width:min(250px,20vw)}
}

/* ── ③ 中小屏过渡：卡片列数收敛 ── */
@media (max-width:1020px){
  .showcase-grid{grid-template-columns:1fr}
}

/* ── ④ 手机与窄窗：单列 + 专属纵向节奏 ── */
@media (max-width:860px){
  :root{--nav-h:60px}
  body{font-size:16px;line-height:1.9}
  .nav-toggle{display:grid}
  .nav-links{
    position:fixed;
    top:var(--nav-h);left:0;right:0;
    /* 用 grid-template-rows 做展开，而不是 max-height：
       max-height 会沿后代逐级收紧，把时间轴气泡、角色卡片梗概一起压成 0 高。 */
    grid-auto-flow:row;
    grid-auto-columns:auto;
    grid-template-rows:0fr;
    gap:0;
    padding:0 1.4rem;
    background:rgba(9,8,7,.96);
    backdrop-filter:blur(16px);
    -webkit-backdrop-filter:blur(16px);
    border-bottom:1px solid var(--line-soft);
    overflow-y:auto;
    opacity:0;
    transition:grid-template-rows .7s var(--ease),opacity .5s var(--ease),padding .5s var(--ease);
  }
  .nav-links > li{min-height:0;overflow:hidden}
  .nav-links.open{grid-template-rows:1fr;opacity:1;padding:.6rem 1.4rem 1.4rem}
  .nav-links li{border-bottom:1px dashed var(--line-soft)}
  .nav-links li:last-child{border-bottom:0}
  .nav-links a{display:block;padding:.95rem 0;font-size:.92rem}
  .nav-links a::after{display:none}

  .tl-legend-hint{display:none}
  .timeline{padding-left:1.5rem}
  .tl-item::before{left:-1.5rem}
  .tl-bubble{transition:max-height .7s var(--ease),opacity .5s var(--ease),margin .7s var(--ease)}
  .tl-bubble-inner{padding:.85rem .95rem}
  .tl-bubble-text{font-size:.84rem;line-height:1.82}
  .tl-bubble-inner::before{left:20px}

  .hero-lamp{width:100px;left:8%;bottom:19%;opacity:.6}
  .hero-lead{font-size:.95rem;line-height:1.95}
  .hero-beam,.grain{animation:none}
  .hero-boat{opacity:.5}
}
@media (max-width:620px){
  /* 窄窗堆叠：内容高于屏高时靠滚动，但不再整版缩小，保证字号可读 */
  .hero{padding-top:calc(var(--nav-h) + 1rem);padding-bottom:2.4rem}
  .hero-kicker{font-size:.7rem;letter-spacing:.32em;margin-bottom:.7rem}
  .hero-title{margin-bottom:.55rem}
  .hero-title-cn{font-size:clamp(2.5rem,11vw,3.3rem)}
  .hero-title-year{font-size:clamp(1.2rem,5vw,1.7rem)}
  .hero-sub{font-size:.95rem;margin-bottom:.6rem}
  .hero-lead{font-size:.9rem;line-height:1.85;margin:.85rem 0 1.05rem}
  .hero-meta{margin-bottom:.85rem}
  .cig-paper{width:min(340px,88vw);margin-bottom:.9rem}
  .cig-paper-inner{padding:1.2rem 1.25rem .95rem}
  .cig-line-1{font-size:.85rem}
  .cig-line-2,.cig-line-3{font-size:.95rem}
  .scroll-cue{margin-top:1.3rem}
}
@media (max-width:560px){
  .hero-title{flex-direction:column;align-items:center;gap:.4rem}
  .hero-title-sep{height:1px;width:56px;transform:none}
  .hero-meta{gap:.4rem}
  .chip{font-size:.72rem;padding:.24rem .6rem}
  .hero-slogan{font-size:1rem;letter-spacing:.18em;text-indent:.18em}
  .hero-desk{height:14%}
  .hero-lamp{width:88px;left:7%;bottom:12%;opacity:.66}
  .hero-boat{width:min(230px,52vw);bottom:20%}
  .tl-legend{flex-direction:column;align-items:flex-start;gap:.55rem}
  .quote-chip{max-width:none;width:100%}
  .tab{flex:1 1 auto;text-align:center;padding:.6rem .9rem;font-size:.9rem;letter-spacing:.1em}
  .show-rows li{flex-direction:column;gap:.25rem}
  .show-rows li span{flex:none}
  .footer-seal{padding:.9rem 1.2rem}
}
/* 横屏矮手机：只保留主视觉，隐藏滚动提示 */
@media (max-width:860px) and (max-height:520px){
  .hero{padding-bottom:3.4rem}
  .hero-lead{display:none}
  .cig-paper{width:min(280px,44vw)}
  .hero-desk{height:20%}
  .scroll-cue{display:none}
}
@media (max-width:380px){
  .hero-title-cn{font-size:2.6rem}
}

`;

fs.writeFileSync(cssPath, head + responsive + tail, 'utf8');

const out = fs.readFileSync(cssPath, 'utf8');
const open = (out.match(/\{/g) || []).length;
const close = (out.match(/\}/g) || []).length;
console.log('重写完成：' + path.basename(cssPath));
console.log('花括号 ' + open + '/' + close + (open === close ? ' 平衡' : ' 不平衡!'));
console.log('总行数 ' + out.split('\n').length);
