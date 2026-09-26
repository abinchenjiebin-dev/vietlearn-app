import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { Text } from '../../components/Text';
import { QuestionView } from '../../components/quiz';
import { Button, buzz, Empty, ProgressBar } from '../../components/ui';
import { allWords, wordByVi, type Word } from '../../data';
import { getTopic } from '../../data/topics';
import { useProgress } from '../../lib/progress';
import { buildQuiz, mixMeta, Question, QUIZ_LEN, QuizType, quizTypes } from '../../lib/quiz';
import { speakVi } from '../../lib/speech';
import { font, Theme, useStyles } from '../../theme';

export default function Quiz() {
  const { type, topic, source, count } = useLocalSearchParams<{ type: QuizType; topic?: string; source?: string; count?: string }>();
  const meta = type === 'mix' ? mixMeta : (quizTypes.find((q) => q.type === type) ?? quizTypes[0]);
  const size = Number(count) || QUIZ_LEN;
  const { mistakes, recordAnswer, tick } = useProgress();

  const pool = useMemo<Word[]>(() => {
    if (source === 'mistakes')
      return Object.values(mistakes)
        .filter((m) => m.kind === 'word')
        .map((m) => wordByVi.get(m.id))
        .filter((w): w is Word => !!w);
    const t = topic ? getTopic(topic) : undefined;
    return t ? t.words.map((w) => ({ ...w, topicId: t.id })) : allWords;
    // 错题本在答题过程中会变化，题目只在开始时生成
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, topic]);

  const [questions, setQuestions] = useState<Question[]>(() => buildQuiz(meta.type, pool, size));
  const [pos, setPos] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);

  const restart = () => {
    setQuestions(buildQuiz(meta.type, pool, size));
    setPos(0);
    setScore(0);
    setAnswered(null);
  };

  const q = questions[pos];
  const s = useStyles(makeStyles);

  const onAnswer = useCallback(
    (ok: boolean) => {
      if (!q) return;
      buzz(ok);
      setAnswered(ok);
      if (ok) setScore((n) => n + 1);
      if (q.kind === 'tone') {
        tick();
        speakVi(q.syllable);
      } else {
        recordAnswer('word', q.word.vi, ok);
        speakVi(q.word.vi);
      }
    },
    [q, recordAnswer, tick],
  );

  const next = () => {
    setAnswered(null);
    setPos((p) => p + 1);
  };

  const title = <Stack.Screen options={{ title: source === 'mistakes' ? '错题练习' : meta.title }} />;

  if (pool.length < 1 && meta.type !== 'tone')
    return (
      <>
        {title}
        <Empty icon="checkmark-done" title="没有可以练习的词" sub="错题本是空的，去做点别的练习吧～">
          <Button label="返回" kind="soft" onPress={() => router.back()} style={{ marginTop: 20, alignSelf: 'stretch' }} />
        </Empty>
      </>
    );

  if (!q && questions.length > 0)
    return (
      <>
        {title}
        <Result score={score} total={questions.length} tone={meta.type === 'tone'} onAgain={restart} />
      </>
    );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      {title}
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.progressRow}>
          <View style={{ flex: 1 }}>
            <ProgressBar value={(pos + (answered === null ? 0 : 1)) / Math.max(1, questions.length)} color={meta.color} height={5} />
          </View>
          <Text style={s.count}>
            {Math.min(pos + 1, questions.length)}/{questions.length}
            {meta.type === 'mix' ? `  ✓${score}` : ''}
          </Text>
        </View>

        {q && <QuestionView key={pos} q={q} onAnswer={onAnswer} />}

        {answered !== null && (
          <Button
            label={pos + 1 >= questions.length ? '查看成绩' : '下一题'}
            icon="arrow-forward"
            onPress={next}
            style={{ marginTop: 14 }}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Result({ score, total, tone, onAgain }: { score: number; total: number; tone: boolean; onAgain: () => void }) {
  const s = useStyles(makeStyles);
  const ratio = score / total;
  const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : ratio > 0 ? 1 : 0;
  const pct = Math.round(ratio * 100);
  return (
    <View style={s.result}>
      <Text style={s.stars}>{'★'.repeat(stars)}<Text style={s.starsOff}>{'★'.repeat(3 - stars)}</Text></Text>
      <Text style={s.resultNum}>
        {score} / {total}
      </Text>
      <Text style={s.resultPct}>正确率 {pct}%</Text>
      <Text style={s.resultText}>{ratio >= 0.9 ? '太棒了！🎉' : ratio >= 0.6 ? '不错，继续加油！💪' : '多练几次就熟了 🌱'}</Text>
      {!tone && score < total && <Text style={s.resultSub}>答错的词已经放进错题本</Text>}
      <Button label="再来一轮" icon="refresh" onPress={onAgain} style={{ alignSelf: 'stretch', marginTop: 22 }} />
      <Button label="返回" kind="ghost" onPress={() => router.back()} style={{ alignSelf: 'stretch', marginTop: 8 }} />
    </View>
  );
}

const makeStyles = ({ c }: Theme) => ({
  container: { padding: 16, paddingTop: 8, paddingBottom: 40 },
  progressRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, marginBottom: 12 },
  count: { color: c.sub, fontSize: 12, fontWeight: '600' as const },
  result: { flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const, padding: 32 },
  stars: { fontSize: 38, color: c.gold, letterSpacing: 4 },
  starsOff: { color: c.border },
  resultNum: { ...font.hero, fontSize: 34, color: c.text, marginTop: 8 },
  resultPct: { fontSize: 13, color: c.sub, marginTop: 4, fontWeight: '600' as const },
  resultText: { fontSize: 15, fontWeight: '700' as const, color: c.text, marginTop: 8 },
  resultSub: { fontSize: 12, color: c.sub, marginTop: 4 },
});
