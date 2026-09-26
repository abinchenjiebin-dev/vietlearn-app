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
  { zh: '这个比那个便宜。', tokens: ['Cái này', 'rẻ', 'hơn', 'cái kia'], punct: '.', tip: 'A + 形容词 + hơn + B = A 比 B 更……' },
  { zh: '哪个最好？', tokens: ['Cái', 'nào', 'tốt', 'nhất'], punct: '?', tip: 'nhất 放在形容词后面表示“最”' },
  { zh: '我已经吃过了。', tokens: ['Tôi', 'đã', 'ăn', 'rồi'], punct: '.', tip: 'đã + 动词 + rồi = 已经……了' },
  { zh: '我会回来的。', tokens: ['Tôi', 'sẽ', 'quay lại'], punct: '.', tip: 'sẽ 放在动词前表示将来' },
  { zh: '你吃饭了吗？', tokens: ['Bạn', 'ăn', 'cơm', 'chưa'], punct: '?', tip: '……chưa? = ……了吗？越南人也常用它打招呼' },
  { zh: '我还没吃。', tokens: ['Tôi', 'chưa', 'ăn'], punct: '.', tip: 'chưa = 还没' },
  { zh: '你会说越南语吗？', tokens: ['Bạn', 'có', 'biết', 'nói', 'tiếng Việt', 'không'], punct: '?', tip: 'có……không? 是最常用的是非问句' },
  { zh: '我头疼。', tokens: ['Tôi', 'bị', 'đau', 'đầu'], punct: '.', tip: 'bị 用在不好的遭遇前：生病、受伤、丢东西' },
  { zh: '天气太热了。', tokens: ['Trời', 'nóng', 'quá'], punct: '.' },
  { zh: '正在下雨。', tokens: ['Trời', 'đang', 'mưa'], punct: '.', tip: 'đang 表示正在进行' },
  { zh: '我在公司工作。', tokens: ['Tôi', 'làm việc', 'ở', 'công ty'], punct: '.', tip: 'ở + 地点 = 在某地' },
  { zh: '我住在胡志明市。', tokens: ['Tôi', 'sống', 'ở', 'Thành phố Hồ Chí Minh'], punct: '.' },
  { zh: '这件上衣很好看。', tokens: ['Cái', 'áo', 'này', 'rất', 'đẹp'], punct: '.', tip: '量词 + 名词 + này：cái áo này = 这件上衣' },
  { zh: '我有一只猫。', tokens: ['Tôi', 'có', 'một', 'con', 'mèo'], punct: '.', tip: 'con 是动物的量词' },
  { zh: '我们去喝咖啡吧。', tokens: ['Chúng ta', 'đi', 'uống', 'cà phê', 'nhé'], punct: '.', tip: 'nhé 放句末，表示建议或亲切的语气' },
  { zh: '请坐。', tokens: ['Mời', 'bạn', 'ngồi'], punct: '.', tip: 'mời = 请（邀请对方做某事）' },
  { zh: '别担心。', tokens: ['Đừng', 'lo'], punct: '.', tip: 'đừng = 别、不要' },
  { zh: '你去哪里？', tokens: ['Bạn', 'đi', 'đâu'], punct: '?', tip: 'đâu = 哪里，放在句末' },
  { zh: '他是谁？', tokens: ['Anh ấy', 'là', 'ai'], punct: '?', tip: 'ai = 谁' },
  { zh: '你为什么学越南语？', tokens: ['Tại sao', 'bạn', 'học', 'tiếng Việt'], punct: '?', tip: 'tại sao = 为什么，放在句首' },
  { zh: '这个用越南语怎么说？', tokens: ['Cái này', 'tiếng Việt', 'nói', 'thế nào'], punct: '?', tip: 'thế nào = 怎么；怎么样' },
  { zh: '我想订一个房间。', tokens: ['Tôi', 'muốn', 'đặt', 'một', 'phòng'], punct: '.' },
  { zh: '我的手机没电了。', tokens: ['Điện thoại', 'của', 'tôi', 'hết', 'pin'], punct: '.', tip: 'hết = 用完了' },
  { zh: '我喜欢听音乐。', tokens: ['Tôi', 'thích', 'nghe', 'nhạc'], punct: '.' },
  { zh: '越南语不太难。', tokens: ['Tiếng Việt', 'không', 'khó', 'lắm'], punct: '.', tip: 'không + 形容词 + lắm = 不太……' },
  { zh: '我会说一点越南语。', tokens: ['Tôi', 'nói', 'được', 'một chút', 'tiếng Việt'], punct: '.', tip: '动词 + được = 能/会做某事' },
  { zh: '你可以帮我吗？', tokens: ['Bạn', 'giúp', 'tôi', 'được', 'không'], punct: '?' },
  { zh: '我也是。', tokens: ['Tôi', 'cũng', 'vậy'], punct: '.', tip: 'cũng = 也，放在动词或形容词前面' },
];

export const sentenceText = (s: SentenceItem) => s.tokens.join(' ') + s.punct;
