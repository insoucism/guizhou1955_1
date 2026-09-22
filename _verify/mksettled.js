// 生成「动画终态」取证副本；加 --overlay 参数时把测量值一并画进页面，
// 让几何数据随截图一起被拍到，避免"探针与截图不同源"造成的误判。
// 用法：node _verify/mksettled.js <outFile> [--overlay]
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css  = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const js   = fs.readFileSync(path.join(root, 'main.js'), 'utf8').replace(/^\uFEFF/, '');

html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '\n</style>');
html = html.replace('<script src="main.js"></script>', '<script>\n' + js + '\n</script>');

const settle = `
<style id="__settle">
  *,*::before,*::after{transition:none !important;animation:none !important;opacity:1 !important}
  .reveal{opacity:1 !important;transform:none !important}
</style>`;

let tail = '';
if (process.argv.includes('--overlay')) {
  const ov = fs.readFileSync(path.join(__dirname, 'overlay-metrics.js'), 'utf8');
  tail = '<script>\n' + ov + '\n</script>';
}

html = html.replace('</head>', settle + '</head>');
// 用函数式替换，避免把 $& / $' 之类的替换模式误解析
html = html.replace('</body>', () => tail + '\n</body>');
if (!/^\s*<meta charset/i.test(html)) html = '<meta charset="UTF-8">\n' + html;

const out = path.resolve(process.argv[2]);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html, 'utf8');
console.log('  终态副本 -> ' + path.basename(out) + (tail ? '（含测量浮层）' : ''));
