// 课程闯关：17 个单元，每个单元若干关，最后一关是单元挑战（👑）。
import { dialogues } from './dialogues';
import { getTopic, type Entry } from './topics';

export type LevelKind = 'tones' | 'letters' | 'toneBoss' | 'words' | 'phrases' | 'dialogue' | 'boss';

export type Level = {
  id: string;
  unitId: string;
  kind: LevelKind;
  title: string;
  /** 新词关：这一关教的词 */
  words?: Entry[];
};

export type Unit = {
  id: string;
  n: number;
  zh: string;
  emoji: string;
  color: string;
  goal: string;
  topicId?: string;
  levels: Level[];
};

/** 每个新词关最多教几个词 */
const WORDS_PER_LEVEL = 8;

function topicUnit(n: number, topicId: string, goal: string): Unit {
  const t = getTopic(topicId)!;
  const id = `u${n}`;
  // 词分成几关，每关差不多一样多（最多 4 关）
  const parts = Math.min(4, Math.ceil(t.words.length / WORDS_PER_LEVEL));
  const size = Math.ceil(t.words.length / parts);
  const levels: Level[] = [];
  for (let i = 0; i < parts; i++)
    levels.push({
      id: `${id}-w${i + 1}`,
      unitId: id,
      kind: 'words',
      title: parts > 1 ? `新词 ${i + 1}` : '新词',
      words: t.words.slice(i * size, (i + 1) * size),
    });
  levels.push({ id: `${id}-p`, unitId: id, kind: 'phrases', title: '常用句子' });
  if (dialogues.some((d) => d.topicId === topicId)) levels.push({ id: `${id}-d`, unitId: id, kind: 'dialogue', title: '情景对话' });
  levels.push({ id: `${id}-boss`, unitId: id, kind: 'boss', title: '单元挑战' });
  return { id, n, zh: t.zh, emoji: t.emoji, color: t.color, goal, topicId, levels };
}

export const units: Unit[] = [
  {
    id: 'u1',
    n: 1,
    zh: '发音与声调',
    emoji: '🎵',
    color: '#0F9D6B',
    goal: '听懂 6 个声调，认识越南语字母',
    levels: [
      { id: 'u1-tones', unitId: 'u1', kind: 'tones', title: '认识声调' },
      { id: 'u1-letters', unitId: 'u1', kind: 'letters', title: '字母发音' },
      { id: 'u1-boss', unitId: 'u1', kind: 'toneBoss', title: '声调挑战' },
    ],
  },
  topicUnit(2, 'greetings', '会打招呼、介绍自己'),
  topicUnit(3, 'numbers', '会数数、问价格和年龄'),
  topicUnit(4, 'shopping', '会在市场买东西、砍价'),
  topicUnit(5, 'food', '会在餐厅点菜、买单'),
  topicUnit(6, 'transport', '会打车、问路'),
  topicUnit(7, 'time', '会说时间、约时间'),
  topicUnit(8, 'family', '会介绍家人'),
  topicUnit(9, 'daily', '听不懂、迷路时会求助'),
  topicUnit(10, 'hotel', '会办理入住、提需求'),
  topicUnit(11, 'health', '生病时会说哪里不舒服'),
  topicUnit(12, 'colors', '会说颜色'),
  topicUnit(13, 'adjectives', '会用形容词，会比较“更……”“最……”'),
  topicUnit(14, 'weather', '会聊天气'),
  topicUnit(15, 'work', '会聊工作和学习'),
  topicUnit(16, 'animals', '会说常见动物，知道越南的生肖'),
  topicUnit(17, 'hobbies', '会聊兴趣爱好'),
];

/** 所有关卡按顺序排成一条路线 */
export const allLevels: Level[] = units.flatMap((u) => u.levels);

export const getLevel = (id: string) => allLevels.find((l) => l.id === id);
export const getUnit = (id: string) => units.find((u) => u.id === id);

/** 第一个还没通过的关（就是当前关）；全部通过返回 undefined */
export const currentLevel = (passed: Record<string, number>) => allLevels.find((l) => !passed[l.id]);

/** 能不能玩：已通过，或者是当前关 */
export const isOpen = (level: Level, passed: Record<string, number>) => !!passed[level.id] || currentLevel(passed)?.id === level.id;
