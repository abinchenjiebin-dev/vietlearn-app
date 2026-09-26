import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { Text } from '../components/Text';
import { QuestionView } from '../components/quiz';
import { Button, buzz, Card, Empty, ProgressBar, SpeakButton, tap } from '../components/ui';
import { allWords, wordByVi, type Word } from '../data';
import { getTopic } from '../data/topics';
import { useProgress } from '../lib/progress';
import { makeAny, type Question } from '../lib/quiz';
import { speakVi } from '../lib/speech';
import { NEW_PER_DAY, previewInterval } from '../lib/srs';
import { font, radius, Theme, useStyles, useTheme } from '../theme';

/** learn = 新词先看一遍；test = 出题考 */
type Item = { word: Word; stage: 'learn' | 'test'; q?: Question; retry?: boolean };

const test = (word: Word, retry = false): Item => ({ word, stage: 'test', q: makeAny(word), retry });

export default function Review() {
  const p = useProgress();
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const [extra, setExtra] = useState<Item[]>([]);
  const [done, setDone] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [right, setRight] = useState(0);

  // 进入页面时生成今天的队列：到期的词直接出题，新词先学后考（进度读取完后只生成一次）
  const base = useMemo<Item[] | null>(() => {
    if (!p.loaded) return null;
    const due = Object.entries(p.srs)
      .filter(([, card]) => card.due <= p.today)
      .sort((a, b) => (a[1].due < b[1].due ? -1 : 1))
      .map(([vi]) => wordByVi.get(vi))
      .filter((w): w is Word => !!w)
      .map((word) => test(word));
    const fresh = allWords
      .filter((w) => !p.srs[w.vi])
      .slice(0, p.newLeftToday(NEW_PER_DAY))
      .map((word): Item => ({ word, stage: 'learn' }));
    return [...fresh, ...due];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.loaded]);

  const queue = base && [...base, ...extra];
  const total = queue?.length ?? 0;
  const item = queue?.[done];

  useEffect(() => {
    if (p.autoPlay && item?.stage === 'learn') speakVi(item.word.vi);
  }, [item, p.autoPlay]);

  if (!queue) return null;

  if (!item)
    return (
      <Empty
        icon="trophy"
        title={total ? '今天复习完成！🎉' : '今天没有要复习的词'}
        sub={
          total
            ? `共 ${total} 步，答对 ${right} 题。明天会按遗忘规律安排新的复习，记得回来哦～`
            : '新词每天最多 10 个，到期的词会自动出现在这里。想多练可以去“每日一刷”。'
        }
      >
        <Button label="返回" kind="soft" onPress={() => router.back()} style={{ marginTop: 24, alignSelf: 'stretch' }} />
      </Empty>
    );

  const advance = () => {
    setAnswered(null);
    setDone((d) => d + 1);
  };

  // 新词：看完后放到本轮后面考一次
  const learned = (easy: boolean) => {
    tap();
    if (easy) p.review(item.word.vi, 'easy');
    else setExtra([...extra, test(item.word)]);
    advance();
  };

  const onAnswer = (ok: boolean) => {
    buzz(ok);
    setAnswered(ok);
    if (ok) setRight((n) => n + 1);
    speakVi(item.word.vi);
  };

  // 答完后按结果安排下次复习；答错的词本轮最后再考一次
  const finish = (easy = false) => {
    tap();
    p.review(item.word.vi, answered ? (easy ? 'easy' : item.retry ? 'hard' : 'good') : 'again');
    if (!answered && !item.retry) setExtra([...extra, test(item.word, true)]);
    advance();
  };

  const card = p.srs[item.word.vi];
  const topic = getTopic(item.word.topicId);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.progressRow}>
          <View style={{ flex: 1 }}>
            <ProgressBar value={done / Math.max(1, total)} color={c.gold} height={5} />
          </View>
          <Text style={s.count}>
            {done + 1}/{total}
          </Text>
        </View>

        {item.stage === 'learn' ? (
          <>
            <Card style={s.learn}>
              <View style={s.tags}>
                <Text style={[s.tag, { backgroundColor: c.goldSoft, color: c.goldText }]}>新词</Text>
                {topic && <Text style={[s.tag, { backgroundColor: topic.color + '22', color: topic.color }]}>{topic.emoji} {topic.zh}</Text>}
              </View>
              <Text style={s.vi}>{item.word.vi}</Text>
              <Text style={s.zh}>{item.word.zh}</Text>
              {item.word.note ? <Text style={s.note}>💡 {item.word.note}</Text> : null}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <SpeakButton text={item.word.vi} />
                <SpeakButton text={item.word.vi} slow />
              </View>
            </Card>
            <Button label="记住了，稍后考我" icon="checkmark" onPress={() => learned(false)} style={{ marginTop: 14 }} />
            <Button label="这个我早就会了" kind="ghost" onPress={() => learned(true)} style={{ marginTop: 8 }} />
          </>
        ) : (
          <>
            {item.retry && <Text style={s.retry}>🔁 刚才答错的词，再来一次</Text>}
            <QuestionView key={done} q={item.q!} onAnswer={onAnswer} />
            {answered !== null && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                {answered && !item.retry && (
                  <Button label={`太简单 · ${previewInterval(card, 'easy', p.today)}后`} kind="ghost" style={{ flex: 1 }} onPress={() => finish(true)} />
                )}
                <Button
                  label={answered ? `下一个 · ${previewInterval(card, item.retry ? 'hard' : 'good', p.today)}后复习` : '下一个 · 明天再复习'}
                  icon="arrow-forward"
                  style={{ flex: 1.4 }}
                  onPress={() => finish()}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = ({ c }: Theme) => ({
  container: { padding: 16, paddingTop: 8, paddingBottom: 40 },
  progressRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, marginBottom: 12 },
  count: { color: c.sub, fontSize: 12, fontWeight: '600' as const },
  learn: { alignItems: 'center' as const, paddingTop: 46, paddingBottom: 22 },
  tags: { position: 'absolute' as const, top: 12, left: 12, flexDirection: 'row' as const, gap: 5 },
  tag: { fontSize: 11, fontWeight: '700' as const, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, overflow: 'hidden' as const },
  vi: { ...font.hero, fontSize: 32, color: c.text, textAlign: 'center' as const },
  zh: { ...font.title, color: c.sub, marginTop: 6, textAlign: 'center' as const },
  note: { fontSize: 12, color: c.goldText, marginTop: 6, textAlign: 'center' as const },
  retry: { color: c.danger, fontSize: 12, fontWeight: '700' as const, marginBottom: 8, textAlign: 'center' as const },
});
