import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams, type Href } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Pressable, ScrollView, View } from 'react-native';

import { Text } from '../../components/Text';
import { Button, Chip, Empty, native, PressableScale, ProgressBar, SpeakButton, tap } from '../../components/ui';
import { examplesFor, wordByVi, type Word } from '../../data';
import { getTopic, topics } from '../../data/topics';
import { wordHref } from '../../lib/links';
import { useProgress } from '../../lib/progress';
import { usePreload } from '../../lib/usePreload';
import { speakVi } from '../../lib/speech';
import { shuffle } from '../../lib/utils';
import { radius, Theme, useStyles, useTheme } from '../../theme';

type Mode = 'vi2zh' | 'zh2vi';


/** 某个主题的单词卡片 */
export default function Cards() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isKnown, setKnown, autoPlay, setLastVisit, favWords } = useProgress();
  const { c } = useTheme();
  // id = fav 时是“收藏的单词”
  const isFav = id === 'fav';
  const topic = isFav
    ? {
        id: 'fav',
        emoji: '⭐',
        zh: '收藏的单词',
        color: c.gold,
        words: favWords.map((v) => wordByVi.get(v)).filter((w): w is Word => !!w),
      }
    : (getTopic(id) ?? topics[0]);
  const [mode, setMode] = useState<Mode>('vi2zh');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [cards, setCards] = useState(topic.words);
  usePreload(cards);
  const s = useStyles(makeStyles);
  const turn = useState(() => new Animated.Value(0))[0];

  const card = cards[Math.min(index, cards.length - 1)] as Word | undefined;
  const knownCount = topic.words.filter((w) => isKnown(w.vi)).length;
  const examples = card ? examplesFor(card.vi, 2) : [];

  // 越南语朝上时自动朗读（设置里可以关）
  useEffect(() => {
    if (autoPlay && mode === 'vi2zh' && card) speakVi(card.vi);
  }, [card, mode, autoPlay]);

  // 记住上次学到这里（首页“继续学习”）
  useEffect(() => {
    if (!isFav) setLastVisit('cards', topic.id);
  }, [isFav, setLastVisit, topic.id]);

  const reset = () => {
    setFlipped(false);
    turn.setValue(0);
  };

  const reshuffle = () => {
    setCards(shuffle(topic.words));
    setIndex(0);
    reset();
  };

  const go = (delta: number) => {
    reset();
    setIndex((i) => (i + delta + cards.length) % cards.length);
  };

  const flip = () => {
    tap();
    const next = !flipped;
    setFlipped(next);
    Animated.spring(turn, { toValue: next ? 1 : 0, useNativeDriver: native, friction: 8, tension: 60 }).start();
    if (next && mode === 'zh2vi' && card) speakVi(card.vi);
  };

  if (!card)
    return (
      <>
        <Stack.Screen options={{ title: '⭐ 收藏的单词' }} />
        <Empty icon="star-outline" title="还没有收藏单词" sub="在单词详情页点右上角的 ☆ 就能收藏" />
      </>
    );

  const front = mode === 'vi2zh' ? card.vi : card.zh;
  const back = mode === 'vi2zh' ? card.zh : card.vi;
  const known = isKnown(card.vi);
  const rotFront = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const rotBack = turn.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Stack.Screen options={{ title: `${topic.emoji} ${topic.zh}` }} />

      <View style={s.toolbar}>
        <Chip label="越 → 中" active={mode === 'vi2zh'} onPress={() => { setMode('vi2zh'); reset(); }} />
        <Chip label="中 → 越" active={mode === 'zh2vi'} onPress={() => { setMode('zh2vi'); reset(); }} />
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => { tap(); reshuffle(); }} hitSlop={8} style={s.shuffle} accessibilityLabel="打乱顺序">
          <Ionicons name="shuffle" size={16} color={c.sub} />
          <Text style={s.shuffleText}>打乱</Text>
        </Pressable>
      </View>

      <View style={s.progressWrap}>
        <Text style={s.progressText}>
          第 {index + 1} / {cards.length} 个
        </Text>
        <Text style={s.progressText}>已掌握 {knownCount}/{topic.words.length}</Text>
      </View>
      <ProgressBar value={knownCount / topic.words.length} color={topic.color} height={4} />

      <Pressable onPress={flip} style={s.cardWrap} accessibilityLabel="翻面">
        <Animated.View pointerEvents={flipped ? 'none' : 'box-none'} style={[s.card, { transform: [{ perspective: 1000 }, { rotateY: rotFront }] }]}>
          <View style={[s.stripe, { backgroundColor: topic.color }]} />
          {known && <Text style={s.badge}>✓ 已掌握</Text>}
          <Pressable onPress={() => router.push(wordHref(card.vi))} hitSlop={8} style={s.detail} accessibilityLabel="单词详情">
            <Ionicons name="information-circle-outline" size={15} color={c.sub} />
            <Text style={s.detailText}>详情</Text>
          </Pressable>
          {mode === 'zh2vi' && card.emoji ? <Text style={s.emoji}>{card.emoji}</Text> : null}
          <Text style={[s.front, mode === 'zh2vi' && s.frontZh]}>{front}</Text>
          <Text style={s.hint}>点卡片翻面</Text>
          {mode === 'vi2zh' && (
            <View style={s.speakRow}>
              <SpeakButton text={card.vi} />
              <SpeakButton text={card.vi} slow />
            </View>
          )}
        </Animated.View>
        <Animated.View pointerEvents={flipped ? 'box-none' : 'none'} style={[s.card, { transform: [{ perspective: 1000 }, { rotateY: rotBack }] }]}>
          <View style={[s.stripe, { backgroundColor: topic.color }]} />
          <Pressable onPress={() => router.push(wordHref(card.vi))} hitSlop={8} style={s.detail} accessibilityLabel="单词详情">
            <Ionicons name="information-circle-outline" size={15} color={c.sub} />
            <Text style={s.detailText}>详情</Text>
          </Pressable>
          {card.emoji ? <Text style={s.emoji}>{card.emoji}</Text> : null}
          <Text style={s.small}>{front}</Text>
          <Text style={[s.back, mode === 'zh2vi' && s.backVi]}>{back}</Text>
          {card.note && <Text style={s.note}>💡 {card.note}</Text>}
          <View style={s.speakRow}>
            <SpeakButton text={card.vi} />
            <SpeakButton text={card.vi} slow />
          </View>
        </Animated.View>
      </Pressable>

      <View style={s.row}>
        <PressableScale onPress={() => { tap(); go(-1); }} style={s.nav} accessibilityLabel="上一个">
          <Ionicons name="chevron-back" size={18} color={c.text} />
        </PressableScale>
        <Button label="还不会" kind="danger" icon="close" style={{ flex: 1 }} onPress={() => { setKnown(card.vi, false); go(1); }} />
        <Button label="记住了" kind="success" icon="checkmark" style={{ flex: 1 }} onPress={() => { setKnown(card.vi, true); go(1); }} />
        <PressableScale onPress={() => { tap(); go(1); }} style={s.nav} accessibilityLabel="下一个">
          <Ionicons name="chevron-forward" size={18} color={c.text} />
        </PressableScale>
      </View>

      {examples.length > 0 && (
        <View style={s.examples}>
          <Text style={s.exTitle}>例句</Text>
          {examples.map((e) => (
            <Pressable key={e.vi} onPress={() => { tap(); speakVi(e.vi); }} style={s.exRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.exVi}>{e.vi}</Text>
                <Text style={s.exZh}>{e.zh}</Text>
              </View>
              <Ionicons name="volume-medium-outline" size={16} color={c.faint} />
            </Pressable>
          ))}
        </View>
      )}

      {!isFav && (
      <PressableScale onPress={() => router.push(`/quiz/meaning?topic=${topic.id}` as Href)} style={s.quiz} scaleTo={0.98}>
        <Ionicons name="school-outline" size={18} color={c.primary} />
        <Text style={s.quizText}>测验这个主题（10 题）</Text>
        <Ionicons name="chevron-forward" size={16} color={c.faint} />
      </PressableScale>
      )}
      <Text style={s.tip}>“记住了 / 还不会”会自动加入智能复习，按遗忘规律安排复习</Text>
    </ScrollView>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  container: { padding: 16, paddingTop: 6, paddingBottom: 32 },
  toolbar: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: 12 },
  shuffle: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 3, padding: 4 },
  shuffleText: { fontSize: 13, color: c.sub, fontWeight: '600' as const },
  progressWrap: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginBottom: 6 },
  progressText: { color: c.sub, fontSize: 12 },
  cardWrap: { marginTop: 14, height: 285 },
  card: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: c.card,
    borderRadius: radius.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 20,
    overflow: 'hidden' as const,
    backfaceVisibility: 'hidden' as const,
    ...shadow,
  },
  stripe: { position: 'absolute' as const, top: 0, left: 0, right: 0, height: 4 },
  detail: { position: 'absolute' as const, top: 12, left: 12, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 3 },
  detailText: { fontSize: 11, color: c.sub },
  badge: { position: 'absolute' as const, top: 14, right: 14, color: c.success, fontSize: 11, fontWeight: '700' as const },
  emoji: { fontSize: 52, lineHeight: 64, marginBottom: 4 },
  front: { fontSize: 34, fontWeight: '800' as const, color: c.text, textAlign: 'center' as const, letterSpacing: -0.5 },
  frontZh: { fontSize: 26 },
  hint: { color: c.faint, marginTop: 10, fontSize: 12 },
  small: { fontSize: 14, color: c.sub, marginBottom: 8 },
  back: { fontSize: 22, fontWeight: '700' as const, color: c.text, textAlign: 'center' as const },
  backVi: { fontSize: 30, fontWeight: '800' as const, color: c.primary },
  note: { fontSize: 12, color: c.goldText, marginTop: 8, textAlign: 'center' as const },
  speakRow: { flexDirection: 'row' as const, gap: 10, marginTop: 16 },
  row: { flexDirection: 'row' as const, gap: 8, marginTop: 14 },
  nav: {
    width: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: radius.md,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
  },
  examples: { backgroundColor: c.card, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8, marginTop: 12, ...shadow },
  exTitle: { fontSize: 11, color: c.faint, fontWeight: '600' as const, marginBottom: 2 },
  exRow: { flexDirection: 'row' as const, alignItems: 'center' as const, paddingVertical: 6 },
  exVi: { fontSize: 14, fontWeight: '600' as const, color: c.text },
  exZh: { fontSize: 12, color: c.sub, marginTop: 1 },
  quiz: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: c.card,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 12,
    ...shadow,
  },
  quizText: { flex: 1, fontSize: 14, fontWeight: '600' as const, color: c.text },
  tip: { color: c.faint, fontSize: 11, textAlign: 'center' as const, marginTop: 12, lineHeight: 16 },
});
