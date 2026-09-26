import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Chip, SpeakButton, TopicPicker, tap } from '../../components/ui';
import { getTopic, topics } from '../../data/topics';
import { useProgress } from '../../lib/progress';
import { speakVi } from '../../lib/speech';
import { shuffle } from '../../lib/utils';
import { colors, radius, shadow } from '../../theme';

type Mode = 'vi2zh' | 'zh2vi';

export default function Vocab() {
  const [topicId, setTopicId] = useState(topics[0].id);
  const [mode, setMode] = useState<Mode>('vi2zh');
  const [order, setOrder] = useState(0); // 变化时重新洗牌
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const { isKnown, setKnown } = useProgress();

  const topic = getTopic(topicId)!;
  const cards = useMemo(
    () => (order === 0 ? topic.words : shuffle(topic.words)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [topic, order],
  );
  const card = cards[Math.min(index, cards.length - 1)];
  const knownCount = topic.words.filter((w) => isKnown(w.vi)).length;

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setOrder(0);
  }, [topicId]);

  // 越南语朝上时自动朗读
  useEffect(() => {
    if (mode === 'vi2zh' && card) speakVi(card.vi);
  }, [card, mode]);

  const go = (delta: number) => {
    setFlipped(false);
    setIndex((i) => (i + delta + cards.length) % cards.length);
  };

  const flip = () => {
    tap();
    const next = !flipped;
    setFlipped(next);
    if (next && mode === 'zh2vi') speakVi(card.vi);
  };

  const front = mode === 'vi2zh' ? card.vi : card.zh;
  const back = mode === 'vi2zh' ? card.zh : card.vi;
  const known = isKnown(card.vi);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
      <TopicPicker value={topicId} onChange={setTopicId} />

      <View style={styles.toolbar}>
        <Chip label="越 → 中" active={mode === 'vi2zh'} onPress={() => { setMode('vi2zh'); setFlipped(false); }} />
        <Chip label="中 → 越" active={mode === 'zh2vi'} onPress={() => { setMode('zh2vi'); setFlipped(false); }} />
        <Chip label="🔀 打乱" onPress={() => { setOrder((o) => o + 1); setIndex(0); setFlipped(false); }} />
      </View>

      <View style={styles.progressWrap}>
        <Text style={styles.progressText}>
          {index + 1} / {cards.length}
        </Text>
        <Text style={styles.progressText}>已掌握 {knownCount}/{topic.words.length}</Text>
      </View>
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${(knownCount / topic.words.length) * 100}%`, backgroundColor: topic.color }]} />
      </View>

      <Pressable onPress={flip} style={[styles.card, { borderTopColor: topic.color }]}>
        {known && <Text style={styles.badge}>✓ 已掌握</Text>}
        <Text style={[styles.front, mode === 'zh2vi' && styles.frontZh]}>{front}</Text>
        {flipped ? (
          <>
            <View style={styles.sep} />
            <Text style={[styles.back, mode === 'zh2vi' && styles.backVi]}>{back}</Text>
            {card.note && <Text style={styles.note}>💡 {card.note}</Text>}
          </>
        ) : (
          <Text style={styles.hint}>点击卡片翻面</Text>
        )}
        {(mode === 'vi2zh' || flipped) && (
          <View style={styles.speakRow}>
            <SpeakButton text={card.vi} />
            <SpeakButton text={card.vi} slow color={colors.sub} />
          </View>
        )}
      </Pressable>

      <View style={styles.row}>
        <Button label="还不会" kind="danger" icon="close" style={{ flex: 1 }} onPress={() => { setKnown(card.vi, false); go(1); }} />
        <View style={{ width: 12 }} />
        <Button label="记住了" kind="success" icon="checkmark" style={{ flex: 1 }} onPress={() => { setKnown(card.vi, true); go(1); }} />
      </View>
      <View style={styles.row}>
        <Button label="上一个" kind="ghost" icon="chevron-back" style={{ flex: 1 }} onPress={() => go(-1)} />
        <View style={{ width: 12 }} />
        <Button label="下一个" kind="ghost" icon="chevron-forward" style={{ flex: 1 }} onPress={() => go(1)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12 },
  progressWrap: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  progressText: { color: colors.sub, fontSize: 13 },
  bar: { height: 6, backgroundColor: colors.border, borderRadius: 3, marginHorizontal: 16, marginTop: 6, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  card: {
    margin: 16,
    minHeight: 260,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderTopWidth: 6,
    ...shadow,
  },
  badge: { position: 'absolute', top: 12, right: 14, color: colors.success, fontSize: 13, fontWeight: '600' },
  front: { fontSize: 40, fontWeight: '800', color: colors.text, textAlign: 'center' },
  frontZh: { fontSize: 32 },
  hint: { color: colors.sub, marginTop: 16, fontSize: 14 },
  sep: { height: 1, alignSelf: 'stretch', backgroundColor: colors.border, marginVertical: 18 },
  back: { fontSize: 24, color: colors.sub, textAlign: 'center' },
  backVi: { fontSize: 34, fontWeight: '800', color: colors.primary },
  note: { fontSize: 13, color: '#8A6D00', marginTop: 10 },
  speakRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  row: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12 },
});
