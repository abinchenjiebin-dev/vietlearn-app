import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '../components/Text';
import { Button, Card, Empty, SectionTitle, SpeakButton, tap } from '../components/ui';
import { wordByVi } from '../data';
import { allCompounds } from '../data/compounds';
import { sentences, sentenceText } from '../data/sentences';
import { MistakeKind, useProgress } from '../lib/progress';
import { Theme, useStyles, useTheme } from '../theme';

type Row = { kind: MistakeKind; id: string; vi: string; zh: string; count: number };

export default function Mistakes() {
  const { mistakes, removeMistake } = useProgress();
  const s = useStyles(makeStyles);
  const { c } = useTheme();

  const rows: Row[] = Object.values(mistakes)
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .map((m): Row | undefined => {
      if (m.kind === 'word') {
        const w = wordByVi.get(m.id);
        return w && { ...m, vi: w.vi, zh: w.zh };
      }
      if (m.kind === 'sentence') {
        const st = sentences.find((x) => x.zh === m.id);
        return st && { ...m, vi: sentenceText(st), zh: st.zh };
      }
      const cp = allCompounds.find((x) => x.vi === m.id);
      return cp && { ...m, vi: cp.vi, zh: cp.zh };
    })
    .filter((r): r is Row => !!r);

  if (rows.length === 0)
    return <Empty icon="happy-outline" title="错题本是空的 🎉" sub="测验、复习、组词、组句子里答错的题会自动收集到这里。答对 2 次就会自动移出。" />;

  const groups: { kind: MistakeKind; title: string; href: Href; label: string }[] = [
    { kind: 'word', title: '词汇', href: '/quiz/meaning?source=mistakes', label: '练习错词' },
    { kind: 'sentence', title: '句子', href: '/sentences?mistakes=1', label: '练习错句' },
    { kind: 'compound', title: '组词', href: '/compounds?mistakes=1', label: '练习错的组词' },
  ];

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.intro}>答错一次记 2 分，每答对一次减 1 分，减到 0 就自动移出错题本。</Text>
      {groups.map((g) => {
        const list = rows.filter((r) => r.kind === g.kind);
        if (!list.length) return null;
        return (
          <View key={g.kind}>
            <SectionTitle
              title={`${g.title} · ${list.length}`}
              right={<Button label={g.label} kind="soft" icon="play" onPress={() => router.push(g.href)} style={s.practice} />}
            />
            <Card style={{ paddingVertical: 4 }}>
              {list.map((r, i) => (
                <View key={r.id} style={[s.row, i > 0 && s.divider]}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.vi}>{r.vi}</Text>
                    <Text style={s.zh}>
                      {r.zh}
                      <Text style={{ color: c.danger }}>{'  ' + '●'.repeat(r.count)}</Text>
                    </Text>
                  </View>
                  <SpeakButton text={r.vi} size={14} />
                  <Pressable
                    hitSlop={8}
                    accessibilityLabel="移出错题本"
                    onPress={() => { tap(); removeMistake(r.kind, r.id); }}
                    style={{ padding: 6, marginLeft: 6 }}
                  >
                    <Ionicons name="trash-outline" size={16} color={c.faint} />
                  </Pressable>
                </View>
              ))}
            </Card>
          </View>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = ({ c }: Theme) => ({
  container: { padding: 16, paddingBottom: 40 },
  intro: { color: c.sub, fontSize: 12, lineHeight: 17 },
  practice: { paddingVertical: 6, paddingHorizontal: 10 },
  row: { flexDirection: 'row' as const, alignItems: 'center' as const, paddingVertical: 9 },
  divider: { borderTopWidth: 1, borderTopColor: c.border },
  vi: { fontSize: 15, fontWeight: '600' as const, color: c.text },
  zh: { fontSize: 12, color: c.sub, marginTop: 2 },
});
