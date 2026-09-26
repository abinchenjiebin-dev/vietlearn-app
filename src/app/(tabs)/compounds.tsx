import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Chip, SpeakButton, tap } from '../../components/ui';
import { allCompounds, allSyllables, Compound, rootGroups } from '../../data/compounds';
import { useProgress } from '../../lib/progress';
import { speakVi } from '../../lib/speech';
import { pickRandom, shuffle } from '../../lib/utils';
import { colors, radius } from '../../theme';

export default function Compounds() {
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toolbar}>
        <Chip label="📖 学习词根" active={mode === 'learn'} onPress={() => setMode('learn')} />
        <Chip label="🧩 组词练习" active={mode === 'quiz'} onPress={() => setMode('quiz')} />
      </View>
      {mode === 'learn' ? <Learn /> : <Quiz />}
    </View>
  );
}

function Learn() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 32 }}>
      <Text style={styles.intro}>
        越南语很多词是“词根 + 另一个音节”拼成的，和中文“车 → 火车、汽车”很像。{'\n'}
        注意：越南语的修饰语一般放在<Text style={{ fontWeight: '700', color: colors.primary }}>后面</Text>
        ，比如 máy bay = 机器 + 飞 = 飞机。
      </Text>
      {rootGroups.map((g) => (
        <Card key={g.root} style={{ marginBottom: 14 }}>
          <View style={styles.rootHead}>
            <Text style={styles.root}>{g.root}</Text>
            <Text style={styles.rootZh}>{g.zh}</Text>
            <View style={{ flex: 1 }} />
            <SpeakButton text={g.root} size={18} />
          </View>
          {g.compounds.map((c) => (
            <Pressable
              key={c.vi}
              onPress={() => {
                tap();
                speakVi(c.vi);
              }}
              style={styles.compoundRow}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.compoundVi}>
                  {c.vi} <Text style={styles.compoundZh}>{c.zh}</Text>
                </Text>
                <Text style={styles.formula}>{c.parts.map((p) => `${p.vi}(${p.zh})`).join(' + ')}</Text>
              </View>
              <SpeakButton text={c.vi} size={16} />
            </Pressable>
          ))}
        </Card>
      ))}
    </ScrollView>
  );
}

type Tile = { id: number; text: string };

function makeQuestion(prev?: Compound) {
  const pool = allCompounds.filter((c) => c !== prev);
  const q = pool[Math.floor(Math.random() * pool.length)];
  const parts = q.parts.map((p) => p.vi);
  const distractors = pickRandom(allSyllables, 4, parts);
  const tiles = shuffle([...parts, ...distractors]).map((text, id) => ({ id, text }));
  return { q, tiles };
}

function Quiz() {
  const [{ q, tiles }, setQuestion] = useState(() => makeQuestion());
  const [picked, setPicked] = useState<Tile[]>([]);
  const [result, setResult] = useState<'right' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const { addCompoundCorrect } = useProgress();

  const next = useCallback(() => {
    setQuestion(makeQuestion(q));
    setPicked([]);
    setResult(null);
  }, [q]);

  useEffect(() => {
    if (picked.length === q.parts.length && result === null) {
      const answer = picked.map((t) => t.text).join(' ');
      if (answer === q.vi) {
        setResult('right');
        setStreak((s) => s + 1);
        addCompoundCorrect();
      } else {
        setResult('wrong');
        setStreak(0);
      }
      speakVi(q.vi);
    }
  }, [picked, q, result, addCompoundCorrect]);

  const pickTile = (t: Tile) => {
    if (result) return;
    tap();
    speakVi(t.text);
    setPicked((p) => [...p, t]);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4 }}>
      <Text style={styles.streak}>🔥 连对 {streak}</Text>
      <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
        <Text style={styles.qLabel}>用音节拼出这个词</Text>
        <Text style={styles.qZh}>{q.zh}</Text>
        <View style={styles.slots}>
          {q.parts.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => !result && setPicked((p) => p.slice(0, i))}
              style={[
                styles.slot,
                picked[i] && styles.slotFilled,
                result === 'right' && { borderColor: colors.success, backgroundColor: colors.successSoft },
                result === 'wrong' && { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
              ]}
            >
              <Text style={styles.slotText}>{picked[i]?.text ?? ''}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <View style={styles.tiles}>
        {tiles.map((t) => {
          const used = picked.some((p) => p.id === t.id);
          return (
            <Pressable
              key={t.id}
              disabled={used || !!result}
              onPress={() => pickTile(t)}
              style={[styles.tile, used && { opacity: 0.25 }]}
            >
              <Text style={styles.tileText}>{t.text}</Text>
            </Pressable>
          );
        })}
      </View>

      {result && (
        <Card style={[styles.feedback, { backgroundColor: result === 'right' ? colors.successSoft : colors.dangerSoft }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fbTitle, { color: result === 'right' ? colors.success : colors.danger }]}>
                {result === 'right' ? '答对了！🎉' : '再想想 🤔 正确答案：'}
              </Text>
              <Text style={styles.fbVi}>{q.vi}</Text>
              <Text style={styles.formula}>{q.parts.map((p) => `${p.vi}(${p.zh})`).join(' + ')} = {q.zh}</Text>
            </View>
            <SpeakButton text={q.vi} />
          </View>
        </Card>
      )}

      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <Button label="重选" kind="ghost" icon="refresh" style={{ flex: 1 }} disabled={!!result || picked.length === 0} onPress={() => setPicked([])} />
        <View style={{ width: 12 }} />
        <Button label={result ? '下一题' : '跳过'} icon="arrow-forward" style={{ flex: 1 }} onPress={next} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12 },
  intro: { fontSize: 14, color: colors.sub, lineHeight: 21, marginBottom: 14 },
  rootHead: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  root: { fontSize: 30, fontWeight: '800', color: colors.primary, marginRight: 10 },
  rootZh: { fontSize: 15, color: colors.sub },
  compoundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  compoundVi: { fontSize: 18, fontWeight: '700', color: colors.text },
  compoundZh: { fontSize: 15, fontWeight: '400', color: colors.sub },
  formula: { fontSize: 13, color: colors.sub, marginTop: 3 },
  streak: { textAlign: 'right', color: colors.sub, marginBottom: 8 },
  qLabel: { color: colors.sub, fontSize: 14 },
  qZh: { fontSize: 34, fontWeight: '800', color: colors.text, marginVertical: 14 },
  slots: { flexDirection: 'row', gap: 10 },
  slot: {
    minWidth: 90,
    height: 52,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  slotFilled: { borderStyle: 'solid', borderColor: colors.primary, backgroundColor: colors.primarySoft },
  slotText: { fontSize: 22, fontWeight: '700', color: colors.text },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 20 },
  tile: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 3,
  },
  tileText: { fontSize: 20, fontWeight: '600', color: colors.text },
  feedback: { marginTop: 20 },
  fbTitle: { fontSize: 15, fontWeight: '700' },
  fbVi: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 4 },
});
