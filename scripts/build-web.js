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

// 手机浏览器「添加到主屏幕」时的图标和名称
const pwa = [
  '<link rel="manifest" href="./manifest.json" />',
  '<link rel="apple-touch-icon" href="./icon.png" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-title" content="越南语学堂" />',
  '<meta name="theme-color" content="#0F9D6B" />',
].join('\n    ');
html = html.replace('</head>', `  ${pwa}\n  </head>`);
fs.writeFileSync(indexPath, html);
fs.copyFileSync(path.join(root, 'assets/icon.png'), path.join(out, 'icon.png'));
// 安卓 Chrome 要 192 和 512 两种尺寸才会提示“安装到桌面”（由 assets/icon.png 缩小而来）
for (const n of [192, 512]) fs.copyFileSync(path.join(root, `assets/pwa/icon-${n}.png`), path.join(out, `icon-${n}.png`));
fs.writeFileSync(
  path.join(out, 'manifest.json'),
  JSON.stringify(
    {
      name: '越南语学堂',
      short_name: '越南语学堂',
      start_url: './',
      display: 'standalone',
      background_color: '#F4F8F5',
      theme_color: '#0F9D6B',
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'icon.png', sizes: '1024x1024', type: 'image/png', purpose: 'any' },
      ],
    },
    null,
    2,
  ),
);

// 放到网上（GitHub Pages / Netlify / Cloudflare Pages）用：
// 刷新 /phrases 等页面时回到 App；GitHub Pages 默认会忽略 _expo 文件夹，.nojekyll 关掉这个行为
fs.copyFileSync(indexPath, path.join(out, '404.html'));
fs.writeFileSync(path.join(out, '_redirects'), '/*  /index.html  200\n');
fs.writeFileSync(path.join(out, '.nojekyll'), '');

// 3) 附上 Python 启动脚本
fs.copyFileSync(path.join(__dirname, 'run_web.py'), path.join(out, 'run.py'));
console.log('\n网页版已生成：web-build/  →  cd web-build && python run.py');
