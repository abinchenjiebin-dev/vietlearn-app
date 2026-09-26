import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { Text } from '../../components/Text';
import { Empty, SpeakButton, tap } from '../../components/ui';
import { allPhrases, type Word } from '../../data';
import { getTopic, topics } from '../../data/topics';
import { useProgress } from '../../lib/progress';
import { speakVi, speakWords } from '../../lib/speech';
import { radius, Theme, useStyles, useTheme } from '../../theme';

/** 某个主题的常用语（id = fav 时显示收藏） */
export default function TopicPhrases() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const favOnly = id === 'fav';
  const topic = getTopic(id) ?? topics[0];
  const { favorites, setLastVisit } = useProgress();
  const s = useStyles(makeStyles);
  // 同一时间只有一句在逐词播放
  const [playing, setPlaying] = useState<{ vi: string; i: number } | null>(null);

  useEffect(() => {
    if (!favOnly) setLastVisit('phrases', topic.id);
  }, [favOnly, setLastVisit, topic.id]);

  const data = favOnly ? allPhrases.filter((p) => favorites.includes(p.vi)) : topic.phrases.map((p) => ({ ...p, topicId: topic.id }));

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: favOnly ? '⭐ 我的收藏' : `${topic.emoji} ${topic.zh}` }} />
      <FlatList
        data={data}
        keyExtractor={(item) => item.vi}
        extraData={playing}
        contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 32 }}
        ListHeaderComponent={
          data.length ? (
            <Text style={s.header}>
              {favOnly ? `${data.length} 句` : `${topic.vi} · ${data.length} 句`} · 点句子朗读，点单词只读这个词
            </Text>
          ) : null
        }
        ListEmptyComponent={<Empty icon="star-outline" title="还没有收藏" sub="在句子右边点 ☆ 就能收藏，方便以后复习" />}
        renderItem={({ item }) => (
          <PhraseRow
            item={item}
            active={playing?.vi === item.vi ? playing.i : -1}
            onWords={() => {
              tap();
              const words = item.vi.split(' ');
              speakWords(
                words.map((w) => w.replace(/[.,!?]/g, '')),
                (i) => setPlaying(i < 0 ? null : { vi: item.vi, i }),
              );
            }}
          />
        )}
      />
    </View>
  );
}

function PhraseRow({ item, active, onWords }: { item: Word; active: number; onWords: () => void }) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const { isFavorite, toggleFavorite } = useProgress();
  const fav = isFavorite(item.vi);
  const color = getTopic(item.topicId)?.color ?? c.primary;
  const words = item.vi.split(' ');

  return (
    <Pressable onPress={() => { tap(); speakVi(item.vi); }} style={({ pressed }) => [s.row, pressed && { opacity: 0.9 }]}>
      <View style={[s.bar, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <View style={s.words}>
          {words.map((w, i) => (
            <Pressable
              key={i}
              hitSlop={3}
              onPress={() => { tap(); speakVi(w.replace(/[.,!?]/g, '')); }}
              style={[s.word, i === active && { backgroundColor: c.primarySoft }]}
            >
              <Text style={[s.vi, i === active && { color: c.primary }]}>{w}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={s.zh}>{item.zh}</Text>
        {item.note && <Text style={s.note}>💡 {item.note}</Text>}
      </View>
      <View style={s.actions}>
        <SpeakButton text={item.vi} size={15} />
        <Pressable hitSlop={6} onPress={onWords} accessibilityLabel="逐词播放" style={s.icon}>
          <Ionicons name="list" size={17} color={active >= 0 ? c.primary : c.sub} />
          <Text style={[s.iconText, active >= 0 && { color: c.primary }]}>逐词</Text>
        </Pressable>
        <Pressable hitSlop={6} onPress={() => { tap(); toggleFavorite(item.vi); }} accessibilityLabel="收藏" style={s.icon}>
          <Ionicons name={fav ? 'star' : 'star-outline'} size={17} color={fav ? c.gold : c.faint} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  header: { color: c.sub, fontSize: 12, marginBottom: 8 },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingRight: 6,
    paddingLeft: 12,
    marginBottom: 8,
    overflow: 'hidden' as const,
    ...shadow,
  },
  bar: { position: 'absolute' as const, left: 0, top: 10, bottom: 10, width: 3, borderRadius: 2 },
  words: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, marginLeft: -3 },
  word: { borderRadius: 5, paddingHorizontal: 3 },
  vi: { fontSize: 16, fontWeight: '600' as const, color: c.text },
  zh: { fontSize: 13, color: c.sub, marginTop: 3 },
  note: { fontSize: 11, color: c.goldText, marginTop: 4 },
  actions: { flexDirection: 'row' as const, alignItems: 'center' as const, marginLeft: 6 },
  icon: { alignItems: 'center' as const, paddingHorizontal: 5, paddingVertical: 4 },
  iconText: { fontSize: 9, color: c.sub, marginTop: 1 },
});
