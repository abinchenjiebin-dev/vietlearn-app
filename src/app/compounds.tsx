import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '../components/Text';
import { RoundResult } from '../components/quiz';
import { Button, buzz, Card, Chip, Feedback, PressableScale, SpeakButton, tap } from '../components/ui';
import { allCompounds, allSyllables, Compound, rootGroups } from '../data/compounds';
import { useProgress } from '../lib/progress';
import { speakVi } from '../lib/speech';
import { pickRandom, shuffle } from '../lib/utils';
import { font, radius, Theme, useStyles, useTheme } from '../theme';

export default function Compounds() {
  const { mistakes } = useLocalSearchParams<{ mistakes?: string }>();
  const [mode, setMode] = useState<'learn' | 'quiz'>(mistakes ? 'quiz' : 'learn');
  const s = useStyles(makeStyles);
  return (
    <View style={{ flex: 1 }}>
      <View style={s.toolbar}>
        <Chip label="📖 学习词根" active={mode === 'learn'} onPress={() => setMode('learn')} />
        <Chip label="🧩 组词练习" active={mode === 'quiz'} onPress={() => setMode('quiz')} />
      </View>
      {mode === 'learn' ? <Learn /> : <Quiz onlyMistakes={!!mistakes} />}
    </View>
  );
}

function Learn() {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 32 }}>
      <Text style={s.intro}>
        越南语很多词是“词根 + 另一个音节”拼成的，和中文“车 → 火车、汽车”很像。{'\n'}
        注意：越南语的修饰语一般放在<Text style={{ fontWeight: '700', color: c.primary }}>后面</Text>
        ，比如 máy bay = 机器 + 飞 = 飞机。
      </Text>
      {rootGroups.map((g) => (
        <Card key={g.root} style={{ marginBottom: 10 }}>
          <View style={s.rootHead}>
            <Text style={s.root}>{g.root}</Text>
            <Text style={s.rootZh}>{g.zh}</Text>
            <View style={{ flex: 1 }} />
            <SpeakButton text={g.root} size={15} />
          </View>
          {g.compounds.map((cp) => (
            <Pressable key={cp.vi} onPress={() => { tap(); speakVi(cp.vi); }} style={s.compoundRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.compoundVi}>
                  {cp.vi} <Text style={s.compoundZh}>{cp.zh}</Text>
                </Text>
                <Text style={s.formula}>{cp.parts.map((p) => `${p.vi}(${p.zh})`).join(' + ')}</Text>
              </View>
              <SpeakButton text={cp.vi} size={14} />
            </Pressable>
          ))}
        </Card>
      ))}
    </ScrollView>
  );
}

type Tile = { id: number; text: string };

const ROUND = 10;

function makeQuestion(pool: Compound[], prev?: Compound) {
  const choices = pool.length > 1 ? pool.filter((c) => c !== prev) : pool;
  const q = choices[Math.floor(Math.random() * choices.length)];
  const parts = q.parts.map((p) => p.vi);
  const distractors = pickRandom(allSyllables, 4, parts);
  const tiles = shuffle([...parts, ...distractors]).map((text, id) => ({ id, text }));
  return { q, tiles };
}

function Quiz({ onlyMistakes }: { onlyMistakes: boolean }) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const { recordAnswer, mistakes } = useProgress();
  const pool = useMemo(() => {
    if (!onlyMistakes) return allCompounds;
    const ids = Object.values(mistakes).filter((m) => m.kind === 'compound').map((m) => m.id);
    const list = allCompounds.filter((cp) => ids.includes(cp.vi));
    return list.length ? list : allCompounds;
    // 只在进入时取一次错题
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyMistakes]);

  const [question, setQuestion] = useState(() => makeQuestion(pool));
  const [picked, setPicked] = useState<Tile[]>([]);
  const [result, setResult] = useState<'right' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  // 每轮 10 题，做完显示成绩
  const [count, setCount] = useState(1);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const { q, tiles } = question;

  const next = () => {
    if (count >= ROUND) return setFinished(true);
    setCount((n) => n + 1);
    setQuestion(makeQuestion(pool, q));
    setPicked([]);
    setResult(null);
  };

  const restart = () => {
    setCount(1);
    setScore(0);
    setStreak(0);
    setFinished(false);
    setQuestion(makeQuestion(pool, q));
    setPicked([]);
    setResult(null);
  };

  const pickTile = (t: Tile) => {
    if (result) return;
    tap();
    const now = [...picked, t];
    setPicked(now);
    if (now.length < q.parts.length) {
      speakVi(t.text);
      return;
    }
    // 音节放满后自动判断
    const ok = now.map((x) => x.text).join(' ') === q.vi;
    setResult(ok ? 'right' : 'wrong');
    setStreak((n) => (ok ? n + 1 : 0));
    if (ok) setScore((n) => n + 1);
    buzz(ok);
    recordAnswer('compound', q.vi, ok);
    speakVi(q.vi);
  };

  if (finished) return <RoundResult score={score} total={ROUND} note="答错的词会放进错题本" onAgain={restart} />;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 40 }}>
      <Text style={s.streak}>
        {onlyMistakes ? '📕 错题练习 · ' : ''}第 {count}/{ROUND} 题 · 🔥 连对 {streak}
      </Text>
      <Card style={{ alignItems: 'center', paddingVertical: 20 }}>
        <Text style={s.qLabel}>用音节拼出这个词</Text>
        <Text style={s.qZh}>{q.zh}</Text>
        <View style={s.slots}>
          {q.parts.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => !result && setPicked((p) => p.slice(0, i))}
              style={[
                s.slot,
                picked[i] && s.slotFilled,
                result === 'right' && { borderColor: c.success, backgroundColor: c.successSoft },
                result === 'wrong' && { borderColor: c.danger, backgroundColor: c.dangerSoft },
              ]}
            >
              <Text style={s.slotText}>{picked[i]?.text ?? ''}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <View style={s.tiles}>
        {tiles.map((t) => {
          const used = picked.some((p) => p.id === t.id);
          return (
            <PressableScale key={t.id} disabled={used || !!result} onPress={() => pickTile(t)} style={s.tile} scaleTo={0.9}>
              <Text style={s.tileText}>{t.text}</Text>
            </PressableScale>
          );
        })}
      </View>

      {result && (
        <Feedback ok={result === 'right'} title={result === 'right' ? '答对了！🎉' : '再想想，正确答案：'}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={s.fbVi}>{q.vi}</Text>
              <Text style={s.formula}>
                {q.parts.map((p) => `${p.vi}(${p.zh})`).join(' + ')} = {q.zh}
              </Text>
            </View>
            <SpeakButton text={q.vi} />
          </View>
        </Feedback>
      )}

      <View style={{ flexDirection: 'row', marginTop: 14, gap: 8 }}>
        <Button label="重选" kind="ghost" icon="refresh" style={{ flex: 1 }} disabled={!!result || picked.length === 0} onPress={() => setPicked([])} />
        <Button label={count >= ROUND && result ? '查看成绩' : result ? '下一题' : '跳过'} icon="arrow-forward" style={{ flex: 1 }} onPress={next} />
      </View>
    </ScrollView>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  toolbar: { flexDirection: 'row' as const, paddingHorizontal: 16, paddingVertical: 10 },
  intro: { fontSize: 12, color: c.sub, lineHeight: 18, marginBottom: 10 },
  rootHead: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: 6 },
  root: { fontSize: 22, fontWeight: '800' as const, color: c.primary, marginRight: 8 },
  rootZh: { fontSize: 13, color: c.sub },
  compoundRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  compoundVi: { fontSize: 15, fontWeight: '600' as const, color: c.text },
  compoundZh: { fontSize: 13, fontWeight: '400' as const, color: c.sub },
  formula: { fontSize: 11, color: c.sub, marginTop: 2 },
  streak: { textAlign: 'right' as const, color: c.sub, fontSize: 12, marginBottom: 6 },
  qLabel: { color: c.sub, fontSize: 12 },
  qZh: { ...font.hero, fontSize: 26, color: c.text, marginVertical: 10 },
  slots: { flexDirection: 'row' as const, gap: 8 },
  slot: {
    minWidth: 76,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderStyle: 'dashed' as const,
    borderColor: c.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 12,
  },
  slotFilled: { borderStyle: 'solid' as const, borderColor: c.primary, backgroundColor: c.primarySoft },
  slotText: { fontSize: 18, fontWeight: '700' as const, color: c.text },
  tiles: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, justifyContent: 'center' as const, gap: 8, marginTop: 16 },
  tile: {
    ...shadow,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.sm,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    borderBottomWidth: 3,
  },
  tileText: { fontSize: 17, fontWeight: '600' as const, color: c.text },
  fbVi: { fontSize: 19, fontWeight: '800' as const, color: c.text },
});
