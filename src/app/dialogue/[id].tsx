import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Recorder } from '../../components/Recorder';
import { Text } from '../../components/Text';
import { Chip, Empty, PressableScale, tap } from '../../components/ui';
import { dialogues, getDialogue, type Line } from '../../data/dialogues';
import { useProgress } from '../../lib/progress';
import { speakVi, speakWords, stopSpeaking } from '../../lib/speech';
import { radius, Theme, useStyles, useTheme } from '../../theme';

/** 情景对话：听整段、看中文、扮演角色（你的台词先隐藏，自己说出来再看答案） */
export default function DialogueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const d = getDialogue(id) ?? dialogues[0];
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const { tick } = useProgress();
  const [showZh, setShowZh] = useState(true);
  const [rolePlay, setRolePlay] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [playing, setPlaying] = useState(-1);
  const scroll = useRef<ScrollView>(null);

  if (!getDialogue(id)) return <Empty icon="chatbubbles-outline" title="找不到这段对话" />;

  const playAll = () => {
    tap();
    if (playing >= 0) {
      stopSpeaking();
      setPlaying(-1);
      return;
    }
    speakWords(
      d.lines.map((l) => l.vi),
      (i) => {
        setPlaying(i);
        if (i < 0) tick();
      },
      0.9,
    );
  };

  /** 从第 from 句开始连着读，读到下一句“你”的台词之前停下（扮演模式里对方的话自动读出来） */
  const playUntilMyTurn = (from: number) => {
    const idx: number[] = [];
    for (let i = from; i < d.lines.length; i++) {
      if (i > from && d.lines[i].who === 'me') break;
      idx.push(i);
    }
    speakWords(
      idx.map((i) => d.lines[i].vi),
      (k) => setPlaying(k < 0 ? -1 : idx[k]),
      0.9,
    );
  };

  const startRolePlay = () => {
    setRolePlay(true);
    setRevealed(new Set());
    // 如果对话是对方先开口，先把对方的话读出来
    if (d.lines[0].who === 'other') playUntilMyTurn(0);
  };

  const reveal = (i: number) => {
    tap();
    setRevealed(new Set(revealed).add(i));
    tick();
    // 读出正确答案，再接着读对方的下一句
    playUntilMyTurn(i);
  };

  // 扮演模式：对话一句句往下走，只显示到当前轮到你的这一句
  const myTurn = rolePlay ? d.lines.findIndex((l, i) => l.who === 'me' && !revealed.has(i)) : -1;
  const shown = rolePlay && myTurn >= 0 ? d.lines.slice(0, myTurn + 1) : d.lines;
  const finished = rolePlay && myTurn < 0;

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: `${d.emoji} ${d.zh}` }} />
      <ScrollView
        ref={scroll}
        contentContainerStyle={s.container}
        // 扮演模式：新的一句出现时自动滚到最下面
        onContentSizeChange={() => {
          if (rolePlay) scroll.current?.scrollToEnd({ animated: true });
        }}
      >
        <View style={s.sceneBox}>
          <Text style={s.scene}>场景：{d.scene}</Text>
          <Text style={s.cast}>
            你 ↔ {d.otherEmoji} {d.other}
          </Text>
        </View>

        <View style={s.toolbar}>
          <Chip label="听对话" active={!rolePlay} onPress={() => { setRolePlay(false); setRevealed(new Set()); }} />
          <Chip label="🎭 我来扮演“你”" active={rolePlay} onPress={startRolePlay} />
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => { tap(); setShowZh((v) => !v); }} hitSlop={8} style={s.zhToggle}>
            <Ionicons name={showZh ? 'eye-outline' : 'eye-off-outline'} size={15} color={c.sub} />
            <Text style={s.zhToggleText}>中文</Text>
          </Pressable>
        </View>
        {rolePlay && !finished && (
          <Text style={s.roleTip}>对方说完后轮到你：看中文提示试着说出越南语（可以录音），再点“看答案”，对话会继续。</Text>
        )}

        {shown.map((l, i) => (
          <Bubble
            key={i}
            line={l}
            otherEmoji={d.otherEmoji}
            active={playing === i}
            showZh={showZh}
            hidden={i === myTurn}
            onReveal={() => reveal(i)}
          />
        ))}

        {finished && (
          <View style={s.done}>
            <Text style={s.doneText}>🎉 你完成了这段对话！</Text>
            <Chip label="再来一次" onPress={startRolePlay} />
          </View>
        )}
      </ScrollView>

      <View style={s.bottom}>
        <PressableScale onPress={playAll} style={s.playAll}>
          <Ionicons name={playing >= 0 ? 'stop' : 'play'} size={16} color={c.onPrimary} />
          <Text style={s.playText}>{playing >= 0 ? '停止播放' : '播放整段对话'}</Text>
        </PressableScale>
      </View>
    </View>
  );
}

function Bubble({
  line,
  otherEmoji,
  active,
  showZh,
  hidden,
  onReveal,
}: {
  line: Line;
  otherEmoji: string;
  active: boolean;
  showZh: boolean;
  hidden: boolean;
  onReveal: () => void;
}) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const me = line.who === 'me';

  return (
    <View style={[s.lineRow, me && { flexDirection: 'row-reverse' }]}>
      <View style={[s.avatar, me && { backgroundColor: c.primarySoft }]}>
        <Text style={{ fontSize: 15 }}>{me ? '🙂' : otherEmoji}</Text>
      </View>
      {hidden ? (
        <View style={[s.bubble, s.bubbleMe, s.hiddenBubble]}>
          <Text style={s.prompt}>🎤 轮到你：{line.zh}</Text>
          <View style={{ marginTop: 6 }}>
            <Recorder key={line.vi} text={line.vi} compact />
          </View>
          <PressableScale onPress={onReveal} style={s.revealBtn} accessibilityLabel="看答案">
            <Ionicons name="eye-outline" size={14} color={c.primary} />
            <Text style={s.revealText}>看答案</Text>
          </PressableScale>
        </View>
      ) : (
        <Pressable
          onPress={() => { tap(); speakVi(line.vi); }}
          style={[s.bubble, me ? s.bubbleMe : s.bubbleOther, active && { borderColor: c.primary, borderWidth: 2 }]}
        >
          <Text style={s.vi}>{line.vi}</Text>
          {showZh && <Text style={s.zh}>{line.zh}</Text>}
          {showZh && line.note ? <Text style={s.note}>💡 {line.note}</Text> : null}
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  container: { padding: 16, paddingTop: 6, paddingBottom: 100 },
  sceneBox: { ...shadow, backgroundColor: c.card, borderRadius: radius.md, padding: 12 },
  scene: { fontSize: 13, color: c.text, fontWeight: '600' as const },
  cast: { fontSize: 12, color: c.sub, marginTop: 3 },
  toolbar: { flexDirection: 'row' as const, alignItems: 'center' as const, marginTop: 12, marginBottom: 6 },
  zhToggle: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 3, padding: 4 },
  zhToggleText: { fontSize: 12, color: c.sub, fontWeight: '600' as const },
  done: { alignItems: 'center' as const, gap: 10, marginTop: 20 },
  doneText: { fontSize: 15, fontWeight: '700' as const, color: c.primary },
  roleTip: { fontSize: 12, color: c.goldText, marginBottom: 6, lineHeight: 17 },
  lineRow: { flexDirection: 'row' as const, alignItems: 'flex-end' as const, gap: 8, marginTop: 10 },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: c.cardAlt,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  bubble: { maxWidth: '78%' as const, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: 'transparent' },
  bubbleOther: { ...shadow, backgroundColor: c.card, borderBottomLeftRadius: 4 },
  bubbleMe: { backgroundColor: c.primarySoft, borderBottomRightRadius: 4 },
  hiddenBubble: { borderStyle: 'dashed' as const, borderColor: c.primary, borderWidth: 1.5, minWidth: '70%' as const },
  vi: { fontSize: 15, fontWeight: '600' as const, color: c.text },
  zh: { fontSize: 12, color: c.sub, marginTop: 3 },
  note: { fontSize: 11, color: c.goldText, marginTop: 3 },
  prompt: { fontSize: 13, color: c.text, fontWeight: '600' as const },
  revealBtn: {
    alignSelf: 'flex-end' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: c.card,
  },
  revealText: { fontSize: 12, color: c.primary, fontWeight: '700' as const },
  bottom: { position: 'absolute' as const, left: 16, right: 16, bottom: 16 },
  playAll: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    backgroundColor: c.primary,
    borderRadius: radius.pill,
    paddingVertical: 12,
  },
  playText: { fontSize: 15, fontWeight: '700' as const, color: c.onPrimary },
});
