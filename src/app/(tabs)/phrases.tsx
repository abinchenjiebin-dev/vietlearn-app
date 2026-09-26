import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { SpeakButton, TopicPicker, tap } from '../../components/ui';
import { getTopic, topics } from '../../data/topics';
import { useProgress } from '../../lib/progress';
import { speakVi } from '../../lib/speech';
import { colors, radius } from '../../theme';

export default function Phrases() {
  const [topicId, setTopicId] = useState(topics[0].id);
  const topic = getTopic(topicId)!;
  const { isFavorite, toggleFavorite } = useProgress();

  return (
    <View style={{ flex: 1 }}>
      <TopicPicker value={topicId} onChange={setTopicId} />
      <FlatList
        data={topic.phrases}
        keyExtractor={(item) => item.vi}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          <Text style={styles.header}>
            {topic.vi} · {topic.phrases.length} 句 · 点句子朗读
          </Text>
        }
        renderItem={({ item }) => {
          const fav = isFavorite(item.vi);
          return (
            <Pressable
              onPress={() => {
                tap();
                speakVi(item.vi);
              }}
              style={({ pressed }) => [styles.row, { borderLeftColor: topic.color }, pressed && { opacity: 0.85 }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.vi}>{item.vi}</Text>
                <Text style={styles.zh}>{item.zh}</Text>
                {item.note && <Text style={styles.note}>💡 {item.note}</Text>}
              </View>
              <View style={styles.actions}>
                <SpeakButton text={item.vi} size={18} />
                <SpeakButton text={item.vi} size={18} slow color={colors.sub} />
                <Pressable
                  hitSlop={8}
                  onPress={() => {
                    tap();
                    toggleFavorite(item.vi);
                  }}
                  accessibilityLabel="收藏"
                  style={styles.star}
                >
                  <Ionicons name={fav ? 'star' : 'star-outline'} size={20} color={fav ? colors.gold : colors.sub} />
                </Pressable>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { color: colors.sub, fontSize: 13, marginBottom: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  vi: { fontSize: 19, fontWeight: '700', color: colors.text },
  zh: { fontSize: 15, color: colors.sub, marginTop: 4 },
  note: { fontSize: 12, color: '#8A6D00', marginTop: 6 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 8 },
  star: { padding: 4 },
});
