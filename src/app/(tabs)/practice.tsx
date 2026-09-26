import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { DailyDrill } from '../../components/DailyDrill';
import { IconName, PressableScale, SectionTitle, TabHeader } from '../../components/ui';
import { allWords } from '../../data';
import { useProgress } from '../../lib/progress';
import { quizTypes } from '../../lib/quiz';
import { NEW_PER_DAY } from '../../lib/srs';
import { font, radius, Theme, useStyles, useTheme } from '../../theme';

export default function Practice() {
  const p = useProgress();
  const s = useStyles(makeStyles);

  const due = Object.values(p.srs).filter((x) => x.due <= p.today).length;
  const fresh = Math.min(p.newLeftToday(NEW_PER_DAY), allWords.filter((w) => !p.srs[w.vi]).length);
  const mistakes = Object.keys(p.mistakes).length;

  return (
    <View style={{ flex: 1 }}>
      <TabHeader title="练习" />
      <ScrollView contentContainerStyle={s.container}>
      <DailyDrill />
      <View style={[s.pair, { marginTop: 12 }]}>
        <Big
          title="智能复习"
          sub={due + fresh ? `${due} 待复习 · ${fresh} 新词` : '今天已完成 ✓'}
          icon="sparkles"
          color="#F2A900"
          onPress={() => router.push('/review')}
        />
        <Big
          title="错题本"
          sub={mistakes ? `${mistakes} 道错题` : '暂时没有错题'}
          icon="bookmark"
          color="#E5484D"
          onPress={() => router.push('/mistakes')}
        />
      </View>

      <SectionTitle title="词汇测验" sub="每轮 10 题，从全部词汇里出。想练某个主题：词汇 → 选主题 → 测验这个主题" />
      <View style={{ marginTop: 10 }}>
        {quizTypes.map((q) => (
          <Row
            key={q.type}
            {...q}
            onPress={() => router.push(`/quiz/${q.type}` as Href)}
          />
        ))}
      </View>

      <SectionTitle title="组词造句" />
      <Row title="组词" sub="用音节拼出合成词，还能学词根" icon="git-merge" color="#6D597A" onPress={() => router.push('/compounds')} />
      <Row title="组句子" sub="点词块排出正确语序" icon="reorder-four" color="#277DA1" onPress={() => router.push('/sentences')} />
      </ScrollView>
    </View>
  );
}

function Big({ title, sub, icon, color, onPress }: { title: string; sub: string; icon: IconName; color: string; onPress: () => void }) {
  const s = useStyles(makeStyles);
  return (
    <PressableScale onPress={onPress} style={s.big}>
      <View style={[s.bigIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={19} color="#fff" />
      </View>
      <Text style={s.bigTitle}>{title}</Text>
      <Text style={s.bigSub}>{sub}</Text>
    </PressableScale>
  );
}

function Row({ title, sub, icon, color, onPress }: { title: string; sub: string; icon: IconName; color: string; onPress: () => void }) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  return (
    <PressableScale onPress={onPress} style={s.row} scaleTo={0.98}>
      <View style={[s.rowIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={s.rowSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={c.faint} />
    </PressableScale>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  container: { padding: 16, paddingTop: 8, paddingBottom: 32 },
  pair: { flexDirection: 'row' as const, gap: 8 },
  big: { flex: 1, backgroundColor: c.card, borderRadius: radius.md, padding: 12, ...shadow },
  bigIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 10,
  },
  bigTitle: { ...font.h3, color: c.text },
  bigSub: { fontSize: 12, color: c.sub, marginTop: 2 },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    ...shadow,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  rowTitle: { fontSize: 14, fontWeight: '600' as const, color: c.text },
  rowSub: { fontSize: 12, color: c.sub, marginTop: 1 },
});
