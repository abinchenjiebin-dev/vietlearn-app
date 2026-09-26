// 生成可以在任意位置打开的网页版：node scripts/build-web.js
// 输出到 web-build/，里面带 run.py（用 Python 启动/自测）
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'web-build');
fs.rmSync(out, { recursive: true, force: true });
execSync(`npx expo export --platform web --output-dir web-build`, { cwd: root, stdio: 'inherit' });

// 1) 资源路径改为相对路径（支持 VS Code Live Server / 子文件夹）
const jsDir = path.join(out, '_expo/static/js/web');
for (const f of fs.readdirSync(jsDir)) {
  const p = path.join(jsDir, f);
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replaceAll('"/assets/', '"./assets/'));
}

// 2) index.html：动态加载程序，并在直接双击打开时给出提示
const indexPath = path.join(out, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const m = html.match(/<script src="\/(_expo\/static\/js\/web\/[^"]+\.js)" defer><\/script>/);
if (!m) throw new Error('index.html 里找不到程序文件');
html = html.replace(m[0], '').replace('href="/favicon', 'href="./favicon');
const shim = fs
  .readFileSync(path.join(__dirname, 'web-index.reference.html'), 'utf8')
  .match(/<script>[\s\S]*?<\/script>/)[0]
  .replace(/_expo\/static\/js\/web\/[^']+\.js/, m[1]);
html = html.replace('<meta charset="utf-8" />', `<meta charset="utf-8" />\n    ${shim}`);
fs.writeFileSync(indexPath, html);

// 3) 附上 Python 启动脚本
fs.copyFileSync(path.join(__dirname, 'run_web.py'), path.join(out, 'run.py'));
console.log('\n网页版已生成：web-build/  →  cd web-build && python run.py');
