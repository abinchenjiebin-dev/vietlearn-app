import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';

import { ToneCurve } from '../../components/Art';
import { Text } from '../../components/Text';
import { Card, Chip, PressableScale, SectionTitle, SpeakButton, TabHeader, tap } from '../../components/ui';
import { clusters, consonants, Letter, vowels } from '../../data/alphabet';
import { tones } from '../../data/topics';
import { videos } from '../../data/videos';
import { speakVi, speakWords, stopSpeaking } from '../../lib/speech';
import { usePreload } from '../../lib/usePreload';
import { font, radius, Theme, useStyles, useTheme } from '../../theme';

const TABS = ['元音', '辅音', '组合辅音'] as const;
/** 这一页会念到的所有字母、例词和声调 */
const ALL_SOUNDS = [vowels, consonants, clusters, tones];

export default function Pronounce() {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const [tab, setTab] = useState<(typeof TABS)[number]>('元音');
  const [active, setActive] = useState<Letter | null>(null);
  // 依次播放时正在读第几个字母（-1 = 没在播放）
  const [playing, setPlaying] = useState(-1);
  usePreload(ALL_SOUNDS);
  const list = tab === '元音' ? vowels : tab === '辅音' ? consonants : clusters;
  // 一行 6 个格子，按屏幕宽度算（最宽按 600 算，平板上不会太大）
  const { width } = useWindowDimensions();
  const cell = Math.floor((Math.min(width, 600) - 32 - 5 * 8) / 6);

  // 点字母：先读拼读音，再读例词（bờ … ba）
  const pick = (l: Letter) => {
    tap();
    setActive(l);
    setPlaying(-1);
    speakWords([l.say, l.vi], () => {}, 0.8);
  };

  const playAll = () => {
    tap();
    if (playing >= 0) {
      stopSpeaking();
      setPlaying(-1);
      return;
    }
    setActive(null);
    speakWords(
      list.map((l) => l.say),
      (i) => setPlaying(i),
      0.8,
    );
  };

  const switchTab = (t: (typeof TABS)[number]) => {
    stopSpeaking();
    setPlaying(-1);
    setActive(null);
    setTab(t);
  };

  return (
    <View style={{ flex: 1 }}>
      <TabHeader title="发音" />
      <ScrollView contentContainerStyle={s.container}>
      <Text style={s.intro}>
        越南语一共 29 个字母：12 个元音、17 个辅音，另外还有几个固定的辅音组合。每个字母有两种读法：
        <Text style={s.em}>拼读音</Text>（如 b 念 bờ，拼读单词时用）和<Text style={s.em}>字母名</Text>
        （如 b 叫 bê，念字母表时用）。点字母先听拼读音，再听例词。
      </Text>

      <View style={s.tabs}>
        {TABS.map((t) => (
          <Chip key={t} label={t} active={tab === t} onPress={() => switchTab(t)} />
        ))}
        <View style={{ flex: 1 }} />
        <Pressable onPress={playAll} hitSlop={8} style={s.playAll} accessibilityLabel="依次播放">
          <Ionicons name={playing >= 0 ? 'stop' : 'play'} size={14} color={c.primary} />
          <Text style={s.playAllText}>{playing >= 0 ? '停止' : '依次播放'}</Text>
        </Pressable>
      </View>

      {active && (
        <Card style={s.detail}>
          <Text style={s.detailLetter}>{active.letter}</Text>
          <View style={{ flex: 1, gap: 6 }}>
            <SoundRow label="拼读音" text={active.say} />
            {active.name !== active.say && <SoundRow label="字母名" text={active.name} />}
            <SoundRow label="例词" text={active.vi} extra={active.zh} />
            <Text style={s.detailHint}>💡 {active.hint}</Text>
          </View>
        </Card>
      )}

      <View style={s.grid}>
        {list.map((l, i) => {
          const on = active?.letter === l.letter || playing === i;
          return (
            <PressableScale key={l.letter} onPress={() => pick(l)} style={[s.cell, { width: cell, height: cell }, on && { backgroundColor: c.primary, borderColor: c.primary }]}>
              <Text style={[s.letter, on && { color: c.onPrimary }]}>{l.letter}</Text>
              <Text style={[s.example, on && { color: c.onPrimary, opacity: 0.85 }]}>{l.say}</Text>
            </PressableScale>
          );
        })}
      </View>

      <SectionTitle title="📺 跟老师学发音" sub="看越南语老师的口型，比只听更容易学会" />
      {videos
        .filter((v) => v.kind === 'pronounce')
        .map((v) => (
          <Pressable key={v.bvid} onPress={() => { tap(); router.push(`/video/${v.bvid}` as Href); }} style={({ pressed }) => [s.video, pressed && { opacity: 0.85 }]}>
            <View style={s.videoPlay}>
              <Ionicons name="play" size={14} color={c.onPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.videoTitle} numberOfLines={1}>
                {v.zh}
              </Text>
              <Text style={s.videoMeta}>
                {v.teacher} · {v.minutes} 分钟
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={c.faint} />
          </Pressable>
        ))}

      <SectionTitle title="六个声调" sub="同一个 “ma”，声调不同，意思完全不同。曲线是音高走势（上高下低），点一行听一听。" />
      <Card style={{ paddingVertical: 4 }}>
        {tones.map((t, i) => (
          <Pressable key={t.vi} onPress={() => { tap(); speakVi(t.vi); }} style={[s.toneRow, i > 0 && s.divider]}>
            <Text style={s.toneVi}>{t.vi}</Text>
            <View style={s.curve}>
              <ToneCurve index={i} color={c.primary} grid={c.border} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.toneName}>
                {t.name} · <Text style={{ color: c.text }}>{t.zh}</Text>
              </Text>
              <Text style={s.toneHint}>{t.hint}</Text>
            </View>
            <SpeakButton text={t.vi} size={15} />
          </Pressable>
        ))}
      </Card>

      <PressableScale onPress={() => router.push('/quiz/tone')} style={s.cta}>
        <Ionicons name="pulse" size={18} color="#fff" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.ctaTitle}>听辨声调练习</Text>
          <Text style={s.ctaSub}>听音节选声调，练出越南语耳朵</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#fff" />
      </PressableScale>

      <SectionTitle title="拼读小规则" />
      <Card>
        {[
          ['c / k / q', '都读 “g”：i、e、ê、y 前写 k，u 前多写 q（qu），其余写 c'],
          ['g / gh、ng / ngh', 'i、e、ê 前加 h：ghế、nghe'],
          ['d、gi、r', '北方都读 z，南方 d、gi 读 y'],
          ['词尾 c、ch、p、t', '只做口型不出声，声音很短'],
          ['声调位置', '声调符号标在主要元音上：hoà / hòa 两种写法都常见'],
        ].map(([k, v], i) => (
          <View key={k} style={[s.rule, i > 0 && s.divider]}>
            <Text style={s.ruleKey}>{k}</Text>
            <Text style={s.ruleVal}>{v}</Text>
          </View>
        ))}
      </Card>
      </ScrollView>
    </View>
  );
}

function SoundRow({ label, text, extra }: { label: string; text: string; extra?: string }) {
  const s = useStyles(makeStyles);
  return (
    <Pressable onPress={() => { tap(); speakVi(text, true); }} style={s.soundRow}>
      <Text style={s.soundLabel}>{label}</Text>
      <Text style={s.soundText}>
        {text}
        {extra ? <Text style={s.detailZh}> {extra}</Text> : null}
      </Text>
      <SpeakButton text={text} size={13} />
    </Pressable>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  container: { padding: 16, paddingTop: 8, paddingBottom: 40 },
  intro: { color: c.sub, fontSize: 12, lineHeight: 18 },
  tabs: { flexDirection: 'row' as const, alignItems: 'center' as const, marginTop: 10, marginBottom: 10 },
  detail: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: 10, gap: 12, paddingVertical: 10 },
  detailLetter: { fontSize: 32, fontWeight: '800' as const, color: c.primary, minWidth: 44, textAlign: 'center' as const },
  detailVi: { fontSize: 18, fontWeight: '700' as const, color: c.text },
  detailZh: { fontSize: 13, fontWeight: '400' as const, color: c.sub },
  video: {
    ...shadow,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    backgroundColor: c.card,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 8,
  },
  videoPlay: { width: 30, height: 30, borderRadius: 15, backgroundColor: c.primary, alignItems: 'center' as const, justifyContent: 'center' as const },
  videoTitle: { fontSize: 14, fontWeight: '600' as const, color: c.text },
  videoMeta: { fontSize: 11, color: c.sub, marginTop: 2 },
  em: { fontWeight: '700' as const, color: c.primary },
  playAll: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 3, padding: 4 },
  playAllText: { fontSize: 13, fontWeight: '700' as const, color: c.primary },
  soundRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 },
  soundLabel: { fontSize: 11, color: c.faint, width: 38 },
  soundText: { flex: 1, fontSize: 17, fontWeight: '700' as const, color: c.text },
  detailHint: { fontSize: 12, color: c.sub, marginTop: 3, lineHeight: 17 },
  grid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 },
  cell: {
    ...shadow,
    borderRadius: radius.md,
    backgroundColor: c.card,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: c.border,
  },
  letter: { fontSize: 20, fontWeight: '700' as const, color: c.text },
  example: { fontSize: 10, color: c.sub, marginTop: 1 },
  toneRow: { flexDirection: 'row' as const, alignItems: 'center' as const, paddingVertical: 9 },
  divider: { borderTopWidth: 1, borderTopColor: c.border },
  toneVi: { fontSize: 22, fontWeight: '800' as const, color: c.primary, width: 46 },
  curve: { marginRight: 10 },
  toneName: { fontSize: 12, color: c.sub, fontWeight: '600' as const },
  toneHint: { fontSize: 11, color: c.sub, marginTop: 1 },
  cta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#D1A21F',
    borderRadius: radius.lg,
    padding: 12,
    marginTop: 10,
  },
  ctaTitle: { ...font.h3, color: '#fff' },
  ctaSub: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 1 },
  rule: { paddingVertical: 9 },
  ruleKey: { fontSize: 14, fontWeight: '700' as const, color: c.text },
  ruleVal: { fontSize: 12, color: c.sub, marginTop: 2, lineHeight: 17 },
});
