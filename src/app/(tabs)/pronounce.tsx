import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';

import { ToneCurve } from '../../components/Art';
import { Text } from '../../components/Text';
import { Card, Chip, PressableScale, SectionTitle, SpeakButton, TabHeader, tap } from '../../components/ui';
import { clusters, consonants, Letter, vowels } from '../../data/alphabet';
import { tones } from '../../data/topics';
import { speakVi } from '../../lib/speech';
import { font, radius, Theme, useStyles, useTheme } from '../../theme';

const TABS = ['元音', '辅音', '组合辅音'] as const;

export default function Pronounce() {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const [tab, setTab] = useState<(typeof TABS)[number]>('元音');
  const [active, setActive] = useState<Letter | null>(null);
  const list = tab === '元音' ? vowels : tab === '辅音' ? consonants : clusters;
  // 一行 6 个格子，按屏幕宽度算（最宽按 600 算，平板上不会太大）
  const { width } = useWindowDimensions();
  const cell = Math.floor((Math.min(width, 600) - 32 - 5 * 8) / 6);

  const pick = (l: Letter) => {
    tap();
    setActive(l);
    speakVi(l.vi);
  };

  return (
    <View style={{ flex: 1 }}>
      <TabHeader title="发音" />
      <ScrollView contentContainerStyle={s.container}>
      <Text style={s.intro}>
        越南语用拉丁字母书写，一共 29 个字母：12 个元音、17 个辅音，再加上几个固定的辅音组合。点字母听例词的发音。
      </Text>

      <View style={s.tabs}>
        {TABS.map((t) => (
          <Chip key={t} label={t} active={tab === t} onPress={() => { setTab(t); setActive(null); }} />
        ))}
      </View>

      {active && (
        <Card style={s.detail}>
          <Text style={s.detailLetter}>{active.letter}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.detailVi}>
              {active.vi} <Text style={s.detailZh}>{active.zh}</Text>
            </Text>
            <Text style={s.detailHint}>{active.hint}</Text>
          </View>
          <SpeakButton text={active.vi} />
        </Card>
      )}

      <View style={s.grid}>
        {list.map((l) => {
          const on = active?.letter === l.letter;
          return (
            <PressableScale key={l.letter} onPress={() => pick(l)} style={[s.cell, { width: cell, height: cell }, on && { backgroundColor: c.primary, borderColor: c.primary }]}>
              <Text style={[s.letter, on && { color: c.onPrimary }]}>{l.letter}</Text>
              <Text style={[s.example, on && { color: c.onPrimary, opacity: 0.85 }]}>{l.vi}</Text>
            </PressableScale>
          );
        })}
      </View>

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

const makeStyles = ({ c, shadow }: Theme) => ({
  container: { padding: 16, paddingTop: 8, paddingBottom: 40 },
  intro: { color: c.sub, fontSize: 12, lineHeight: 18 },
  tabs: { flexDirection: 'row' as const, marginTop: 10, marginBottom: 10 },
  detail: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: 10, gap: 12, paddingVertical: 10 },
  detailLetter: { fontSize: 32, fontWeight: '800' as const, color: c.primary, minWidth: 44, textAlign: 'center' as const },
  detailVi: { fontSize: 18, fontWeight: '700' as const, color: c.text },
  detailZh: { fontSize: 13, fontWeight: '400' as const, color: c.sub },
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
