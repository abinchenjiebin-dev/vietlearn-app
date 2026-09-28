// 汇总所有学习内容，供复习、测验、搜索使用
import { allCompounds } from './compounds';
import { sentences, sentenceText } from './sentences';
import { Entry, topics } from './topics';

export type Word = Entry & { topicId: string };

/** 所有词汇（按主题顺序，重复的只保留第一次出现） */
export const allWords: Word[] = (() => {
  const seen = new Set<string>();
  const out: Word[] = [];
  for (const t of topics)
    for (const w of t.words)
      if (!seen.has(w.vi)) {
        seen.add(w.vi);
        out.push({ ...w, topicId: t.id });
      }
  return out;
})();

export const wordByVi = new Map(allWords.map((w) => [w.vi, w]));

export const allPhrases: Word[] = topics.flatMap((t) => t.phrases.map((p) => ({ ...p, topicId: t.id })));

export type SearchItem = { kind: '词汇' | '常用语' | '组词' | '句子'; vi: string; zh: string; note?: string; topicId?: string };

export const searchIndex: SearchItem[] = [
  ...allWords.map((w) => ({ kind: '词汇' as const, ...w })),
  ...allPhrases.map((p) => ({ kind: '常用语' as const, ...p })),
  ...allCompounds.map((c) => ({
    kind: '组词' as const,
    vi: c.vi,
    zh: c.zh,
    note: c.parts.map((p) => `${p.vi}(${p.zh})`).join(' + '),
  })),
  ...sentences.map((s) => ({ kind: '句子' as const, vi: sentenceText(s), zh: s.zh, note: s.tip })),
];

const syllablesOf = (vi: string) => vi.toLowerCase().split(' ');

/** 含这个词的常用语（按整词匹配） */
export function examplesFor(vi: string, n = 3): Word[] {
  const key = ` ${vi.toLowerCase()} `;
  return allPhrases.filter((p) => ` ${p.vi.toLowerCase().replace(/[.,!?]/g, '')} `.includes(key)).slice(0, n);
}

/** 用到这个词（或它的某个音节）的合成词 */
export function relatedCompounds(vi: string) {
  const syl = syllablesOf(vi);
  return allCompounds.filter((c) => c.vi !== vi && c.parts.some((p) => syl.includes(p.vi.toLowerCase()))).slice(0, 6);
}

/** 和这个词有相同音节的其他单词，比如 xe → xe máy、xe buýt */
export function relatedWords(vi: string, n = 8): Word[] {
  const syl = syllablesOf(vi);
  return allWords.filter((w) => w.vi !== vi && syllablesOf(w.vi).some((x) => syl.includes(x))).slice(0, n);
}
