// 组句子练习：按正确顺序点击词块，拼出越南语句子。
// tokens 按正确顺序排列；punct 是句末标点。

export type SentenceItem = {
  zh: string;
  tokens: string[];
  punct: '.' | '?' | '!';
  tip?: string;
};

export const sentences: SentenceItem[] = [
  { zh: '我叫明。', tokens: ['Tôi', 'tên', 'là', 'Minh'], punct: '.' },
  { zh: '你叫什么名字？', tokens: ['Bạn', 'tên', 'là', 'gì'], punct: '?', tip: '疑问词 gì（什么）放在句末' },
  { zh: '我是中国人。', tokens: ['Tôi', 'là', 'người', 'Trung Quốc'], punct: '.' },
  { zh: '我很高兴认识你。', tokens: ['Rất', 'vui', 'được', 'gặp', 'bạn'], punct: '.' },
  { zh: '我不明白。', tokens: ['Tôi', 'không', 'hiểu'], punct: '.', tip: 'không 放在动词前表示否定' },
  { zh: '我不吃辣。', tokens: ['Tôi', 'không', 'ăn', 'cay'], punct: '.' },
  { zh: '我想买这个。', tokens: ['Tôi', 'muốn', 'mua', 'cái', 'này'], punct: '.', tip: '指示词 này（这）放在名词后面' },
  { zh: '这个多少钱？', tokens: ['Cái', 'này', 'bao nhiêu', 'tiền'], punct: '?' },
  { zh: '太贵了！', tokens: ['Đắt', 'quá'], punct: '!', tip: 'quá（太）放在形容词后面' },
  { zh: '给我一碗牛肉河粉。', tokens: ['Cho', 'tôi', 'một', 'bát', 'phở', 'bò'], punct: '.', tip: '修饰语在后：phở bò = 河粉 + 牛' },
  { zh: '我想喝水。', tokens: ['Tôi', 'muốn', 'uống', 'nước'], punct: '.' },
  { zh: '我吃饱了。', tokens: ['Tôi', 'no', 'rồi'], punct: '.', tip: 'rồi 放句末表示“已经……了”' },
  { zh: '洗手间在哪里？', tokens: ['Nhà vệ sinh', 'ở', 'đâu'], punct: '?' },
  { zh: '送我去机场。', tokens: ['Cho', 'tôi', 'đến', 'sân bay'], punct: '.' },
  { zh: '现在几点？', tokens: ['Bây giờ', 'là', 'mấy', 'giờ'], punct: '?' },
  { zh: '今天星期一。', tokens: ['Hôm nay', 'là', 'thứ Hai'], punct: '.' },
  { zh: '明天见。', tokens: ['Hẹn', 'gặp', 'bạn', 'ngày mai'], punct: '.' },
  { zh: '我家有四口人。', tokens: ['Gia đình', 'tôi', 'có', 'bốn', 'người'], punct: '.', tip: '所有格：gia đình tôi = 家 + 我' },
  { zh: '我有一个妹妹。', tokens: ['Tôi', 'có', 'một', 'em gái'], punct: '.' },
  { zh: '他是我的朋友。', tokens: ['Anh ấy', 'là', 'bạn', 'của', 'tôi'], punct: '.', tip: 'của = 的，放在所属者前' },
  { zh: '我在学越南语。', tokens: ['Tôi', 'đang', 'học', 'tiếng Việt'], punct: '.', tip: 'đang 表示正在进行' },
  { zh: '我喜欢越南咖啡。', tokens: ['Tôi', 'thích', 'cà phê', 'Việt Nam'], punct: '.' },
  { zh: '越南很美。', tokens: ['Việt Nam', 'rất', 'đẹp'], punct: '.' },
  { zh: '你能说慢一点吗？', tokens: ['Bạn', 'nói', 'chậm', 'được', 'không'], punct: '?', tip: '……được không? = ……可以吗？' },
];

export const sentenceText = (s: SentenceItem) => s.tokens.join(' ') + s.punct;
