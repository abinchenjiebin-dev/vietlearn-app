// 情景对话：出门最常用的场景。me = 你，other = 对方。
// 对话里“你”默认是男性（被称作 anh）；对女性一般称 chị，对年纪小的称 em。

export type Line = { who: 'me' | 'other'; vi: string; zh: string; note?: string };

export type Dialogue = {
  id: string;
  zh: string;
  emoji: string;
  color: string;
  /** 场景说明 */
  scene: string;
  /** 对方是谁 */
  other: string;
  otherEmoji: string;
  /** 相关主题（学习路线用） */
  topicId: string;
  lines: Line[];
};

export const dialogues: Dialogue[] = [
  {
    id: 'intro',
    zh: '初次见面',
    emoji: '🤝',
    color: '#E4572E',
    scene: '在咖啡馆认识了一个越南朋友',
    other: 'Lan（新朋友）',
    otherEmoji: '👩',
    topicId: 'greetings',
    lines: [
      { who: 'me', vi: 'Xin chào!', zh: '你好！' },
      { who: 'other', vi: 'Chào bạn! Bạn tên là gì?', zh: '你好！你叫什么名字？' },
      { who: 'me', vi: 'Tôi tên là Minh. Còn bạn?', zh: '我叫明。你呢？', note: 'Còn bạn? = 你呢？' },
      { who: 'other', vi: 'Tôi tên là Lan. Bạn là người nước nào?', zh: '我叫兰。你是哪国人？' },
      { who: 'me', vi: 'Tôi là người Trung Quốc.', zh: '我是中国人。' },
      { who: 'other', vi: 'Bạn đến Việt Nam lâu chưa?', zh: '你来越南多久了？' },
      { who: 'me', vi: 'Tôi mới đến được một tuần.', zh: '我刚来一个星期。', note: 'mới = 刚刚' },
      { who: 'other', vi: 'Bạn nói tiếng Việt giỏi quá!', zh: '你越南语说得真好！' },
      { who: 'me', vi: 'Cảm ơn bạn. Rất vui được gặp bạn.', zh: '谢谢。很高兴认识你。' },
      { who: 'other', vi: 'Tôi cũng vậy!', zh: '我也是！' },
    ],
  },
  {
    id: 'restaurant',
    zh: '餐厅点餐',
    emoji: '🍜',
    color: '#D1A21F',
    scene: '和朋友两个人去吃河粉',
    other: '服务员',
    otherEmoji: '🧑‍🍳',
    topicId: 'food',
    lines: [
      { who: 'other', vi: 'Chào anh, anh đi mấy người ạ?', zh: '您好，您几位？', note: 'ạ 放在句末表示礼貌' },
      { who: 'me', vi: 'Hai người.', zh: '两位。' },
      { who: 'other', vi: 'Mời anh ngồi đây. Đây là thực đơn.', zh: '请坐这里。这是菜单。' },
      { who: 'me', vi: 'Cho tôi hai bát phở bò.', zh: '给我两碗牛肉河粉。', note: '南方说 tô（大碗）' },
      { who: 'other', vi: 'Anh uống gì ạ?', zh: '您喝点什么？' },
      { who: 'me', vi: 'Cho tôi một ly cà phê sữa đá và một chai nước.', zh: '给我一杯冰奶咖啡和一瓶水。' },
      { who: 'other', vi: 'Vâng, anh chờ một chút nhé.', zh: '好的，请稍等。' },
      { who: 'me', vi: 'Em ơi, tính tiền!', zh: '服务员，买单！', note: '叫年轻的服务员用 em ơi' },
      { who: 'other', vi: 'Của anh hết một trăm hai mươi nghìn.', zh: '您一共十二万盾。' },
      { who: 'me', vi: 'Gửi em. Cảm ơn nhé!', zh: '给你。谢谢！' },
    ],
  },
  {
    id: 'market',
    zh: '市场砍价',
    emoji: '🛍️',
    color: '#8E5572',
    scene: '在市场买一件上衣',
    other: '卖衣服的大姐',
    otherEmoji: '👩‍🦱',
    topicId: 'shopping',
    lines: [
      { who: 'me', vi: 'Chị ơi, cái áo này bao nhiêu tiền?', zh: '大姐，这件上衣多少钱？' },
      { who: 'other', vi: 'Ba trăm nghìn em ạ.', zh: '三十万盾。', note: '卖家称年轻的顾客为 em' },
      { who: 'me', vi: 'Đắt quá! Hai trăm được không?', zh: '太贵了！二十万行吗？' },
      { who: 'other', vi: 'Không được em ơi. Hai trăm rưỡi nhé.', zh: '不行啊。二十五万吧。', note: 'hai trăm rưỡi = 两百五（二十五万）' },
      { who: 'me', vi: 'Hai trăm hai được không chị?', zh: '二十二万行吗？' },
      { who: 'other', vi: 'Thôi được, chị bán cho em.', zh: '好吧，卖给你。' },
      { who: 'me', vi: 'Có màu khác không chị?', zh: '有别的颜色吗？' },
      { who: 'other', vi: 'Có màu đen và màu trắng.', zh: '有黑色和白色。' },
      { who: 'me', vi: 'Cho em cái màu đen.', zh: '给我黑色的。', note: '对卖家大姐自称 em' },
    ],
  },
  {
    id: 'taxi',
    zh: '打摩托车',
    emoji: '🛵',
    color: '#2A9D8F',
    scene: '在路边叫摩的去酒店',
    other: '摩的司机',
    otherEmoji: '🧔',
    topicId: 'transport',
    lines: [
      { who: 'me', vi: 'Anh ơi, đi đến khách sạn này bao nhiêu tiền?', zh: '大哥，去这家酒店多少钱？' },
      { who: 'other', vi: 'Tám mươi nghìn.', zh: '八万。' },
      { who: 'me', vi: 'Năm mươi nghìn được không?', zh: '五万行吗？' },
      { who: 'other', vi: 'Sáu mươi nghìn nhé. Lên xe đi.', zh: '六万吧。上车。' },
      { who: 'me', vi: 'Anh đi chậm một chút nhé.', zh: '您开慢一点哦。' },
      { who: 'other', vi: 'Được.', zh: '好。' },
      { who: 'me', vi: 'Rẽ trái ở ngã tư kia.', zh: '在前面那个十字路口左转。', note: '南方说 quẹo trái' },
      { who: 'me', vi: 'Dừng ở đây. Cảm ơn anh!', zh: '在这里停。谢谢！' },
    ],
  },
  {
    id: 'directions',
    zh: '问路',
    emoji: '🗺️',
    color: '#3E7CB1',
    scene: '找不到滨城市场，向路人问路',
    other: '路人',
    otherEmoji: '🧑',
    topicId: 'transport',
    lines: [
      { who: 'me', vi: 'Xin lỗi, cho tôi hỏi chợ Bến Thành ở đâu?', zh: '不好意思，请问滨城市场在哪里？' },
      { who: 'other', vi: 'Bạn đi thẳng đường này.', zh: '你沿着这条路直走。' },
      { who: 'me', vi: 'Có xa không?', zh: '远吗？' },
      { who: 'other', vi: 'Không xa lắm, đi bộ khoảng mười phút.', zh: '不太远，走路大概十分钟。', note: 'khoảng = 大约' },
      { who: 'other', vi: 'Đến ngã tư thứ hai thì rẽ phải.', zh: '到第二个十字路口右转。' },
      { who: 'me', vi: 'Rẽ phải ở ngã tư thứ hai, đúng không?', zh: '在第二个十字路口右转，对吗？' },
      { who: 'other', vi: 'Đúng rồi.', zh: '对了。' },
      { who: 'me', vi: 'Cảm ơn bạn nhiều!', zh: '非常感谢！' },
    ],
  },
  {
    id: 'hotel',
    zh: '酒店入住',
    emoji: '🏨',
    color: '#9C6644',
    scene: '到酒店前台办理入住',
    other: '前台',
    otherEmoji: '💁‍♀️',
    topicId: 'hotel',
    lines: [
      { who: 'me', vi: 'Chào chị, tôi đã đặt phòng.', zh: '你好，我订了房间。' },
      { who: 'other', vi: 'Anh cho em xem hộ chiếu ạ.', zh: '请给我看一下您的护照。' },
      { who: 'me', vi: 'Đây ạ.', zh: '给您。' },
      { who: 'other', vi: 'Phòng của anh là phòng năm trăm linh hai, ở tầng năm.', zh: '您的房间是 502，在五楼。', note: '南方说 năm trăm lẻ hai' },
      { who: 'me', vi: 'Mấy giờ ăn sáng?', zh: '几点吃早餐？' },
      { who: 'other', vi: 'Từ sáu giờ đến mười giờ sáng.', zh: '早上六点到十点。', note: 'từ……đến…… = 从……到……' },
      { who: 'me', vi: 'Mật khẩu wifi là gì?', zh: 'Wi-Fi 密码是什么？' },
      { who: 'other', vi: 'Mật khẩu ở trên thẻ phòng ạ.', zh: '密码在房卡上。' },
      { who: 'me', vi: 'Cảm ơn chị.', zh: '谢谢。' },
    ],
  },
  {
    id: 'pharmacy',
    zh: '药店买药',
    emoji: '💊',
    color: '#D62828',
    scene: '有点发烧，去药店买药',
    other: '药剂师',
    otherEmoji: '👩‍⚕️',
    topicId: 'health',
    lines: [
      { who: 'me', vi: 'Chào chị, tôi bị đau đầu và sốt.', zh: '你好，我头疼还发烧。' },
      { who: 'other', vi: 'Anh bị từ bao giờ?', zh: '从什么时候开始的？' },
      { who: 'me', vi: 'Từ tối hôm qua.', zh: '从昨天晚上。' },
      { who: 'other', vi: 'Anh có bị ho không?', zh: '咳嗽吗？' },
      { who: 'me', vi: 'Có, ho một chút.', zh: '有，有点咳嗽。' },
      { who: 'other', vi: 'Anh uống thuốc này, mỗi ngày ba lần, sau khi ăn.', zh: '这个药每天吃三次，饭后吃。', note: '“吃药”越南语说 uống thuốc（喝药）' },
      { who: 'me', vi: 'Bao nhiêu tiền?', zh: '多少钱？' },
      { who: 'other', vi: 'Năm mươi nghìn. Nếu không đỡ thì anh nên đi bệnh viện.', zh: '五万。如果不见好，最好去医院。', note: 'nếu……thì…… = 如果……就……' },
      { who: 'me', vi: 'Vâng, cảm ơn chị.', zh: '好的，谢谢。' },
    ],
  },
  {
    id: 'hangout',
    zh: '约朋友',
    emoji: '☕',
    color: '#277DA1',
    scene: '约越南朋友周末去喝咖啡',
    other: 'Nam（朋友）',
    otherEmoji: '🧑‍🦱',
    topicId: 'hobbies',
    lines: [
      { who: 'me', vi: 'Cuối tuần này bạn có rảnh không?', zh: '这个周末你有空吗？' },
      { who: 'other', vi: 'Có, sao vậy?', zh: '有，怎么了？' },
      { who: 'me', vi: 'Chúng ta đi uống cà phê nhé?', zh: '我们去喝咖啡吧？' },
      { who: 'other', vi: 'Được đấy! Mấy giờ?', zh: '好啊！几点？' },
      { who: 'me', vi: 'Ba giờ chiều thứ Bảy, được không?', zh: '星期六下午三点，行吗？' },
      { who: 'other', vi: 'Được. Gặp ở đâu?', zh: '行。在哪儿见？' },
      { who: 'me', vi: 'Ở quán cà phê gần khách sạn của tôi.', zh: '在我酒店附近的咖啡馆。', note: 'quán = 小店，gần = 附近' },
      { who: 'other', vi: 'Được rồi, hẹn gặp bạn thứ Bảy nhé!', zh: '好的，星期六见！' },
    ],
  },
];

export const getDialogue = (id: string) => dialogues.find((d) => d.id === id);
