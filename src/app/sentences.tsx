import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '../components/Text';
import { RoundResult } from '../components/quiz';
import { Button, buzz, Card, Feedback, PressableScale, ProgressBar, SpeakButton, tap } from '../components/ui';
import { SentenceItem, sentences, sentenceText } from '../data/sentences';
import { useProgress } from '../lib/progress';
import { speakVi } from '../lib/speech';
import { pickRandom, shuffle } from '../lib/utils';
import { radius, Theme, useStyles, useTheme } from '../theme';

type Tile = { id: number; text: string };

const ROUND = 10;
const allTokens = Array.from(new Set(sentences.flatMap((s) => s.tokens)));
const norm = (s: string) => s.toLowerCase();
const PROPER = ['Việt Nam', 'Trung Quốc', 'Minh', 'Thành phố Hồ Chí Minh'];
/** 句首词改成小写，避免大写字母泄露答案顺序（专有名词除外） */
const decap = (t: string) => (PROPER.includes(t) ? t : t.charAt(0).toLowerCase() + t.slice(1));
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** 词块 = 正确词语 + 2 个干扰词，打乱顺序 */
function makeTiles(item: SentenceItem): Tile[] {
  const own = item.tokens.map(norm);
  const distractors = pickRandom(
    allTokens.filter((t) => !own.includes(norm(t))),
    2,
  );
  return shuffle([decap(item.tokens[0]), ...item.tokens.slice(1), ...distractors.map(decap)]).map((text, id) => ({ id, text }));
}

export default function Sentences() {
  const { mistakes: onlyMistakes } = useLocalSearchParams<{ mistakes?: string }>();
  const { recordAnswer, mistakes } = useProgress();
  const s = useStyles(makeStyles);
  const { c } = useTheme();

  const pool = useMemo<SentenceItem[]>(() => {
    if (!onlyMistakes) return sentences;
    const ids = Object.values(mistakes).filter((m) => m.kind === 'sentence').map((m) => m.id);
    const list = sentences.filter((x) => ids.includes(x.zh));
    return list.length ? list : sentences;
    // 只在进入时取一次错题
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyMistakes]);

  // 每轮最多 10 题，做完显示成绩（不再自动从头循环）
  const roundLen = Math.min(ROUND, pool.length);
  const newOrder = () => shuffle(pool.map((_, i) => i)).slice(0, roundLen);
  const [order, setOrder] = useState(newOrder);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [pos, setPos] = useState(0);
  const [tiles, setTiles] = useState(() => makeTiles(pool[order[0]]));
  const [picked, setPicked] = useState<Tile[]>([]);
  const [result, setResult] = useState<'right' | 'wrong' | null>(null);
  const [showTip, setShowTip] = useState(false);

  const item = pool[order[pos]];

  const next = () => {
    setPicked([]);
    setResult(null);
    setShowTip(false);
    if (pos + 1 >= order.length) return setFinished(true);
    setPos(pos + 1);
    setTiles(makeTiles(pool[order[pos + 1]]));
  };

  const restart = () => {
    const o = newOrder();
    setOrder(o);
    setPos(0);
    setScore(0);
    setFinished(false);
    setPicked([]);
    setResult(null);
    setShowTip(false);
    setTiles(makeTiles(pool[o[0]]));
  };

  const check = () => {
    const ok = picked.map((t) => norm(t.text)).join(' ') === item.tokens.map(norm).join(' ');
    setResult(ok ? 'right' : 'wrong');
    if (ok) setScore((n) => n + 1);
    buzz(ok);
    recordAnswer('sentence', item.zh, ok);
    speakVi(sentenceText(item));
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

  if (finished) return <RoundResult score={score} total={order.length} note="答错的句子会放进错题本" onAgain={restart} />;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 40 }}>
      <View style={s.progressRow}>
        <View style={{ flex: 1 }}>
          <ProgressBar value={(pos + 1) / order.length} color="#277DA1" height={5} />
        </View>
        <Text style={s.count}>
          {onlyMistakes ? '错题 ' : ''}
          {pos + 1}/{order.length}
        </Text>
      </View>
      <Card style={{ paddingVertical: 16 }}>
        <Text style={s.label}>把下面的中文翻译成越南语</Text>
        <Text style={s.zh}>{item.zh}</Text>
      </Card>

      {/* 答题区 */}
      <View
        style={[
          s.answer,
          result === 'right' && { borderColor: c.success, backgroundColor: c.successSoft },
          result === 'wrong' && { borderColor: c.danger, backgroundColor: c.dangerSoft },
        ]}
      >
        {picked.length === 0 ? (
          <Text style={s.placeholder}>按顺序点击下方词块…</Text>
        ) : (
          picked.map((t, i) => (
            <Pressable key={t.id} onPress={() => unpick(t)} style={[s.tile, s.tileInAnswer]}>
              <Text style={s.tileText}>{i === 0 ? cap(t.text) : t.text}</Text>
            </Pressable>
          ))
        )}
      </View>

      {/* 词块 */}
      <View style={s.tiles}>
        {tiles.map((t) => {
          const used = picked.some((p) => p.id === t.id);
          return (
            <PressableScale key={t.id} disabled={used || !!result} onPress={() => pick(t)} style={s.tile} scaleTo={0.9}>
              <Text style={s.tileText}>{t.text}</Text>
            </PressableScale>
          );
        })}
      </View>

      {showTip && item.tip && !result && (
        <Card style={s.tipCard}>
          <Text style={s.tipText}>💡 {item.tip}</Text>
        </Card>
      )}

      {result && (
        <Feedback ok={result === 'right'} title={result === 'right' ? '完全正确！🎉' : '差一点～正确答案：'}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={s.fbVi}>{sentenceText(item)}</Text>
              {item.tip && <Text style={s.fbTip}>💡 {item.tip}</Text>}
            </View>
            <View style={{ gap: 8 }}>
              <SpeakButton text={sentenceText(item)} />
              <SpeakButton text={sentenceText(item)} slow />
            </View>
          </View>
        </Feedback>
      )}

      <View style={s.buttons}>
        {result ? (
          <Button label={pos + 1 >= order.length ? '查看成绩' : '下一题'} icon="arrow-forward" style={{ flex: 1 }} onPress={next} />
        ) : (
          <>
            <Button label="提示" kind="ghost" icon="bulb-outline" style={{ flex: 1 }} disabled={!item.tip} onPress={() => setShowTip(true)} />
            <Button label="清空" kind="ghost" icon="refresh" style={{ flex: 1 }} disabled={picked.length === 0} onPress={() => setPicked([])} />
            <Button label="检查" icon="checkmark" style={{ flex: 1.3 }} disabled={picked.length === 0} onPress={check} />
          </>
        )}
      </View>
      {!result && (
        <Pressable onPress={next} style={{ alignSelf: 'center', marginTop: 14 }}>
          <Text style={{ color: c.sub }}>跳过这题 →</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  progressRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, marginBottom: 12 },
  count: { color: c.sub, fontSize: 12, fontWeight: '600' as const },
  label: { color: c.sub, fontSize: 12 },
  zh: { fontSize: 20, fontWeight: '700' as const, color: c.text, marginTop: 6 },
  answer: {
    minHeight: 64,
    marginTop: 12,
    padding: 8,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: c.border,
    borderStyle: 'dashed' as const,
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  placeholder: { color: c.faint, fontSize: 12, marginLeft: 6 },
  tiles: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, justifyContent: 'center' as const, gap: 8, marginTop: 16 },
  tile: {
    ...shadow,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    borderBottomWidth: 3,
  },
  tileInAnswer: { borderColor: c.primary, backgroundColor: c.primarySoft },
  tileText: { fontSize: 16, fontWeight: '600' as const, color: c.text },
  tipCard: { marginTop: 12, backgroundColor: c.goldSoft },
  tipText: { color: c.goldText, fontSize: 12 },
  fbVi: { fontSize: 18, fontWeight: '800' as const, color: c.text },
  fbTip: { fontSize: 12, color: c.sub, marginTop: 4 },
  buttons: { flexDirection: 'row' as const, marginTop: 16, gap: 8 },
});
