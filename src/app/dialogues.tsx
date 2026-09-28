import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { Text } from '../components/Text';
import { PressableScale, tap } from '../components/ui';
import { dialogues } from '../data/dialogues';
import { radius, Theme, useStyles, useTheme } from '../theme';

/** 情景对话列表 */
export default function Dialogues() {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.intro}>出门最常用的 {dialogues.length} 个场景。可以听整段对话，也可以扮演“你”，自己说出你的台词。</Text>
      {dialogues.map((d) => (
        <PressableScale key={d.id} onPress={() => { tap(); router.push(`/dialogue/${d.id}` as Href); }} style={s.row} scaleTo={0.98}>
          <View style={[s.icon, { backgroundColor: d.color + '1F' }]}>
            <Text style={{ fontSize: 20 }}>{d.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{d.zh}</Text>
            <Text style={s.sub} numberOfLines={1}>
              {d.scene} · {d.lines.length} 句
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={c.faint} />
        </PressableScale>
      ))}
    </ScrollView>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  container: { padding: 16, paddingTop: 8, paddingBottom: 40 },
  intro: { fontSize: 12, color: c.sub, lineHeight: 18, marginBottom: 10 },
  row: {
    ...shadow,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 8,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  title: { fontSize: 15, fontWeight: '700' as const, color: c.text },
  sub: { fontSize: 12, color: c.sub, marginTop: 2 },
});
