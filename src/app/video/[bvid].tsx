import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams, type Href } from 'expo-router';
import React from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';

import { Text } from '../../components/Text';
import { Empty, PressableScale, tap } from '../../components/ui';
import { VideoPlayer } from '../../components/VideoPlayer';
import { getVideo, pageUrl, videoKinds, videos } from '../../data/videos';
import { radius, Theme, useStyles, useTheme } from '../../theme';

/** 播放一个 B 站视频 */
export default function VideoScreen() {
  const { bvid } = useLocalSearchParams<{ bvid: string }>();
  const v = getVideo(bvid);
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  if (!v) return <Empty icon="videocam-off-outline" title="找不到这个视频" />;
  const kind = videoKinds.find((k) => k.kind === v.kind)!;
  const more = videos.filter((x) => x.kind === v.kind && x.bvid !== v.bvid);

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Stack.Screen options={{ title: `${kind.emoji} ${kind.zh}` }} />
      <VideoPlayer bvid={v.bvid} />
      <Text style={s.title}>{v.zh}</Text>
      <Text style={s.meta}>
        视频来自哔哩哔哩 UP 主「{v.teacher}」· 约 {v.minutes} 分钟
      </Text>
      <Text style={s.desc}>{v.desc}</Text>

      <PressableScale onPress={() => { tap(); Linking.openURL(pageUrl(v.bvid)); }} style={s.open} scaleTo={0.97}>
        <Ionicons name="open-outline" size={16} color={c.primary} />
        <Text style={s.openText}>播放不了？去 B 站观看</Text>
      </PressableScale>
      <Text style={s.tip}>小提示：可以横屏全屏看；在 B 站给老师点个赞，支持一下老师。</Text>

      {more.length > 0 && (
        <>
          <Text style={s.moreTitle}>更多{kind.zh}视频</Text>
          {more.map((x) => (
            <Pressable key={x.bvid} onPress={() => { tap(); router.replace(`/video/${x.bvid}` as Href); }} style={({ pressed }) => [s.row, pressed && { opacity: 0.85 }]}>
              <View style={s.play}>
                <Ionicons name="play" size={14} color={c.onPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle} numberOfLines={2}>
                  {x.zh}
                </Text>
                <Text style={s.rowMeta}>
                  {x.teacher} · {x.minutes} 分钟
                </Text>
              </View>
            </Pressable>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  container: { padding: 16, paddingTop: 8, paddingBottom: 40 },
  title: { fontSize: 18, fontWeight: '800' as const, color: c.text, marginTop: 14 },
  meta: { fontSize: 12, color: c.sub, marginTop: 4 },
  desc: { fontSize: 13, color: c.text, marginTop: 8, lineHeight: 19 },
  open: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    backgroundColor: c.primarySoft,
    borderRadius: radius.md,
    paddingVertical: 11,
    marginTop: 14,
  },
  openText: { fontSize: 14, fontWeight: '700' as const, color: c.primary },
  tip: { fontSize: 11, color: c.faint, marginTop: 8, textAlign: 'center' as const },
  moreTitle: { fontSize: 15, fontWeight: '700' as const, color: c.text, marginTop: 22, marginBottom: 8 },
  row: {
    ...shadow,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    backgroundColor: c.card,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 8,
  },
  play: { width: 30, height: 30, borderRadius: 15, backgroundColor: c.primary, alignItems: 'center' as const, justifyContent: 'center' as const },
  rowTitle: { fontSize: 14, fontWeight: '600' as const, color: c.text },
  rowMeta: { fontSize: 11, color: c.sub, marginTop: 2 },
});
