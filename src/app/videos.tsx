import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '../components/Text';
import { Chip, Empty, tap } from '../components/ui';
import { getTopic } from '../data/topics';
import { videoKinds, videos, type VideoKind } from '../data/videos';
import { radius, Theme, useStyles } from '../theme';

/** 视频课列表（?topic=xxx 只看某个主题的视频） */
export default function Videos() {
  const { topic } = useLocalSearchParams<{ topic?: string }>();
  const s = useStyles(makeStyles);
  const [kind, setKind] = useState<VideoKind | 'all'>('all');
  const t = topic ? getTopic(topic) : undefined;
  const list = videos.filter((v) => (!t || v.topicId === t.id) && (kind === 'all' || v.kind === kind));

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.intro}>
        {t ? `${t.emoji} ${t.zh}的相关视频。` : ''}
        跟着越南语老师看口型、听讲解。视频来自哔哩哔哩，都是老师本人上传的。
      </Text>
      {!t && (
        <View style={s.chips}>
          <Chip label="全部" active={kind === 'all'} onPress={() => setKind('all')} />
          {videoKinds.map((k) => (
            <Chip key={k.kind} label={`${k.emoji} ${k.zh}`} active={kind === k.kind} onPress={() => setKind(k.kind)} />
          ))}
        </View>
      )}
      {list.length === 0 && <Empty icon="videocam-outline" title="这里还没有视频" />}
      {list.map((v) => {
        const k = videoKinds.find((x) => x.kind === v.kind)!;
        return (
          <Pressable key={v.bvid} onPress={() => { tap(); router.push(`/video/${v.bvid}` as Href); }} style={({ pressed }) => [s.row, pressed && { opacity: 0.85 }]}>
            <View style={s.thumb}>
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={s.len}>{v.minutes} 分钟</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.tag}>
                {k.emoji} {k.zh}
              </Text>
              <Text style={s.title} numberOfLines={2}>
                {v.zh}
              </Text>
              <Text style={s.meta} numberOfLines={1}>
                {v.teacher}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  container: { padding: 16, paddingTop: 8, paddingBottom: 40 },
  intro: { fontSize: 12, color: c.sub, lineHeight: 18, marginBottom: 10 },
  chips: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 6, marginBottom: 10 },
  row: {
    ...shadow,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: c.card,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 8,
  },
  thumb: {
    width: 96,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: c.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  len: { position: 'absolute' as const, right: 5, bottom: 3, fontSize: 10, color: 'rgba(255,255,255,0.9)' },
  tag: { fontSize: 10, color: c.primary, fontWeight: '700' as const },
  title: { fontSize: 14, fontWeight: '700' as const, color: c.text, marginTop: 2 },
  meta: { fontSize: 11, color: c.sub, marginTop: 2 },
});
