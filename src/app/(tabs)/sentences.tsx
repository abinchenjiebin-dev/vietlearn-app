import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, SpeakButton, tap } from '../../components/ui';
import { sentences, sentenceText } from '../../data/sentences';
import { useProgress } from '../../lib/progress';
import { speakVi } from '../../lib/speech';
import { pickRandom, shuffle } from '../../lib/utils';
import { colors, radius } from '../../theme';

type Tile = { id: number; text: string };

const allTokens = Array.from(new Set(sentences.flatMap((s) => s.tokens)));
const norm = (s: string) => s.toLowerCase();
const PROPER = ['Việt Nam', 'Trung Quốc', 'Minh'];
/** 句首词改成小写，避免大写字母泄露答案顺序（专有名词除外） */
const decap = (t: string) => (PROPER.includes(t) ? t : t.charAt(0).toLowerCase() + t.slice(1));
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export default function Sentences() {
  const [order, setOrder] = useState(() => shuffle(sentences.map((_, i) => i)));
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<Tile[]>([]);
  const [result, setResult] = useState<'right' | 'wrong' | null>(null);
  const [showTip, setShowTip] = useState(false);
  const { addSentenceCorrect } = useProgress();

  const s = sentences[order[pos]];

  // 词块 = 正确词语 + 2 个干扰词，打乱顺序
  const tiles = useMemo<Tile[]>(() => {
    const own = s.tokens.map(norm);
    const distractors = pickRandom(
      allTokens.filter((t) => !own.includes(norm(t))),
      2,
    );
    return shuffle([decap(s.tokens[0]), ...s.tokens.slice(1), ...distractors.map(decap)]).map((text, id) => ({ id, text }));
  }, [s]);

  const next = () => {
    setPicked([]);
    setResult(null);
    setShowTip(false);
    if (pos + 1 >= order.length) {
      setOrder(shuffle(sentences.map((_, i) => i)));
      setPos(0);
    } else setPos(pos + 1);
  };

  const check = () => {
    const ok = picked.map((t) => norm(t.text)).join(' ') === s.tokens.map(norm).join(' ');
    setResult(ok ? 'right' : 'wrong');
    if (ok) addSentenceCorrect();
    speakVi(sentenceText(s));
  };

  const pick = (t: Tile) => {
    if (result) return;
    tap();
    speakVi(t.text);
    setPicked((p) => [...p, t]);
  };

  const unpick = (t: Tile) => {
    if (result) return;
    tap();
    setPicked((p) => p.filter((x) => x.id !== t.id));
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={styles.count}>
        第 {pos + 1} / {order.length} 题
      </Text>
      <Card style={{ paddingVertical: 22 }}>
        <Text style={styles.label}>把下面的中文翻译成越南语</Text>
        <Text style={styles.zh}>{s.zh}</Text>
      </Card>

      {/* 答题区 */}
      <View
        style={[
          styles.answer,
          result === 'right' && { borderColor: colors.success, backgroundColor: colors.successSoft },
          result === 'wrong' && { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
        ]}
      >
        {picked.length === 0 ? (
          <Text style={styles.placeholder}>按顺序点击下方词块…</Text>
        ) : (
          picked.map((t, i) => (
            <Pressable key={t.id} onPress={() => unpick(t)} style={[styles.tile, styles.tileInAnswer]}>
              <Text style={styles.tileText}>{i === 0 ? cap(t.text) : t.text}</Text>
            </Pressable>
          ))
        )}
      </View>

      {/* 词块 */}
      <View style={styles.tiles}>
        {tiles.map((t) => {
          const used = picked.some((p) => p.id === t.id);
          return (
            <Pressable
              key={t.id}
              disabled={used || !!result}
              onPress={() => pick(t)}
              style={[styles.tile, used && { opacity: 0.2 }]}
            >
              <Text style={styles.tileText}>{t.text}</Text>
            </Pressable>
          );
        })}
      </View>

      {showTip && s.tip && !result && (
        <Card style={styles.tipCard}>
          <Text style={styles.tipText}>💡 {s.tip}</Text>
        </Card>
      )}

      {result && (
        <Card style={[styles.feedback, { backgroundColor: result === 'right' ? colors.successSoft : colors.dangerSoft }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fbTitle, { color: result === 'right' ? colors.success : colors.danger }]}>
                {result === 'right' ? '完全正确！🎉' : '差一点～正确答案：'}
              </Text>
              <Text style={styles.fbVi}>{sentenceText(s)}</Text>
              {s.tip && <Text style={styles.fbTip}>💡 {s.tip}</Text>}
            </View>
            <View style={{ gap: 8 }}>
              <SpeakButton text={sentenceText(s)} />
              <SpeakButton text={sentenceText(s)} slow color={colors.sub} />
            </View>
          </View>
        </Card>
      )}

      <View style={styles.buttons}>
        {result ? (
          <Button label="下一题" icon="arrow-forward" style={{ flex: 1 }} onPress={next} />
        ) : (
          <>
            <Button
              label="提示"
              kind="ghost"
              icon="bulb-outline"
              style={{ flex: 1 }}
              disabled={!s.tip}
              onPress={() => setShowTip(true)}
            />
            <View style={{ width: 10 }} />
            <Button label="清空" kind="ghost" icon="refresh" style={{ flex: 1 }} disabled={picked.length === 0} onPress={() => setPicked([])} />
            <View style={{ width: 10 }} />
            <Button label="检查" icon="checkmark" style={{ flex: 1.3 }} disabled={picked.length === 0} onPress={check} />
          </>
        )}
      </View>
      {!result && (
        <Pressable onPress={next} style={{ alignSelf: 'center', marginTop: 14 }}>
          <Text style={{ color: colors.sub }}>跳过这题 →</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  count: { color: colors.sub, textAlign: 'right', marginBottom: 8 },
  label: { color: colors.sub, fontSize: 14 },
  zh: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 8 },
  answer: {
    minHeight: 76,
    marginTop: 16,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  placeholder: { color: colors.sub, marginLeft: 6 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 20 },
  tile: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 3,
  },
  tileInAnswer: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  tileText: { fontSize: 18, fontWeight: '600', color: colors.text },
  tipCard: { marginTop: 16, backgroundColor: '#FFF6DA' },
  tipText: { color: '#7A5B00', fontSize: 14 },
  feedback: { marginTop: 20 },
  fbTitle: { fontSize: 15, fontWeight: '700' },
  fbVi: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 4 },
  fbTip: { fontSize: 13, color: colors.sub, marginTop: 6 },
  buttons: { flexDirection: 'row', marginTop: 20 },
});
