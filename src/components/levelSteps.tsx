// 闯关里的步骤界面：教新词、教声调、排句子、通用选择题
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import type { Word } from '../data';
import { tones } from '../data/topics';
import type { Step } from '../lib/levels';
import { useSettings } from '../lib/progress';
import { speakVi } from '../lib/speech';
import { radius, Theme, useStyles, useTheme } from '../theme';
import { ToneCurve } from './Art';
import { Text } from './Text';
import { Button, Card, Feedback, OptionButton, OptionState, PressableScale, SpeakButton, tap } from './ui';

/** 教一个新词 */
export function TeachCard({ word, onNext }: { word: Word; onNext: () => void }) {
  const s = useStyles(makeStyles);
  const { autoPlay } = useSettings();
  useEffect(() => {
    if (autoPlay) speakVi(word.vi);
  }, [word, autoPlay]);
  return (
    <View>
      <Text style={s.newTag}>✨ 新内容</Text>
      <Card style={s.teach}>
        {word.emoji ? <Text style={s.teachEmoji}>{word.emoji}</Text> : null}
        <Text style={s.teachVi}>{word.vi}</Text>
        <Text style={s.teachZh}>{word.zh}</Text>
        {word.note ? <Text style={s.note}>💡 {word.note}</Text> : null}
        <View style={s.speak}>
          <SpeakButton text={word.vi} />
          <SpeakButton text={word.vi} slow />
        </View>
      </Card>
      <Button label="记住了，继续" icon="arrow-forward" onPress={onNext} style={{ marginTop: 16 }} />
    </View>
  );
}

/** 教一个声调 */
export function TeachTone({ index, onNext }: { index: number; onNext: () => void }) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const t = tones[index];
  useEffect(() => {
    speakVi(t.vi);
  }, [t]);
  return (
    <View>
      <Text style={s.newTag}>🎵 声调 {index + 1} / 6</Text>
      <Card style={s.teach}>
        <Text style={[s.teachVi, { color: c.primary }]}>{t.vi}</Text>
        <View style={{ marginTop: 10 }}>
          <ToneCurve index={index} color={c.primary} grid={c.border} />
        </View>
        <Text style={s.teachZh}>{t.name}</Text>
        <Text style={s.note}>{t.hint}</Text>
        <Text style={s.meaning}>“{t.vi}” 的意思：{t.zh}</Text>
        <View style={s.speak}>
          <SpeakButton text={t.vi} />
          <SpeakButton text={t.vi} slow />
        </View>
      </Card>
      <Button label={index < 5 ? '下一个声调' : '开始练习'} icon="arrow-forward" onPress={onNext} style={{ marginTop: 16 }} />
    </View>
  );
}

type Tile = { id: number; text: string };
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** 排句子 */
export function OrderQuestion({ step, onAnswer }: { step: Extract<Step, { kind: 'order' }>; onAnswer: (ok: boolean) => void }) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const [tiles] = useState<Tile[]>(() => step.tiles.map((text, id) => ({ id, text })));
  const [picked, setPicked] = useState<Tile[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const answer = step.phrase.vi.replace(/[.,!?]/g, '').toLowerCase();

  const check = () => {
    const ok = picked.map((t) => t.text).join(' ') === answer;
    setResult(ok);
    onAnswer(ok);
    speakVi(step.phrase.vi);
  };

  return (
    <View>
      <Card style={s.prompt}>
        <Text style={s.label}>把词块排成这句话</Text>
        <Text style={s.big}>{step.phrase.zh}</Text>
      </Card>
      <View
        style={[
          s.answer,
          result === true && { borderColor: c.success, backgroundColor: c.successSoft },
          result === false && { borderColor: c.danger, backgroundColor: c.dangerSoft },
        ]}
      >
        {picked.length === 0 ? (
          <Text style={s.placeholder}>按顺序点下面的词块…</Text>
        ) : (
          picked.map((t, i) => (
            <Pressable
              key={t.id}
              onPress={() => { if (result === null) { tap(); setPicked(picked.filter((x) => x.id !== t.id)); } }}
              style={[s.tile, s.tileIn]}
            >
              <Text style={s.tileText}>{i === 0 ? cap(t.text) : t.text}</Text>
            </Pressable>
          ))
        )}
      </View>
      <View style={s.tiles}>
        {tiles.map((t) => {
          const used = picked.some((p) => p.id === t.id);
          return (
            <PressableScale
              key={t.id}
              disabled={used || result !== null}
              onPress={() => { tap(); speakVi(t.text); setPicked([...picked, t]); }}
              style={s.tile}
              scaleTo={0.9}
            >
              <Text style={s.tileText}>{t.text}</Text>
            </PressableScale>
          );
        })}
      </View>
      {result === null ? (
        <Button label="检查" icon="checkmark" disabled={picked.length === 0} onPress={check} style={{ marginTop: 16 }} />
      ) : (
        <Feedback ok={result} title={result ? '完全正确！' : '正确答案'}>
          <Text style={s.fbVi}>{step.phrase.vi}</Text>
          <Text style={s.fbSub}>{step.phrase.zh}</Text>
        </Feedback>
      )}
    </View>
  );
}

/** 通用选择题（对话、字母等） */
export function PickQuestion({ step, onAnswer }: { step: Extract<Step, { kind: 'pick' }>; onAnswer: (ok: boolean) => void }) {
  const s = useStyles(makeStyles);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    if (step.speak) speakVi(step.speak);
  }, [step]);

  const state = (i: number): OptionState => (picked === null ? 'idle' : i === step.answer ? 'right' : i === picked ? 'wrong' : 'dim');

  return (
    <View>
      <Card style={s.prompt}>
        <Text style={s.label}>{step.prompt}</Text>
        {step.big ? (
          <Pressable onPress={() => step.speak && speakVi(step.speak)} style={{ alignItems: 'center' }}>
            <Text style={[s.big, step.big.length > 12 && { fontSize: 18 }]}>{step.big}</Text>
            {step.sub ? <Text style={s.sub}>{step.sub}</Text> : null}
          </Pressable>
        ) : null}
        {step.speak ? (
          <View style={s.speak}>
            <SpeakButton text={step.speak} />
            <SpeakButton text={step.speak} slow />
          </View>
        ) : null}
      </Card>
      {step.options.map((o, i) => (
        <OptionButton
          key={o}
          label={o}
          state={state(i)}
          onPress={() => {
            setPicked(i);
            onAnswer(i === step.answer);
            if (/[a-zà-ỹđ]/i.test(o) && o.length > 3) speakVi(step.options[step.answer]);
          }}
        />
      ))}
      {picked !== null && (
        <Feedback ok={picked === step.answer} title={picked === step.answer ? '答对了！' : `正确答案：${step.options[step.answer]}`}>
          {step.explain ? <Text style={s.fbSub}>💡 {step.explain}</Text> : null}
        </Feedback>
      )}
    </View>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  newTag: { fontSize: 12, fontWeight: '700' as const, color: c.primary, marginBottom: 8 },
  teach: { alignItems: 'center' as const, paddingVertical: 28 },
  teachEmoji: { fontSize: 64, lineHeight: 78, marginBottom: 6 },
  teachVi: { fontSize: 32, fontWeight: '800' as const, color: c.text, textAlign: 'center' as const },
  teachZh: { fontSize: 18, fontWeight: '600' as const, color: c.sub, marginTop: 8, textAlign: 'center' as const },
  note: { fontSize: 12, color: c.goldText, marginTop: 6, textAlign: 'center' as const },
  meaning: { fontSize: 13, color: c.sub, marginTop: 8 },
  speak: { flexDirection: 'row' as const, gap: 10, marginTop: 14 },
  prompt: { alignItems: 'center' as const, paddingVertical: 20, marginBottom: 12 },
  label: { color: c.sub, fontSize: 13, textAlign: 'center' as const },
  big: { fontSize: 24, fontWeight: '800' as const, color: c.text, marginTop: 8, textAlign: 'center' as const },
  sub: { fontSize: 13, color: c.sub, marginTop: 4, textAlign: 'center' as const },
  answer: {
    minHeight: 60,
    padding: 8,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: c.border,
    borderStyle: 'dashed' as const,
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  placeholder: { color: c.faint, fontSize: 12, marginLeft: 6 },
  tiles: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, justifyContent: 'center' as const, gap: 8, marginTop: 14 },
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
  tileIn: { borderColor: c.primary, backgroundColor: c.primarySoft },
  tileText: { fontSize: 16, fontWeight: '600' as const, color: c.text },
  fbVi: { fontSize: 18, fontWeight: '800' as const, color: c.text },
  fbSub: { fontSize: 13, color: c.sub, marginTop: 2 },
});
