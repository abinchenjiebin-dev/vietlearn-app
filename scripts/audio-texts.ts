// 收集所有需要发音的越南语文本，给 gen-audio.py 生成录音用：
//   npx tsx scripts/audio-texts.ts > scripts/audio-texts.json

import { allPhrases, allWords } from '../src/data';
import { clusters, consonants, toneBases, toneSet, vowels } from '../src/data/alphabet';
import { allSyllables, rootGroups } from '../src/data/compounds';
import { dialogues } from '../src/data/dialogues';
import { sentences, sentenceText } from '../src/data/sentences';
import { tones } from '../src/data/topics';
import { audioKey } from '../src/lib/audioKey';

const texts = new Map<string, string>();
const add = (t?: string) => {
  if (!t || !t.trim()) return;
  const k = audioKey(t);
  if (!texts.has(k)) texts.set(k, t.trim());
};
/** 逐词朗读、排句子的词块：每个词单独一条 */
const addWords = (t: string) => t.split(' ').forEach((w) => add(w.replace(/[.,!?]/g, '')));

allWords.forEach((w) => { add(w.vi); addWords(w.vi); });
allPhrases.forEach((p) => { add(p.vi); add(p.vi.replace(/[.,!?]/g, '')); addWords(p.vi); });
[...vowels, ...consonants, ...clusters].forEach((l) => { add(l.say); add(l.name); add(l.vi); });
tones.forEach((t) => add(t.vi));
toneBases.forEach((b) => toneSet(b).forEach(add));
allSyllables.forEach(add);
rootGroups.forEach((g) => { add(g.root); g.compounds.forEach((c) => { add(c.vi); c.parts.forEach((p) => add(p.vi)); }); });
dialogues.forEach((d) => d.lines.forEach((l) => { add(l.vi); addWords(l.vi); }));
sentences.forEach((s) => { add(sentenceText(s)); s.tokens.forEach(add); });
add('Xin chào, rất vui được gặp bạn.'); // 设置页试听

console.log(JSON.stringify(Object.fromEntries(texts)));
console.error('texts:', texts.size);
