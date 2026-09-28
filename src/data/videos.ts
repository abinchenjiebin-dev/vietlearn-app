// 视频课：嵌入哔哩哔哩上老师本人上传的越南语教学视频（中国大陆能看）。
// 每个视频都打开过原页面核对过标题和 UP 主；只收录 UP 主自己上传的，不收搬运视频。

export type VideoKind = 'pronounce' | 'lesson' | 'speaking';

export type Video = {
  /** B 站视频号 */
  bvid: string;
  zh: string;
  teacher: string;
  minutes: number;
  kind: VideoKind;
  desc: string;
  /** 相关主题（在主题页里显示） */
  topicId?: string;
};

export const videoKinds: { kind: VideoKind; zh: string; emoji: string }[] = [
  { kind: 'pronounce', zh: '发音口型', emoji: '👄' },
  { kind: 'lesson', zh: '课程讲解', emoji: '📘' },
  { kind: 'speaking', zh: '日常口语', emoji: '💬' },
];

export const videos: Video[] = [
  {
    bvid: 'BV1LE411d7WE',
    zh: '越南语字母表 29 个字母',
    teacher: '兰儿越南语',
    minutes: 10,
    kind: 'pronounce',
    desc: '河内老师逐个示范 29 个字母的读法，看口型跟读',
  },
  {
    bvid: 'BV1sE411Z77B',
    zh: '入门第一课（2）：声调',
    teacher: '兰儿越南语',
    minutes: 12,
    kind: 'pronounce',
    desc: '6 个声调的发音方法和区别',
  },
  {
    bvid: 'BV1uE411Z7sS',
    zh: '入门第一课（1）：辅音',
    teacher: '兰儿越南语',
    minutes: 14,
    kind: 'pronounce',
    desc: '辅音的发音方法，适合对照发音页一起学',
  },
  {
    bvid: 'BV1ZP4y1Z7UB',
    zh: '语音课程：12 个元音、27 个辅音、6 个声调',
    teacher: '武信诚-越南语老师',
    minutes: 66,
    kind: 'pronounce',
    desc: '一次讲完全部语音，适合系统学一遍',
  },
  {
    bvid: 'BV1r3r9Y8ESM',
    zh: '入门第一课：Xin chào 你好',
    teacher: 'SaChee_VietNam',
    minutes: 26,
    kind: 'lesson',
    desc: '专门给中国人讲的入门课：打招呼和基础对话',
    topicId: 'greetings',
  },
  {
    bvid: 'BV1K3c4e5ETD',
    zh: '入门第二课：Anh khỏe không? 你好吗',
    teacher: 'SaChee_VietNam',
    minutes: 23,
    kind: 'lesson',
    desc: '问候近况、回答“我很好”',
    topicId: 'greetings',
  },
  {
    bvid: 'BV1ciwre7EqY',
    zh: '入门第三课：Hôm nay ngày mấy 今天几号',
    teacher: 'SaChee_VietNam',
    minutes: 35,
    kind: 'lesson',
    desc: '日期和星期的问法',
    topicId: 'time',
  },
  {
    bvid: 'BV1L1tfesEnj',
    zh: '15 天学好越南语 · 第一天：打招呼和自我介绍',
    teacher: '武信诚-越南语老师',
    minutes: 76,
    kind: 'lesson',
    desc: '问候、告别、人称代词、职业和基础语法',
    topicId: 'greetings',
  },
  {
    bvid: 'BV1eE411Z7R9',
    zh: '入门第一课（3）：生词和语法',
    teacher: '兰儿越南语',
    minutes: 4,
    kind: 'lesson',
    desc: '第一课的生词和语法小结',
  },
  {
    bvid: 'BV1gD4y1z72W',
    zh: '越南语日常口语 · 第一集：常用短句 138 句',
    teacher: '武信诚-越南语老师',
    minutes: 20,
    kind: 'speaking',
    desc: '跟着老师读日常最常用的短句',
    topicId: 'daily',
  },
];

export const getVideo = (bvid: string) => videos.find((v) => v.bvid === bvid);

/** B 站嵌入播放器地址 */
export const embedUrl = (bvid: string) =>
  `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&autoplay=0&high_quality=1&danmaku=0`;

/** B 站原视频页（手机上会尝试打开 B 站 App） */
export const pageUrl = (bvid: string) => `https://www.bilibili.com/video/${bvid}`;
