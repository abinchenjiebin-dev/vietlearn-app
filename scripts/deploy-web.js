// 生成网页版并发布到 GitHub Pages：node scripts/deploy-web.js <仓库地址>
// 仓库要叫 <用户名>.github.io，网址就是 https://<用户名>.github.io
// 每次发布都会用最新的网页版覆盖仓库内容。
const { execSync } = require('child_process');
const path = require('path');

const repo = process.argv[2];
if (!repo) {
  console.error('用法：node scripts/deploy-web.js https://github.com/<用户名>/<用户名>.github.io.git');
  process.exit(1);
}

const root = path.join(__dirname, '..');
const out = path.join(root, 'web-build');
const run = (cmd, cwd = out) => execSync(cmd, { cwd, stdio: 'inherit' });

run('node scripts/build-web.js', root);
run('git init -q -b main');
run('git add -A');
run('git -c user.name=VietLearn -c user.email=deploy@vietlearn.local commit -q -m "发布网页版"');
run(`git push -f ${repo} main`);

const m = repo.match(/github\.com[/:]([^/]+)\//);
console.log(`\n已发布，1～2 分钟后打开：https://${m ? m[1].toLowerCase() : '<用户名>'}.github.io`);
