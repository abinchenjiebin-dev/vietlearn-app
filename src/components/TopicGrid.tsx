import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { topics } from '../data/topics';
import { useProgress } from '../lib/progress';
import { font, radius, Theme, useStyles, useTheme } from '../theme';
import { PressableScale, tap } from './ui';

/** 主题列表：两列紧凑卡片，所有主题直接显示。常用语、词汇两个标签页共用 */
export function TopicGrid({ kind }: { kind: 'phrases' | 'words' }) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const { favorites, isKnown } = useProgress();

  const open = (id: string) => {
    tap();
    router.push((kind === 'phrases' ? `/topic/${id}` : `/cards/${id}`) as Href);
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      {kind === 'phrases' && (
        <PressableScale onPress={() => open('fav')} style={s.fav} scaleTo={0.98}>
          <View style={[s.icon, { backgroundColor: c.goldSoft }]}>
            <Ionicons name="star" size={16} color={c.gold} />
          </View>
          <Text style={s.favText}>我的收藏</Text>
          <Text style={s.count}>{favorites.length} 句</Text>
          <Ionicons name="chevron-forward" size={16} color={c.faint} />
        </PressableScale>
      )}

      <Text style={s.head}>
        {topics.length} 个主题 · {kind === 'phrases' ? '右边数字是句数，点进去听句子' : '进度条是已掌握的词，点进去背单词'}
      </Text>
      <View style={s.grid}>
        {topics.map((t) => {
          const total = kind === 'phrases' ? t.phrases.length : t.words.length;
          const known = kind === 'words' ? t.words.filter((w) => isKnown(w.vi)).length : 0;
          return (
            <PressableScale key={t.id} onPress={() => open(t.id)} style={s.tile} scaleTo={0.97}>
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
                {kind === 'phrases' && <Text style={s.small}>{total}</Text>}
              </View>
              {kind === 'words' ? (
                <View style={s.progressRow}>
                  <View style={s.track}>
                    <View style={[s.fill, { width: `${(known / total) * 100}%`, backgroundColor: t.color }]} />
                  </View>
                  <Text style={s.small}>
                    {known}/{total}
                  </Text>
                </View>
              ) : null}
            </PressableScale>
          );
        })}
      </View>
    </ScrollView>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  container: { padding: 16, paddingTop: 8, paddingBottom: 32 },
  fav: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 14,
    ...shadow,
  },
  favText: { ...font.h3, color: c.text, flex: 1 },
  count: { fontSize: 12, color: c.sub, marginRight: 4 },
  head: { fontSize: 12, color: c.sub, marginBottom: 8, marginLeft: 2 },
  grid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, justifyContent: 'space-between' as const },
  tile: {
    width: '48.8%' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 8,
    ...shadow,
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
  progressRow: { flexDirection: 'row' as const, alignItems: 'center' as const, marginTop: 9, gap: 6 },
  track: { flex: 1, height: 4, borderRadius: 2, backgroundColor: c.cardAlt, overflow: 'hidden' as const },
  fill: { height: 4, borderRadius: 2 },
  small: { fontSize: 11, color: c.sub, fontWeight: '600' as const },
});
