# 越南语学堂 VietLearn

一个用 Expo（React Native）写的越南语入门 App，iPhone / 安卓 / 网页都能跑。

## 功能

| 模块 | 内容 |
| --- | --- |
| 今天（首页） | 每日目标圆环、连续打卡天数、每日一刷、智能复习入口、本周学习日历（可展开看 5 周） |
| 常用语 | 16 个主题共 258 句；可收藏，⭐ 只看收藏 |
| 词汇卡片 | 408 个常用词，越→中 / 中→越，翻转动画，“记住了/还不会”自动加入智能复习 |
| 每日一刷 | 自选 10 / 20 / 30 / 50 题，选择、听音、拼写、声调随机混合 |
| 练习 | 智能复习（新词先学后考，旧词随机出题，按遗忘规律安排）、错题本、5 种测验：看中文选越南语、看越南语选中文、听音选词、拼写、听辨声调 |
| 组词 / 组句子 | 15 个词根 62 个合成词；52 道拼句练习，附语法提示 |
| 发音 | 29 个字母 + 10 个辅音组合（带例词发音）、6 个声调、拼读规则 |
| 搜索 | 右上角 🔍，搜中文或越南语，可以不打声调（cam on → cảm ơn） |

界面支持深色模式，跟随手机系统设置。

发音使用手机系统自带的越南语语音（iOS 上叫 “Linh”），**点 🔊 正常语速，点 ⏳ 或长按 🔊 慢速**。学习进度保存在手机本地。

## 在 Windows 电脑 + iPhone 上运行（不需要 Mac）

1. 电脑安装 [Node.js](https://nodejs.org)（LTS 版本）。
2. iPhone 在 App Store 安装 **Expo Go**。
3. 解压项目，在项目文件夹里打开终端（PowerShell）：
   ```bash
   npm install
   npx expo start
   ```
4. 终端会出现二维码，用 iPhone **相机**扫码，会自动在 Expo Go 里打开 App。
   - 电脑和手机需要在同一个 Wi-Fi；如果连不上，改用 `npx expo start --tunnel`。
5. 修改代码保存后，手机上会自动刷新。

> 如果听不到发音：iPhone「设置 → 辅助功能 → 朗读内容 → 声音 → 越南语」下载 Linh 语音，并确认手机没开静音。

也可以先在浏览器里看效果：`npx expo start --web`。

## 用 VS Code 测试 App

1. VS Code「文件 → 打开文件夹」，选 `VietLearn` 文件夹。
2. 菜单「终端 → 运行任务…」，依次选：
   - **1. 安装依赖**（只需第一次）
   - **2. 启动 App** → 终端出现二维码，iPhone 相机扫码，在 Expo Go 里打开
   - **3. 电脑浏览器预览**（不用手机也能看）
   - **4. 代码检查**（改完代码后跑一下，没有输出就是没问题）
3. 改代码并保存，手机上会自动刷新。终端里按 `r` 手动刷新，按 `Ctrl+C` 停止。

## 以后上架 App Store（仍然不需要 Mac）

1. 注册 Apple 开发者账号（每年 99 美元）。
2. `npm install -g eas-cli`，然后 `eas login`（注册一个免费 Expo 账号）。
3. `eas build:configure` → `eas build -p ios` 在云端打包。
4. `eas submit -p ios` 提交到 App Store Connect / TestFlight。

包名在 `app.json` 里：`com.abin.vietlearn`，上架前可以改成你自己的。

## 项目结构

```
src/
  app/                  页面（Expo Router，文件即路由）
    _layout.tsx         根布局（深色模式、页面栈）
    (tabs)/             底部 5 个标签页：今天、常用语、词汇、练习、发音
    review.tsx          智能复习
    quiz/[type].tsx     测验（meaning / vi2zh / listen / spell / tone / mix=每日一刷）
    compounds.tsx       组词
    sentences.tsx       组句子
    mistakes.tsx        错题本
    search.tsx          搜索
  data/                 学习内容（想加内容改这里就行）
    topics.ts           主题、常用语、词汇、声调
    compounds.ts        组词
    sentences.ts        组句子
    alphabet.ts         字母发音课
    index.ts            汇总（搜索、测验用）
  lib/
    speech.ts           越南语发音（expo-speech）
    progress.tsx        学习进度、打卡、错题本（本地保存）
    srs.ts              智能复习算法（间隔重复）
    quiz.ts             测验出题
  components/ui.tsx     通用组件（按钮、卡片、进度环、选择题…）
  components/quiz.tsx   答题组件（选择、拼写、声调）
  components/DailyDrill.tsx  每日一刷卡片
  theme.ts              浅色 / 深色配色
```

## 添加内容

- 新增常用语/词汇：在 `src/data/topics.ts` 对应主题里加一行 `{ vi: '...', zh: '...' }`。
- 新增主题：复制一个主题对象，改 `id`、名称、颜色和内容。
- 新增拼句题：在 `src/data/sentences.ts` 里加，`tokens` 按正确顺序写。

内容以北部（河内）标准越南语为主，南方常用说法在备注里标出。

## 用 Python 预览网页版（不用装 Node）

用打包好的 `VietLearn-web.zip`：解压后用 VS Code 打开该文件夹，打开 `run.py` 点 ▶ 运行；
或在终端里 `python run.py`（自测：`python run.py --test`）。不要直接双击 index.html。

自己重新生成网页版：`node scripts/build-web.js`，输出在 `web-build/`。

## 把网页版放到网上分享（GitHub Pages，免费）

1. 注册 [GitHub](https://github.com) 账号，新建一个**公开**仓库，名字必须是 `<用户名>.github.io`（全小写），什么都不勾选。
2. 在项目文件夹运行（第一次会弹出浏览器让你登录 GitHub）：
   ```bash
   node scripts/deploy-web.js https://github.com/<用户名>/<用户名>.github.io.git
   ```
3. 等 1～2 分钟，打开 `https://<用户名>.github.io`，把网址发给别人即可。
   手机浏览器里「分享 → 添加到主屏幕」，用起来就像一个 App。

以后改了内容，再运行一次第 2 步就会更新。
