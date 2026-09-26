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
