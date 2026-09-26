import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, SpeakButton } from '../../components/ui';
import { allCompounds } from '../../data/compounds';
import { sentences } from '../../data/sentences';
import { tones, topics } from '../../data/topics';
import { useProgress } from '../../lib/progress';
import { findVietnameseVoice } from '../../lib/speech';
import { colors, radius } from '../../theme';

const totalWords = topics.reduce((n, t) => n + t.words.length, 0);
const totalPhrases = topics.reduce((n, t) => n + t.phrases.length, 0);

export default function Home() {
  const p = useProgress();
  const [hasVoice, setHasVoice] = useState<boolean | null>(null);

  useEffect(() => {
    findVietnameseVoice().then(setHasVoice);
  }, []);

  const modules = [
    { href: '/phrases', title: '常用语', desc: `${totalPhrases} 句日常会话`, icon: 'chatbubbles', color: '#E4572E' },
    { href: '/vocab', title: '词汇卡片', desc: `${totalWords} 个基础词`, icon: 'albums', color: '#3E7CB1' },
    { href: '/compounds', title: '组词', desc: `${allCompounds.length} 个合成词`, icon: 'git-merge', color: '#2A9D8F' },
    { href: '/sentences', title: '组句子', desc: `${sentences.length} 道拼句练习`, icon: 'reorder-four', color: '#8E5572' },
  ] as const;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.hello}>Xin chào! 👋</Text>
        <Text style={styles.title}>今天学点越南语吧</Text>

        {hasVoice === false && Platform.OS === 'ios' && (
          <Card style={styles.warn}>
            <Text style={styles.warnText}>
              没有检测到越南语语音。请到 iPhone「设置 → 辅助功能 → 朗读内容 → 声音」里下载越南语（Linh）。
            </Text>
          </Card>
        )}

        <View style={styles.stats}>
          <Stat n={p.known.length} total={totalWords} label="已掌握词汇" />
          <Stat n={p.compoundCorrect} label="组词答对" />
          <Stat n={p.sentenceCorrect} label="组句答对" />
        </View>

        <View style={styles.grid}>
          {modules.map((m) => (
            <Pressable
              key={m.href}
              onPress={() => router.navigate(m.href)}
              style={({ pressed }) => [styles.module, pressed && { opacity: 0.8 }]}
            >
              <View style={[styles.moduleIcon, { backgroundColor: m.color }]}>
                <Ionicons name={m.icon} size={22} color="#fff" />
              </View>
              <Text style={styles.moduleTitle}>{m.title}</Text>
              <Text style={styles.moduleDesc}>{m.desc}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>六个声调</Text>
        <Text style={styles.sectionSub}>越南语有 6 个声调，同一个 “ma” 声调不同，意思完全不同。点喇叭听一听。</Text>
        <Card style={{ paddingVertical: 4 }}>
          {tones.map((t, i) => (
            <View key={t.vi} style={[styles.toneRow, i > 0 && styles.divider]}>
              <Text style={styles.toneVi}>{t.vi}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.toneName}>
                  {t.name} · <Text style={{ color: colors.text }}>{t.zh}</Text>
                </Text>
                <Text style={styles.toneHint}>{t.hint}</Text>
              </View>
              <SpeakButton text={t.vi} size={18} />
            </View>
          ))}
        </Card>

        <Text style={styles.footer}>小技巧：长按任意 🔊 按钮可以慢速播放</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ n, total, label }: { n: number; total?: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statNum}>
        {n}
        {total ? <Text style={styles.statTotal}>/{total}</Text> : null}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  hello: { fontSize: 16, color: colors.primary, fontWeight: '600', marginTop: 8 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginTop: 4, marginBottom: 16 },
  warn: { backgroundColor: '#FFF6DA', marginBottom: 16 },
  warnText: { color: '#7A5B00', fontSize: 14, lineHeight: 20 },
  stats: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 18,
    marginBottom: 16,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { color: '#fff', fontSize: 26, fontWeight: '800' },
  statTotal: { fontSize: 14, fontWeight: '500', color: '#FFD9DE' },
  statLabel: { color: '#FFD9DE', fontSize: 13, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  module: {
    width: '48.5%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  moduleTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  moduleDesc: { fontSize: 13, color: colors.sub, marginTop: 4 },
  section: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 12 },
  sectionSub: { fontSize: 14, color: colors.sub, marginTop: 4, marginBottom: 12, lineHeight: 20 },
  toneRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  toneVi: { fontSize: 26, fontWeight: '700', color: colors.primary, width: 60 },
  toneName: { fontSize: 14, color: colors.sub, fontWeight: '600' },
  toneHint: { fontSize: 13, color: colors.sub, marginTop: 2 },
  footer: { textAlign: 'center', color: colors.sub, fontSize: 13, marginTop: 20 },
});
