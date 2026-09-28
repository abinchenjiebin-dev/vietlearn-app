import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { dialogues } from '../data/dialogues';
import { topics } from '../data/topics';
import { videos } from '../data/videos';
import { useProgress } from '../lib/progress';
import { font, radius, Theme, useStyles, useTheme } from '../theme';
import { Text } from './Text';
import { PressableScale, tap } from './ui';

/** “学习”页：所有主题（单词 + 常用语 + 对话合在一起），两列紧凑卡片 */
export function TopicGrid() {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const { favorites, favWords, isKnown } = useProgress();

  const open = (href: string) => {
    tap();
    router.push(href as Href);
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.pair}>
        <PressableScale onPress={() => open('/dialogues')} style={s.entry} scaleTo={0.97}>
          <View style={[s.icon, { backgroundColor: c.primary }]}>
            <Ionicons name="chatbubbles" size={16} color={c.onPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.entryTitle}>情景对话</Text>
            <Text style={s.entrySub}>{dialogues.length} 个场景</Text>
          </View>
        </PressableScale>
        <PressableScale onPress={() => open('/topic/fav')} style={s.entry} scaleTo={0.97}>
          <View style={[s.icon, { backgroundColor: c.goldSoft }]}>
            <Ionicons name="star" size={16} color={c.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.entryTitle}>我的收藏</Text>
            <Text style={s.entrySub}>
              {favWords.length} 词 · {favorites.length} 句
            </Text>
          </View>
        </PressableScale>
      </View>

      <PressableScale onPress={() => open('/videos')} style={s.videoEntry} scaleTo={0.98}>
        <View style={[s.icon, { backgroundColor: '#FB7299' }]}>
          <Ionicons name="play" size={16} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.entryTitle}>视频课</Text>
          <Text style={s.entrySub}>{videos.length} 个老师讲解视频 · 发音口型、入门课、日常口语</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={c.faint} />
      </PressableScale>

      <Text style={s.head}>{topics.length} 个主题 · 每个主题里有单词、常用语和对话</Text>
      <View style={s.grid}>
        {topics.map((t) => {
          const known = t.words.filter((w) => isKnown(w.vi)).length;
          const talks = dialogues.filter((d) => d.topicId === t.id).length;
          return (
            <PressableScale key={t.id} onPress={() => open(`/topic/${t.id}`)} style={s.tile} scaleTo={0.97}>
              <View style={s.row}>
                <View style={[s.icon, { backgroundColor: t.color + '1F' }]}>
                  <Text style={s.emoji}>{t.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name} numberOfLines={1}>
                    {t.zh}
                  </Text>
                  <Text style={s.vi} numberOfLines={1}>
                    {t.vi}
                  </Text>
                </View>
              </View>
              <Text style={s.counts}>
                {t.words.length} 词 · {t.phrases.length} 句{talks ? ` · ${talks} 对话` : ''}
              </Text>
              <View style={s.progressRow}>
                <View style={s.track}>
                  <View style={[s.fill, { width: `${(known / t.words.length) * 100}%`, backgroundColor: t.color }]} />
                </View>
                <Text style={s.small}>
                  {known}/{t.words.length}
                </Text>
              </View>
            </PressableScale>
          );
        })}
      </View>
    </ScrollView>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  container: { padding: 16, paddingTop: 8, paddingBottom: 32 },
  pair: { flexDirection: 'row' as const, gap: 8, marginBottom: 8 },
  videoEntry: {
    ...shadow,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 14,
  },
  entry: {
    ...shadow,
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    padding: 10,
  },
  entryTitle: { ...font.h3, color: c.text },
  entrySub: { fontSize: 11, color: c.sub, marginTop: 1 },
  head: { fontSize: 12, color: c.sub, marginBottom: 8, marginLeft: 2 },
  grid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, justifyContent: 'space-between' as const },
  tile: {
    ...shadow,
    width: '48.8%' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 8,
  },
  row: { flexDirection: 'row' as const, alignItems: 'center' as const },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 9,
  },
  emoji: { fontSize: 17 },
  name: { fontSize: 14, fontWeight: '700' as const, color: c.text },
  vi: { fontSize: 11, color: c.faint, marginTop: 1 },
  counts: { fontSize: 11, color: c.sub, marginTop: 8 },
  progressRow: { flexDirection: 'row' as const, alignItems: 'center' as const, marginTop: 5, gap: 6 },
  track: { flex: 1, height: 4, borderRadius: 2, backgroundColor: c.cardAlt, overflow: 'hidden' as const },
  fill: { height: 4, borderRadius: 2 },
  small: { fontSize: 11, color: c.sub, fontWeight: '600' as const },
});
