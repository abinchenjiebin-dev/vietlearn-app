import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams, type Href } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrderQuestion, PickQuestion, TeachCard, TeachTone } from '../../components/levelSteps';
import { QuestionView } from '../../components/quiz';
import { Text } from '../../components/Text';
import { Button, buzz, Empty, ProgressBar, tap } from '../../components/ui';
import { allLevels, getLevel, getUnit } from '../../data/levels';
import { buildLevel, HEARTS, isGraded, starsFor, stepWord, type Step } from '../../lib/levels';
import { useProgress } from '../../lib/progress';
import { usePreload } from '../../lib/usePreload';
import { font, radius, Theme, useStyles, useTheme } from '../../theme';

/** 闯关：一步步做完，3 颗心用完就失败 */
export default function LevelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const level = getLevel(id);
  const p = useProgress();
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  const [steps, setSteps] = useState<Step[]>(() => (level ? buildLevel(level) : []));
  usePreload(steps);
  const [pos, setPos] = useState(0);
  const [hearts, setHearts] = useState(HEARTS);
  const [mistakes, setMistakes] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [earned, setEarned] = useState(0);

  if (!level) return <Empty icon="map-outline" title="找不到这一关" />;
  const unit = getUnit(level.unitId)!;
  const step = steps[pos];
  const next = allLevels[allLevels.findIndex((l) => l.id === level.id) + 1];

  const restart = () => {
    setSteps(buildLevel(level));
    setPos(0);
    setHearts(HEARTS);
    setMistakes(0);
    setAnswered(null);
    setStatus('playing');
  };

  const advance = () => {
    setAnswered(null);
    if (hearts <= 0) return setStatus('lost');
    if (pos + 1 >= steps.length) {
      const stars = starsFor(mistakes);
      p.finishLevel(level.id, stars);
      setEarned(10 + stars * 5);
      return setStatus('won');
    }
    setPos(pos + 1);
  };

  const onAnswer = (ok: boolean) => {
    buzz(ok);
    setAnswered(ok);
    if (!ok) {
      setHearts((h) => h - 1);
      setMistakes((m) => m + 1);
    }
    const w = stepWord(step);
    if (w) p.recordAnswer('word', w, ok);
    else p.tick();
  };

  const graded = steps.filter(isGraded).length;
  const doneGraded = steps.slice(0, pos + (answered === null ? 0 : 1)).filter(isGraded).length;

  if (status !== 'playing') {
    const won = status === 'won';
    const stars = starsFor(mistakes);
    return (
      <View style={[s.result, { paddingTop: insets.top + 40 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={s.resultEmoji}>{won ? (level.kind === 'boss' || level.kind === 'toneBoss' ? '👑' : '🎉') : '💔'}</Text>
        <Text style={s.resultTitle}>{won ? '闯关成功！' : '生命用完了'}</Text>
        <Text style={s.resultSub}>
          {unit.emoji} 第 {unit.n} 单元 · {level.title}
        </Text>
        {won ? (
          <>
            <Text style={s.stars}>
              {'★'.repeat(stars)}
              <Text style={s.starsOff}>{'★'.repeat(3 - stars)}</Text>
            </Text>
            <Text style={s.xp}>+{earned} 经验值</Text>
            <Text style={s.resultSub}>{mistakes === 0 ? '一题没错，太厉害了！' : `错了 ${mistakes} 题，再闯一次可以拿更多星`}</Text>
          </>
        ) : (
          <Text style={s.resultSub}>别灰心，答错的词已经放进错题本，再试一次吧！</Text>
        )}
        <View style={s.resultBtns}>
          {won && next && (
            <Button
              label={`下一关：${next.title}`}
              icon="arrow-forward"
              onPress={() => router.replace(`/level/${next.id}` as Href)}
              style={{ alignSelf: 'stretch' }}
            />
          )}
          {!won && <Button label="再试一次" icon="refresh" onPress={restart} style={{ alignSelf: 'stretch' }} />}
          {won && <Button label="再闯一次" kind="ghost" icon="refresh" onPress={restart} style={{ alignSelf: 'stretch' }} />}
          <Button label="回到地图" kind="ghost" icon="map-outline" onPress={() => router.back()} style={{ alignSelf: 'stretch' }} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* 顶部：退出、进度、生命 */}
      <View style={[s.top, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => { tap(); router.back(); }} hitSlop={10} accessibilityLabel="退出">
          <Ionicons name="close" size={24} color={c.sub} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar value={graded ? doneGraded / graded : pos / steps.length} height={8} />
        </View>
        <View style={s.hearts}>
          {Array.from({ length: HEARTS }, (_, i) => (
            <Ionicons key={i} name={i < hearts ? 'heart' : 'heart-outline'} size={18} color={i < hearts ? c.danger : c.faint} />
          ))}
        </View>
      </View>
      <Text style={s.levelName}>
        {unit.emoji} 第 {unit.n} 单元 · {level.title}
      </Text>

      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        {step?.kind === 'teach' && <TeachCard key={pos} word={step.word} onNext={advance} />}
        {step?.kind === 'teachTone' && <TeachTone key={pos} index={step.index} onNext={advance} />}
        {step?.kind === 'order' && <OrderQuestion key={pos} step={step} onAnswer={onAnswer} />}
        {step?.kind === 'pick' && <PickQuestion key={pos} step={step} onAnswer={onAnswer} />}
        {step && (step.kind === 'choice' || step.kind === 'spell' || step.kind === 'tone') && (
          <QuestionView key={pos} q={step} onAnswer={onAnswer} />
        )}

        {answered !== null && (
          <Button
            label={hearts <= 0 ? '查看结果' : pos + 1 >= steps.length ? '完成' : '继续'}
            icon="arrow-forward"
            onPress={advance}
            style={{ marginTop: 16 }}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = ({ c }: Theme) => ({
  top: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12, paddingHorizontal: 16 },
  hearts: { flexDirection: 'row' as const, gap: 2 },
  levelName: { fontSize: 12, color: c.sub, textAlign: 'center' as const, marginTop: 8 },
  container: { padding: 16, paddingTop: 10, paddingBottom: 40 },
  result: { flex: 1, alignItems: 'center' as const, padding: 28 },
  resultEmoji: { fontSize: 64 },
  resultTitle: { ...font.hero, color: c.text, marginTop: 10 },
  resultSub: { fontSize: 13, color: c.sub, marginTop: 6, textAlign: 'center' as const },
  stars: { fontSize: 44, color: c.gold, letterSpacing: 6, marginTop: 14 },
  starsOff: { color: c.border },
  xp: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: c.primary,
    backgroundColor: c.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 10,
    overflow: 'hidden' as const,
  },
  resultBtns: { alignSelf: 'stretch' as const, gap: 8, marginTop: 30 },
});
