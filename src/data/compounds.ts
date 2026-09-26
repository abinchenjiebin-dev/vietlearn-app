// 组词：越南语很多词由“词根 + 另一个音节”组成，
// 就像中文的“车 → 火车、汽车”。每组一个词根，列出常见组合。

export type Compound = {
  vi: string;
  zh: string;
  /** 组成部分：每个音节及其单独含义 */
  parts: { vi: string; zh: string }[];
};

export type RootGroup = {
  root: string;
  zh: string;
  compounds: Compound[];
};

export const rootGroups: RootGroup[] = [
  {
    root: 'nhà',
    zh: '房子；家',
    compounds: [
      { vi: 'nhà hàng', zh: '餐厅', parts: [{ vi: 'nhà', zh: '房子' }, { vi: 'hàng', zh: '货物；店' }] },
      { vi: 'nhà sách', zh: '书店', parts: [{ vi: 'nhà', zh: '房子' }, { vi: 'sách', zh: '书' }] },
      { vi: 'nhà thuốc', zh: '药店', parts: [{ vi: 'nhà', zh: '房子' }, { vi: 'thuốc', zh: '药' }] },
      { vi: 'nhà máy', zh: '工厂', parts: [{ vi: 'nhà', zh: '房子' }, { vi: 'máy', zh: '机器' }] },
      { vi: 'nhà ga', zh: '火车站', parts: [{ vi: 'nhà', zh: '房子' }, { vi: 'ga', zh: '车站' }] },
    ],
  },
  {
    root: 'xe',
    zh: '车',
    compounds: [
      { vi: 'xe máy', zh: '摩托车', parts: [{ vi: 'xe', zh: '车' }, { vi: 'máy', zh: '机器' }] },
      { vi: 'xe đạp', zh: '自行车', parts: [{ vi: 'xe', zh: '车' }, { vi: 'đạp', zh: '踩' }] },
      { vi: 'xe buýt', zh: '公交车', parts: [{ vi: 'xe', zh: '车' }, { vi: 'buýt', zh: '巴士（音译）' }] },
      { vi: 'xe lửa', zh: '火车', parts: [{ vi: 'xe', zh: '车' }, { vi: 'lửa', zh: '火' }] },
      { vi: 'xe hơi', zh: '汽车', parts: [{ vi: 'xe', zh: '车' }, { vi: 'hơi', zh: '蒸汽；气' }] },
    ],
  },
  {
    root: 'máy',
    zh: '机器',
    compounds: [
      { vi: 'máy bay', zh: '飞机', parts: [{ vi: 'máy', zh: '机器' }, { vi: 'bay', zh: '飞' }] },
      { vi: 'máy tính', zh: '电脑', parts: [{ vi: 'máy', zh: '机器' }, { vi: 'tính', zh: '计算' }] },
      { vi: 'máy ảnh', zh: '相机', parts: [{ vi: 'máy', zh: '机器' }, { vi: 'ảnh', zh: '照片' }] },
      { vi: 'máy lạnh', zh: '空调', parts: [{ vi: 'máy', zh: '机器' }, { vi: 'lạnh', zh: '冷' }] },
      { vi: 'máy giặt', zh: '洗衣机', parts: [{ vi: 'máy', zh: '机器' }, { vi: 'giặt', zh: '洗（衣服）' }] },
    ],
  },
  {
    root: 'nước',
    zh: '水；国家',
    compounds: [
      { vi: 'nước mắm', zh: '鱼露', parts: [{ vi: 'nước', zh: '水' }, { vi: 'mắm', zh: '腌鱼酱' }] },
      { vi: 'nước ngọt', zh: '汽水', parts: [{ vi: 'nước', zh: '水' }, { vi: 'ngọt', zh: '甜' }] },
      { vi: 'nước cam', zh: '橙汁', parts: [{ vi: 'nước', zh: '水' }, { vi: 'cam', zh: '橙子' }] },
      { vi: 'nước ngoài', zh: '外国', parts: [{ vi: 'nước', zh: '国家' }, { vi: 'ngoài', zh: '外面' }] },
    ],
  },
  {
    root: 'tiếng',
    zh: '语言；声音',
    compounds: [
      { vi: 'tiếng Việt', zh: '越南语', parts: [{ vi: 'tiếng', zh: '语言' }, { vi: 'Việt', zh: '越' }] },
      { vi: 'tiếng Trung', zh: '中文', parts: [{ vi: 'tiếng', zh: '语言' }, { vi: 'Trung', zh: '中' }] },
      { vi: 'tiếng Anh', zh: '英语', parts: [{ vi: 'tiếng', zh: '语言' }, { vi: 'Anh', zh: '英' }] },
      { vi: 'tiếng Nhật', zh: '日语', parts: [{ vi: 'tiếng', zh: '语言' }, { vi: 'Nhật', zh: '日' }] },
    ],
  },
  {
    root: 'bánh',
    zh: '饼；糕点',
    compounds: [
      { vi: 'bánh mì', zh: '越南法棍面包', parts: [{ vi: 'bánh', zh: '饼' }, { vi: 'mì', zh: '小麦；面' }] },
      { vi: 'bánh ngọt', zh: '蛋糕；甜点', parts: [{ vi: 'bánh', zh: '饼' }, { vi: 'ngọt', zh: '甜' }] },
      { vi: 'bánh cuốn', zh: '越南粉卷', parts: [{ vi: 'bánh', zh: '饼' }, { vi: 'cuốn', zh: '卷' }] },
      { vi: 'bánh xèo', zh: '越南煎饼', parts: [{ vi: 'bánh', zh: '饼' }, { vi: 'xèo', zh: '滋滋（煎的声音）' }] },
    ],
  },
  {
    root: 'học',
    zh: '学',
    compounds: [
      { vi: 'học sinh', zh: '（中小学）学生', parts: [{ vi: 'học', zh: '学' }, { vi: 'sinh', zh: '生' }] },
      { vi: 'trường học', zh: '学校', parts: [{ vi: 'trường', zh: '场；校' }, { vi: 'học', zh: '学' }] },
      { vi: 'đại học', zh: '大学', parts: [{ vi: 'đại', zh: '大' }, { vi: 'học', zh: '学' }] },
      { vi: 'học tập', zh: '学习', parts: [{ vi: 'học', zh: '学' }, { vi: 'tập', zh: '习；练' }] },
    ],
  },
  {
    root: 'người',
    zh: '人',
    compounds: [
      { vi: 'người lớn', zh: '大人', parts: [{ vi: 'người', zh: '人' }, { vi: 'lớn', zh: '大' }] },
      { vi: 'người yêu', zh: '恋人', parts: [{ vi: 'người', zh: '人' }, { vi: 'yêu', zh: '爱' }] },
      { vi: 'người Việt', zh: '越南人', parts: [{ vi: 'người', zh: '人' }, { vi: 'Việt', zh: '越' }] },
      { vi: 'người bán', zh: '卖家', parts: [{ vi: 'người', zh: '人' }, { vi: 'bán', zh: '卖' }] },
    ],
  },
  {
    root: 'điện',
    zh: '电',
    compounds: [
      { vi: 'điện thoại', zh: '电话；手机', parts: [{ vi: 'điện', zh: '电' }, { vi: 'thoại', zh: '话' }] },
      { vi: 'điện ảnh', zh: '电影（艺术）', parts: [{ vi: 'điện', zh: '电' }, { vi: 'ảnh', zh: '影；照片' }] },
      { vi: 'điện tử', zh: '电子', parts: [{ vi: 'điện', zh: '电' }, { vi: 'tử', zh: '子' }] },
      { vi: 'điện nước', zh: '水电', parts: [{ vi: 'điện', zh: '电' }, { vi: 'nước', zh: '水' }] },
    ],
  },
  {
    root: 'cửa',
    zh: '门',
    compounds: [
      { vi: 'cửa hàng', zh: '商店', parts: [{ vi: 'cửa', zh: '门' }, { vi: 'hàng', zh: '货物；店' }] },
      { vi: 'cửa khẩu', zh: '口岸', parts: [{ vi: 'cửa', zh: '门' }, { vi: 'khẩu', zh: '口' }] },
      { vi: 'cửa chính', zh: '正门', parts: [{ vi: 'cửa', zh: '门' }, { vi: 'chính', zh: '主要' }] },
      { vi: 'cửa sau', zh: '后门', parts: [{ vi: 'cửa', zh: '门' }, { vi: 'sau', zh: '后' }] },
    ],
  },
  {
    root: 'thịt',
    zh: '肉',
    compounds: [
      { vi: 'thịt bò', zh: '牛肉', parts: [{ vi: 'thịt', zh: '肉' }, { vi: 'bò', zh: '牛' }] },
      { vi: 'thịt gà', zh: '鸡肉', parts: [{ vi: 'thịt', zh: '肉' }, { vi: 'gà', zh: '鸡' }] },
      { vi: 'thịt lợn', zh: '猪肉', parts: [{ vi: 'thịt', zh: '肉' }, { vi: 'lợn', zh: '猪' }] },
      { vi: 'thịt nướng', zh: '烤肉', parts: [{ vi: 'thịt', zh: '肉' }, { vi: 'nướng', zh: '烤' }] },
    ],
  },
  {
    root: 'bệnh',
    zh: '病',
    compounds: [
      { vi: 'bệnh viện', zh: '医院', parts: [{ vi: 'bệnh', zh: '病' }, { vi: 'viện', zh: '院' }] },
      { vi: 'bệnh nhân', zh: '病人', parts: [{ vi: 'bệnh', zh: '病' }, { vi: 'nhân', zh: '人' }] },
      { vi: 'khám bệnh', zh: '看病', parts: [{ vi: 'khám', zh: '检查' }, { vi: 'bệnh', zh: '病' }] },
    ],
  },
  {
    root: 'ăn',
    zh: '吃',
    compounds: [
      { vi: 'ăn sáng', zh: '吃早饭', parts: [{ vi: 'ăn', zh: '吃' }, { vi: 'sáng', zh: '早上' }] },
      { vi: 'ăn trưa', zh: '吃午饭', parts: [{ vi: 'ăn', zh: '吃' }, { vi: 'trưa', zh: '中午' }] },
      { vi: 'ăn tối', zh: '吃晚饭', parts: [{ vi: 'ăn', zh: '吃' }, { vi: 'tối', zh: '晚上' }] },
      { vi: 'ăn chay', zh: '吃素', parts: [{ vi: 'ăn', zh: '吃' }, { vi: 'chay', zh: '素' }] },
      { vi: 'ăn cơm', zh: '吃饭', parts: [{ vi: 'ăn', zh: '吃' }, { vi: 'cơm', zh: '米饭' }] },
    ],
  },
  {
    root: 'sân',
    zh: '场地；院子',
    compounds: [
      { vi: 'sân bay', zh: '机场', parts: [{ vi: 'sân', zh: '场地' }, { vi: 'bay', zh: '飞' }] },
      { vi: 'sân bóng', zh: '球场', parts: [{ vi: 'sân', zh: '场地' }, { vi: 'bóng', zh: '球' }] },
      { vi: 'sân trường', zh: '校园；操场', parts: [{ vi: 'sân', zh: '场地' }, { vi: 'trường', zh: '学校' }] },
    ],
  },
  {
    root: 'đi',
    zh: '去；走',
    compounds: [
      { vi: 'đi bộ', zh: '步行', parts: [{ vi: 'đi', zh: '走' }, { vi: 'bộ', zh: '步' }] },
      { vi: 'đi làm', zh: '上班', parts: [{ vi: 'đi', zh: '去' }, { vi: 'làm', zh: '做；工作' }] },
      { vi: 'đi học', zh: '上学', parts: [{ vi: 'đi', zh: '去' }, { vi: 'học', zh: '学' }] },
      { vi: 'đi chơi', zh: '出去玩', parts: [{ vi: 'đi', zh: '去' }, { vi: 'chơi', zh: '玩' }] },
    ],
  },
];

export const allCompounds: Compound[] = rootGroups.flatMap((g) => g.compounds);

/** 所有出现过的音节（用于组词练习的干扰项） */
export const allSyllables: string[] = Array.from(
  new Set(allCompounds.flatMap((c) => c.parts.map((p) => p.vi))),
);
