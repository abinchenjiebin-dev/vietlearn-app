import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { Empty, SpeakButton, tap } from '../../components/ui';
import { allPhrases } from '../../data';
import { getTopic, topics } from '../../data/topics';
import { useProgress } from '../../lib/progress';
import { speakVi } from '../../lib/speech';
import { radius, Theme, useStyles, useTheme } from '../../theme';

/** 某个主题的常用语（id = fav 时显示收藏） */
export default function TopicPhrases() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const favOnly = id === 'fav';
  const topic = getTopic(id) ?? topics[0];
  const { isFavorite, toggleFavorite, favorites } = useProgress();
  const s = useStyles(makeStyles);
  const { c } = useTheme();

  const data = favOnly ? allPhrases.filter((p) => favorites.includes(p.vi)) : topic.phrases.map((p) => ({ ...p, topicId: topic.id }));

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: favOnly ? '⭐ 我的收藏' : `${topic.emoji} ${topic.zh}` }} />
      <FlatList
        data={data}
        keyExtractor={(item) => item.vi}
        contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 32 }}
        ListHeaderComponent={
          data.length ? (
            <Text style={s.header}>
              {favOnly ? `${data.length} 句` : `${topic.vi} · ${data.length} 句`} · 点句子朗读，长按 🔊 慢速
            </Text>
          ) : null
        }
        ListEmptyComponent={<Empty icon="star-outline" title="还没有收藏" sub="在句子右边点 ☆ 就能收藏，方便以后复习" />}
        renderItem={({ item }) => {
          const fav = isFavorite(item.vi);
          const color = getTopic(item.topicId)?.color ?? c.primary;
          return (
            <Pressable onPress={() => { tap(); speakVi(item.vi); }} style={({ pressed }) => [s.row, pressed && { opacity: 0.85 }]}>
              <View style={[s.bar, { backgroundColor: color }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.vi}>{item.vi}</Text>
                <Text style={s.zh}>{item.zh}</Text>
                {item.note && <Text style={s.note}>💡 {item.note}</Text>}
              </View>
              <View style={s.actions}>
                <SpeakButton text={item.vi} size={15} />
                <Pressable hitSlop={8} onPress={() => { tap(); toggleFavorite(item.vi); }} accessibilityLabel="收藏" style={s.star}>
                  <Ionicons name={fav ? 'star' : 'star-outline'} size={18} color={fav ? c.gold : c.faint} />
                </Pressable>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  header: { color: c.sub, fontSize: 12, marginBottom: 8 },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingRight: 10,
    paddingLeft: 14,
    marginBottom: 8,
    overflow: 'hidden' as const,
    ...shadow,
  },
  bar: { position: 'absolute' as const, left: 0, top: 10, bottom: 10, width: 3, borderRadius: 2 },
  vi: { fontSize: 16, fontWeight: '600' as const, color: c.text },
  zh: { fontSize: 13, color: c.sub, marginTop: 3 },
  note: { fontSize: 11, color: c.goldText, marginTop: 4 },
  actions: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 2, marginLeft: 8 },
  star: { padding: 6 },
});
