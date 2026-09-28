// 闯关出题：根据关卡类型生成一串步骤（教新词 + 各种题目）
import { clusters, consonants, type Letter } from '../data/alphabet';
import { allPhrases, allWords, type Word } from '../data';
import { dialogues } from '../data/dialogues';
import { getUnit, type Level } from '../data/levels';
import { getTopic } from '../data/topics';
import { makeAny, makeChoice, makeTone, spellable, type Question } from './quiz';
import { pickRandom, shuffle } from './utils';

export type Step =
  /** 教一个新词（不计分） */
  | { kind: 'teach'; word: Word }
  /** 教一个声调（不计分） */
  | { kind: 'teachTone'; index: number }
  /** 把打乱的词块排成句子 */
  | { kind: 'order'; phrase: Word; tiles: string[] }
  /** 通用选择题 */
  | {
      kind: 'pick';
      prompt: string;
      big?: string;
      sub?: string;
      speak?: string;
      options: string[];
      answer: number;
      explain?: string;
    }
  | Question;

export const isGraded = (s: Step) => s.kind !== 'teach' && s.kind !== 'teachTone';

/** 这一步考的是哪个词（记错题本用） */
export const stepWord = (s: Step): string | undefined =>
  s.kind === 'choice' || s.kind === 'spell' ? s.word.vi : undefined;

const strip = (vi: string) => vi.replace(/[.,!?]/g, '');

/** 排句子：句子拆成词块，再加 1–2 个干扰块 */
function makeOrder(phrase: Word): Step {
  const own = strip(phrase.vi).split(' ');
  const pool = Array.from(new Set(allPhrases.flatMap((p) => strip(p.vi).toLowerCase().split(' '))));
  const extra = pickRandom(pool.filter((t) => !own.map((o) => o.toLowerCase()).includes(t)), own.length > 5 ? 1 : 2);
  return { kind: 'order', phrase, tiles: shuffle([...own.map((t) => t.toLowerCase()), ...extra]) };
}

const orderable = (p: Word) => {
  const n = strip(p.vi).split(' ').length;
  return n >= 2 && n <= 7;
};

// 听起来一样或很像的字母，不能同时出现在选项里
const SAME_SOUND = [['c', 'k', 'q'], ['d', 'r', 'gi'], ['s', 'x'], ['g', 'gh'], ['ng', 'ngh'], ['ch', 'tr']];
const sameSound = (a: string, b: string) => SAME_SOUND.some((g) => g.includes(a) && g.includes(b));

function makeLetter(l: Letter, group: Letter[]): Step {
  // 选项里不能有答案的前缀（nh 的前缀 n），也不能有同音字母
  const others = pickRandom(
    group.filter((x) => x.letter !== l.letter && !l.vi.startsWith(x.letter) && !x.vi.startsWith(l.letter) && !sameSound(x.letter, l.letter)),
    3,
  ).map((x) => x.letter);
  const options = shuffle([l.letter, ...others]);
  return {
    kind: 'pick',
    prompt: '听这个词，它是用哪个字母开头的？',
    big: '🔊',
    speak: l.vi,
    options,
    answer: options.indexOf(l.letter),
    explain: `${l.vi}（${l.zh}）· ${l.letter}：${l.hint}`,
  };
}

function dialoguePicks(topicId: string, max: number): Step[] {
  const out: Step[] = [];
  for (const d of dialogues.filter((x) => x.topicId === topicId)) {
    const mine = d.lines.filter((l) => l.who === 'me');
    d.lines.forEach((line, i) => {
      if (line.who !== 'me') return;
      const prev = d.lines[i - 1];
      const wrong = pickRandom(
        mine.filter((m) => m !== line),
        2,
      ).map((m) => m.vi);
      const options = shuffle([line.vi, ...wrong]);
      out.push({
        kind: 'pick',
        prompt: prev ? `${d.emoji} ${d.zh}：对方说完，你想说“${line.zh}”` : `${d.emoji} ${d.zh}：你先开口，想说“${line.zh}”`,
        big: prev?.vi,
        sub: prev?.zh,
        speak: prev?.vi,
        options,
        answer: options.indexOf(line.vi),
        explain: line.note,
      });
    });
  }
  return shuffle(out).slice(0, max);
}

/** 根据关卡生成步骤 */
export function buildLevel(level: Level): Step[] {
  const unit = getUnit(level.unitId)!;
  const topic = unit.topicId ? getTopic(unit.topicId) : undefined;
  const topicWords: Word[] = topic ? topic.words.map((w) => ({ ...w, topicId: topic.id })) : [];
  const wordPool = topicWords.length >= 8 ? topicWords : allWords;
  const topicPhrases: Word[] = topic ? topic.phrases.map((p) => ({ ...p, topicId: topic.id })) : [];
  const phrasePool = topicPhrases.length >= 8 ? topicPhrases : allPhrases;

  switch (level.kind) {
    case 'tones':
      return [...[0, 1, 2, 3, 4, 5].map((index) => ({ kind: 'teachTone' as const, index })), ...Array.from({ length: 6 }, makeTone)];
    case 'letters': {
      const picks = [...pickRandom(consonants, 5).map((l) => makeLetter(l, consonants)), ...pickRandom(clusters, 4).map((l) => makeLetter(l, clusters))];
      return shuffle(picks);
    }
    case 'toneBoss':
      return Array.from({ length: 10 }, makeTone);
    case 'words': {
      // 教两个词 → 马上各考一题，最后再复习两题
      const words: Word[] = (level.words ?? []).map((w) => ({ ...w, topicId: topic!.id }));
      const steps: Step[] = [];
      for (let i = 0; i < words.length; i += 2) {
        const pair = words.slice(i, i + 2);
        pair.forEach((w) => steps.push({ kind: 'teach', word: w }));
        shuffle(pair).forEach((w) => steps.push(makeChoice(w, i % 4 === 0 ? 'vi2zh' : 'meaning', wordPool)));
      }
      shuffle(words)
        .slice(0, 3)
        .forEach((w) => steps.push(spellable(w) && Math.random() < 0.4 ? { kind: 'spell', word: w } : makeChoice(w, 'listen', wordPool)));
      return steps;
    }
    case 'phrases': {
      // 教一句 → 考一题；最后两题不教直接考
      const list = shuffle(topicPhrases).slice(0, 6);
      const steps: Step[] = [];
      list.slice(0, 4).forEach((p, i) => {
        steps.push({ kind: 'teach', word: p });
        steps.push(orderable(p) && i % 2 === 0 ? makeOrder(p) : makeChoice(p, 'meaning', phrasePool));
      });
      list.slice(4).forEach((p) => steps.push(orderable(p) ? makeOrder(p) : makeChoice(p, 'vi2zh', phrasePool)));
      return steps;
    }
    case 'dialogue':
      return dialoguePicks(topic!.id, 8);
    case 'boss': {
      const steps: Step[] = [
        ...pickRandom(topicWords, 6).map((w) => makeAny(w, wordPool)),
        ...pickRandom(topicPhrases.filter(orderable), 2).map(makeOrder),
        ...pickRandom(topicPhrases, 1).map((p) => makeChoice(p, 'listen', phrasePool)),
        ...(topic ? dialoguePicks(topic.id, 2) : []),
      ];
      return shuffle(steps).slice(0, 10);
    }
  }
}

/** 星级：全对 3 星，错 1 题 2 星，错 2 题 1 星（错 3 题生命用完） */
export const starsFor = (mistakes: number) => (mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1);

export const HEARTS = 3;
