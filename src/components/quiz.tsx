// 答题组件：选择题、拼写、听辨声调（测验、每日一刷、智能复习共用）
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Text, TextInput } from './Text';
import { toneHints, toneNames } from '../data/alphabet';
import type { Word } from '../data';
import type { Question } from '../lib/quiz';
import { useSettings } from '../lib/progress';
import { speakVi } from '../lib/speech';
import { plain, tidy } from '../lib/utils';
import { font, radius, Theme, useStyles, useTheme } from '../theme';
import { Button, Card, Feedback, OptionButton, OptionState, PressableScale, SpeakButton } from './ui';

/** 按题目类型显示对应的答题界面 */
export function QuestionView({ q, onAnswer }: { q: Question; onAnswer: (ok: boolean) => void }) {
  if (q.kind === 'choice') return <Choice q={q} onAnswer={onAnswer} />;
  if (q.kind === 'spell') return <Spell q={q} onAnswer={onAnswer} />;
  return <Tone q={q} onAnswer={onAnswer} />;
}

export function Choice({ q, onAnswer }: { q: Extract<Question, { kind: 'choice' }>; onAnswer: (ok: boolean) => void }) {
  const type = q.mode;
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const { autoPlay } = useSettings();
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    // 听音题必须播放；看越南语选中文按“自动朗读”设置
    if (type === 'listen' || (type === 'vi2zh' && autoPlay)) speakVi(q.word.vi);
  }, [q, type, autoPlay]);

  const state = (i: number): OptionState => {
    if (picked === null) return 'idle';
    if (q.options[i].correct) return 'right';
    return i === picked ? 'wrong' : 'dim';
  };

  return (
    <View>
      <Card style={s.prompt}>
        {type === 'meaning' && (
          <>
            <Text style={s.label}>这个用越南语怎么说？</Text>
            <Text style={s.big}>{q.word.zh}</Text>
          </>
        )}
        {type === 'vi2zh' && (
          <>
            <Text style={s.label}>这个词是什么意思？</Text>
            <Text style={s.big}>{q.word.vi}</Text>
            <View style={{ marginTop: 14, flexDirection: 'row', gap: 10 }}>
              <SpeakButton text={q.word.vi} />
              <SpeakButton text={q.word.vi} slow />
            </View>
          </>
        )}
        {type === 'listen' && (
          <>
            <Text style={s.label}>听一听，选出你听到的词</Text>
            <PressableScale onPress={() => speakVi(q.word.vi)} style={s.bigSpeak} scaleTo={0.9} accessibilityLabel="再听一遍">
              <Ionicons name="volume-high" size={30} color={c.onPrimary} />
            </PressableScale>
            <PressableScale onPress={() => speakVi(q.word.vi, true)} style={s.slowLink}>
              <Text style={s.slowText}>🐢 慢速再听</Text>
            </PressableScale>
          </>
        )}
      </Card>

      {q.options.map((o, i) => (
        <OptionButton
          key={o.label}
          label={o.label}
          big={type !== 'vi2zh'}
          state={state(i)}
          onPress={() => {
            setPicked(i);
            onAnswer(o.correct);
          }}
        />
      ))}

      {picked !== null && (
        <Feedback ok={q.options[picked].correct} title={q.options[picked].correct ? '答对了！' : '正确答案'}>
          <WordLine word={q.word} />
        </Feedback>
      )}
    </View>
  );
}

export function Spell({ q, onAnswer }: { q: Extract<Question, { kind: 'spell' }>; onAnswer: (ok: boolean) => void }) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const [text, setText] = useState('');
  const [result, setResult] = useState<'right' | 'close' | 'wrong' | null>(null);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    speakVi(q.word.vi);
  }, [q]);

  const check = () => {
    if (!text.trim() || result) return;
    const r = tidy(text) === tidy(q.word.vi) ? 'right' : plain(text) === plain(q.word.vi) ? 'close' : 'wrong';
    setResult(r);
    onAnswer(r === 'right');
  };

  return (
    <View>
      <Card style={s.prompt}>
        <Text style={s.label}>听发音，拼写出这个词</Text>
        <Text style={s.big}>{q.word.zh}</Text>
        <View style={{ marginTop: 14, flexDirection: 'row', gap: 10 }}>
          <SpeakButton text={q.word.vi} />
          <SpeakButton text={q.word.vi} slow />
        </View>
        {hint && !result && <Text style={s.hint}>提示：去掉声调是 “{plain(q.word.vi)}”</Text>}
      </Card>

      <TextInput
        value={text}
        onChangeText={setText}
        editable={!result}
        placeholder="输入越南语，例如 cảm ơn"
        placeholderTextColor={c.faint}
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={check}
        returnKeyType="done"
        style={[
          s.input,
          result === 'right' && { borderColor: c.success, backgroundColor: c.successSoft },
          (result === 'wrong' || result === 'close') && { borderColor: c.danger, backgroundColor: c.dangerSoft },
        ]}
      />

      {!result && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Button label="提示" kind="ghost" icon="bulb-outline" style={{ flex: 1 }} disabled={hint} onPress={() => setHint(true)} />
          <Button label="检查" icon="checkmark" style={{ flex: 1.5 }} disabled={!text.trim()} onPress={check} />
        </View>
      )}

      {result && (
        <Feedback
          ok={result === 'right'}
          title={result === 'right' ? '完全正确！' : result === 'close' ? '字母对了，声调或符号不对' : '正确答案'}
        >
          <WordLine word={q.word} />
        </Feedback>
      )}

      <Text style={s.kbTip}>
        没有越南语键盘？在手机「设置 → 键盘」里添加“越南语”（Telex）：打 aa → â，aw → ă，dd → đ，s/f/r/x/j 分别加锐/玄/问/跌/重声。
      </Text>
    </View>
  );
}

export function Tone({ q, onAnswer }: { q: Extract<Question, { kind: 'tone' }>; onAnswer: (ok: boolean) => void }) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    speakVi(q.syllable);
  }, [q]);

  const state = (i: number): OptionState =>
    picked === null ? 'idle' : i === q.answer ? 'right' : i === picked ? 'wrong' : 'dim';

  return (
    <View>
      <Card style={s.prompt}>
        <Text style={s.label}>听一听，这是哪个声调？</Text>
        <PressableScale onPress={() => speakVi(q.syllable)} style={s.bigSpeak} scaleTo={0.9} accessibilityLabel="再听一遍">
          <Ionicons name="volume-high" size={30} color={c.onPrimary} />
        </PressableScale>
        <PressableScale onPress={() => speakVi(q.syllable, true)} style={s.slowLink}>
          <Text style={s.slowText}>🐢 慢速再听</Text>
        </PressableScale>
      </Card>
      <View style={s.toneGrid}>
        {q.options.map((o, i) => (
          <View key={o} style={{ width: '48.5%' }}>
            <OptionButton
              label={o}
              sub={`${toneNames[i]} ${toneHints[i]}`}
              big
              state={state(i)}
              onPress={() => {
                setPicked(i);
                onAnswer(i === q.answer);
              }}
            />
          </View>
        ))}
      </View>
      {picked !== null && (
        <Feedback ok={picked === q.answer} title={picked === q.answer ? '耳朵真灵！' : `听到的是 ${q.syllable}（${toneNames[q.answer]}）`}>
          <Text style={s.fbSub}>点选项可以对比着听一听 👇</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {q.options.map((o) => (
              <PressableScale key={o} onPress={() => speakVi(o)} style={s.miniTone}>
                <Text style={s.miniToneText}>{o}</Text>
              </PressableScale>
            ))}
          </View>
        </Feedback>
      )}
    </View>
  );
}

export function WordLine({ word }: { word: Word }) {
  const s = useStyles(makeStyles);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <Text style={s.fbVi}>{word.vi}</Text>
        <Text style={s.fbSub}>{word.zh}</Text>
        {word.note ? <Text style={s.fbNote}>💡 {word.note}</Text> : null}
      </View>
      <SpeakButton text={word.vi} />
    </View>
  );
}

const makeStyles = ({ c }: Theme) => ({
  prompt: { alignItems: 'center' as const, paddingVertical: 20, marginBottom: 12 },
  label: { color: c.sub, fontSize: 12 },
  big: { ...font.hero, fontSize: 26, color: c.text, marginTop: 8, textAlign: 'center' as const },
  bigSpeak: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: c.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 14,
  },
  slowLink: { marginTop: 8, padding: 4 },
  slowText: { color: c.sub, fontSize: 12, fontWeight: '600' as const },
  hint: { color: c.goldText, marginTop: 10, fontSize: 12 },
  input: {
    backgroundColor: c.card,
    borderWidth: 1.5,
    borderColor: c.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 18,
    fontWeight: '600' as const,
    color: c.text,
  },
  kbTip: { color: c.faint, fontSize: 11, lineHeight: 16, marginTop: 14 },
  toneGrid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, justifyContent: 'space-between' as const },
  miniTone: { backgroundColor: c.card, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 6 },
  miniToneText: { fontSize: 16, fontWeight: '700' as const, color: c.text },
  fbVi: { fontSize: 19, fontWeight: '800' as const, color: c.text },
  fbSub: { fontSize: 13, color: c.sub, marginTop: 2 },
  fbNote: { fontSize: 11, color: c.goldText, marginTop: 4 },
});
