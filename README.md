# 越南语学堂 VietLearn

一个用 Expo（React Native）写的越南语入门 App，iPhone / 安卓 / 网页都能跑。

## 功能

| 模块 | 内容 |
| --- | --- |
| 首页 | 学习进度、6 个声调示范（ma / mà / má / mả / mã / mạ） |
| 常用语 | 8 个主题共 100 句：问候、数字、购物、餐饮、出行、时间、家庭、日常求助；可收藏 |
| 词汇卡片 | 129 个基础词，越→中 / 中→越 两种模式，翻面、打乱、标记“记住了” |
| 组词 | 8 个词根（nhà、xe、máy、nước…）拆解 35 个合成词 + 拼词小测验 |
| 组句子 | 24 道拼句练习，点词块排出正确语序，附语法提示 |

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
    _layout.tsx         根布局
    (tabs)/             底部 5 个标签页
      index.tsx         首页
      phrases.tsx       常用语
      vocab.tsx         词汇卡片
      compounds.tsx     组词
      sentences.tsx     组句子
  data/                 学习内容（想加内容改这里就行）
    topics.ts           主题、常用语、词汇、声调
    compounds.ts        组词
    sentences.ts        组句子
  lib/
    speech.ts           越南语发音（expo-speech）
    progress.tsx        学习进度（本地保存）
  components/ui.tsx     通用组件（发音按钮、卡片、按钮…）
  theme.ts              颜色
```

## 添加内容

- 新增常用语/词汇：在 `src/data/topics.ts` 对应主题里加一行 `{ vi: '...', zh: '...' }`。
- 新增主题：复制一个主题对象，改 `id`、名称、颜色和内容。
- 新增拼句题：在 `src/data/sentences.ts` 里加，`tokens` 按正确顺序写。

内容以北部（河内）标准越南语为主，南方常用说法在备注里标出。
