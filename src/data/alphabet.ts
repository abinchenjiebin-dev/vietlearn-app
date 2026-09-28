// 字母发音课：29 个字母 + 常见辅音组合。每个字母有拼读音（bờ）和字母名（bê）。
// 发音提示用中文近似音，北部（河内）读音为主。

export type Letter = {
  letter: string;
  /** 拼读音（拼读单词时这样念，比如 b 念 bờ） */
  say: string;
  /** 字母名（念字母表时这样叫，比如 b 叫 bê） */
  name: string;
  /** 例词 */
  vi: string;
  zh: string;
  hint: string;
};

export const vowels: Letter[] = [
  { letter: 'a', say: 'a', name: 'a', vi: 'ba', zh: '三', hint: '像“啊”，口张大' },
  { letter: 'ă', say: 'á', name: 'á', vi: 'ăn', zh: '吃', hint: '短促的“啊”，很快收住' },
  { letter: 'â', say: 'ớ', name: 'ớ', vi: 'cân', zh: '公斤', hint: '短促的“呃”' },
  { letter: 'e', say: 'e', name: 'e', vi: 'em', zh: '弟弟；妹妹', hint: '口张大的“诶”，像英语 bed 的 e' },
  { letter: 'ê', say: 'ê', name: 'ê', vi: 'đêm', zh: '夜里', hint: '口较闭的“诶”' },
  { letter: 'i', say: 'i', name: 'i ngắn', vi: 'đi', zh: '去', hint: '像“衣”' },
  { letter: 'o', say: 'o', name: 'o', vi: 'có', zh: '有', hint: '口很开的“奥”，像英语 law' },
  { letter: 'ô', say: 'ô', name: 'ô', vi: 'cô', zh: '阿姨；女老师', hint: '圆唇的“哦”' },
  { letter: 'ơ', say: 'ơ', name: 'ơ', vi: 'phở', zh: '河粉', hint: '像“呃”，嘴唇放松' },
  { letter: 'u', say: 'u', name: 'u', vi: 'thu', zh: '秋天', hint: '像“乌”，嘴唇圆' },
  { letter: 'ư', say: 'ư', name: 'ư', vi: 'thư', zh: '信', hint: '嘴唇扁平着发“乌”' },
  { letter: 'y', say: 'i', name: 'i dài', vi: 'Mỹ', zh: '美国', hint: '和 i 一样读“衣”' },
];

export const consonants: Letter[] = [
  { letter: 'b', say: 'bờ', name: 'bê', vi: 'ba', zh: '三', hint: '像 b，声音更浊' },
  { letter: 'c', say: 'cờ', name: 'xê', vi: 'cá', zh: '鱼', hint: '像不送气的“哥”' },
  { letter: 'd', say: 'dờ', name: 'dê', vi: 'da', zh: '皮肤', hint: '北方读 z，南方读 y' },
  { letter: 'đ', say: 'đờ', name: 'đê', vi: 'đi', zh: '去', hint: '像“的”，舌尖用力' },
  { letter: 'g', say: 'gờ', name: 'giê', vi: 'gà', zh: '鸡', hint: '喉咙里的浊音 g' },
  { letter: 'h', say: 'hờ', name: 'hát', vi: 'hai', zh: '二', hint: '像“哈”' },
  { letter: 'k', say: 'ca', name: 'ca', vi: 'kem', zh: '冰淇淋', hint: '同 c，用在 i、e、ê、y 前' },
  { letter: 'l', say: 'lờ', name: 'e-lờ', vi: 'lá', zh: '叶子', hint: '像 l' },
  { letter: 'm', say: 'mờ', name: 'em-mờ', vi: 'mẹ', zh: '妈妈', hint: '像 m' },
  { letter: 'n', say: 'nờ', name: 'en-nờ', vi: 'nước', zh: '水', hint: '像 n' },
  { letter: 'p', say: 'pờ', name: 'pê', vi: 'pin', zh: '电池', hint: '像 b，多用在外来词和词尾' },
  { letter: 'q', say: 'quờ', name: 'quy', vi: 'quá', zh: '太', hint: '总是写成 qu，读“gu”' },
  { letter: 'r', say: 'rờ', name: 'e-rờ', vi: 'rau', zh: '蔬菜', hint: '北方读 z，南方读卷舌 r' },
  { letter: 's', say: 'sờ', name: 'ét-xì', vi: 'sáu', zh: '六', hint: '北方读 s，南方读 sh' },
  { letter: 't', say: 'tờ', name: 'tê', vi: 'tôi', zh: '我', hint: '不送气，像“的”' },
  { letter: 'v', say: 'vờ', name: 'vê', vi: 'vui', zh: '高兴', hint: '像英语 v，上齿碰下唇' },
  { letter: 'x', say: 'xờ', name: 'ích-xì', vi: 'xe', zh: '车', hint: '像 s' },
];

export const clusters: Letter[] = [
  { letter: 'ch', say: 'chờ', name: 'chờ', vi: 'chào', zh: '你好', hint: '像不送气的“知/鸡”' },
  { letter: 'gh', say: 'gờ', name: 'gờ kép', vi: 'ghế', zh: '椅子', hint: '读 g，用在 i、e、ê 前' },
  { letter: 'gi', say: 'giờ', name: 'giờ', vi: 'gì', zh: '什么', hint: '北方读 z，南方读 y' },
  { letter: 'kh', say: 'khờ', name: 'khờ', vi: 'không', zh: '不', hint: '像“喝”，喉咙有摩擦' },
  { letter: 'ng', say: 'ngờ', name: 'ngờ', vi: 'ngủ', zh: '睡觉', hint: '把“昂”的尾音 ng 放在开头' },
  { letter: 'ngh', say: 'ngờ', name: 'ngờ kép', vi: 'nghe', zh: '听', hint: '同 ng，用在 i、e、ê 前' },
  { letter: 'nh', say: 'nhờ', name: 'nhờ', vi: 'nhà', zh: '家', hint: '像“捏”的 ni' },
  { letter: 'ph', say: 'phờ', name: 'phờ', vi: 'phở', zh: '河粉', hint: '读 f' },
  { letter: 'th', say: 'thờ', name: 'thờ', vi: 'thích', zh: '喜欢', hint: '送气的 t，像“特”' },
  { letter: 'tr', say: 'trờ', name: 'trờ', vi: 'trà', zh: '茶', hint: '北方读“知”，南方卷舌' },
];

// 听辨声调练习用的音节：单个元音，声调符号直接加在元音上
const MARKS = ['', '̀', '́', '̉', '̃', '̣'];
export const toneNames = ['平声', '玄声', '锐声', '问声', '跌声', '重声'];
export const toneHints = ['平', '降 ↘', '升 ↗', '降升 ↘↗', '断升 ↗', '短促 ↓'];

const bases = ['ma', 'ba', 'la', 'ca', 'na', 'ta', 'bo', 'co', 'to', 'mi', 'ti', 'bu', 'tu', 'me', 'be', 'nho'];

/** 一个音节的 6 个声调写法 */
export function toneSet(base: string): string[] {
  const i = base.search(/[aeiouy][^aeiouy]*$/);
  return MARKS.map((m) => (base.slice(0, i + 1) + m + base.slice(i + 1)).normalize('NFC'));
}

export const toneBases = bases;
