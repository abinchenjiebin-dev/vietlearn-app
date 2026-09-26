// 词汇测验的出题逻辑
import type { IconName } from '../components/ui';
import { toneBases, toneSet } from '../data/alphabet';
import { allWords, type Word } from '../data';
import { plain, shuffle } from './utils';

export type QuizType = 'meaning' | 'vi2zh' | 'listen' | 'spell' | 'tone' | 'mix';
export type ChoiceMode = 'meaning' | 'vi2zh' | 'listen';

export const quizTypes: { type: QuizType; title: string; sub: string; icon: IconName; color: string }[] = [
  { type: 'meaning', title: '看中文选越南语', sub: '4 选 1', icon: 'language', color: '#E4572E' },
  { type: 'vi2zh', title: '看越南语选中文', sub: '4 选 1，边看边听', icon: 'eye', color: '#3E7CB1' },
  { type: 'listen', title: '听音选词', sub: '只听发音，选出听到的词', icon: 'ear', color: '#2A9D8F' },
  { type: 'spell', title: '拼写', sub: '听发音，打出越南语（带声调）', icon: 'create', color: '#8E5572' },
  { type: 'tone', title: '听辨声调', sub: '听一个音节，选出它的声调', icon: 'pulse', color: '#D1A21F' },
];

export const mixMeta = { type: 'mix' as const, title: '每日一刷', sub: '所有题型随机混合', icon: 'flash' as IconName, color: '#D7263D' };

export const DRILL_SIZES = [10, 20, 30, 50];

export type Option = { label: string; correct: boolean };

export type Question =
  | { kind: 'choice'; mode: ChoiceMode; word: Word; options: Option[] }
  | { kind: 'spell'; word: Word }
  | { kind: 'tone'; syllable: string; options: string[]; answer: number };

export const QUIZ_LEN = 10;

const syllables = (w: Word) => w.vi.split(' ').length;

/** 适合拼写的词：最多两个音节、只有字母 */
export const spellable = (w: Word) => syllables(w) <= 2 && /^[\p{L} ]+$/u.test(w.vi);

function distractors(word: Word, pool: Word[], field: 'vi' | 'zh', n: number): Word[] {
  const src = pool.length >= 8 ? pool : allWords;
  const seen = new Set([word[field], word.vi, word.zh]);
  // 优先挑音节数相同、开头字母相同的词，更有挑战
  const ranked = shuffle(src).sort((a, b) => {
    if (field !== 'vi') return 0;
    const sa = Number(syllables(a) === syllables(word)) + Number(plain(a.vi)[0] === plain(word.vi)[0]);
    const sb = Number(syllables(b) === syllables(word)) + Number(plain(b.vi)[0] === plain(word.vi)[0]);
    return sb - sa;
  });
  const out: Word[] = [];
  for (const w of ranked) {
    if (out.length >= n) break;
    if (seen.has(w[field]) || seen.has(w.vi)) continue;
    seen.add(w[field]);
    out.push(w);
  }
  return out;
}

export function makeChoice(word: Word, mode: ChoiceMode, pool: Word[] = allWords): Question {
  const field = mode === 'vi2zh' ? 'zh' : 'vi';
  return {
    kind: 'choice',
    mode,
    word,
    options: shuffle([word, ...distractors(word, pool, field, 3)]).map((w) => ({ label: w[field], correct: w === word })),
  };
}

export function makeTone(): Question {
  const base = toneBases[Math.floor(Math.random() * toneBases.length)];
  const options = toneSet(base);
  const answer = Math.floor(Math.random() * 6);
  return { kind: 'tone', syllable: options[answer], options, answer };
}

/** 给一个词随机出一道题（每日一刷、智能复习用） */
export function makeAny(word: Word, pool: Word[] = allWords): Question {
  const modes: ChoiceMode[] = ['meaning', 'vi2zh', 'listen'];
  if (spellable(word) && Math.random() < 0.2) return { kind: 'spell', word };
  return makeChoice(word, modes[Math.floor(Math.random() * modes.length)], pool);
}

export function buildQuiz(type: QuizType, pool: Word[], n = QUIZ_LEN): Question[] {
  if (type === 'tone') return Array.from({ length: n }, makeTone);
  if (type === 'spell') {
    const easy = pool.filter(spellable);
    return shuffle(easy.length >= 3 ? easy : pool)
      .slice(0, n)
      .map((word) => ({ kind: 'spell' as const, word }));
  }
  if (type === 'mix') {
    // 词不够时允许重复；约每 6 题插一道听辨声调
    const words = shuffle(pool);
    return Array.from({ length: n }, (_, i) =>
      Math.random() < 0.15 ? makeTone() : makeAny(words[i % words.length], pool),
    );
  }
  return shuffle(pool)
    .slice(0, n)
    .map((word) => makeChoice(word, type, pool));
}
