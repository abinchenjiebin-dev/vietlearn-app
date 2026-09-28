import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Recorder } from '../../components/Recorder';
import { Text } from '../../components/Text';
import { Button, Card, Empty, ProgressBar, SpeakButton } from '../../components/ui';
import { allPhrases } from '../../data';
import { getTopic, topics } from '../../data/topics';
import { useProgress } from '../../lib/progress';
import { speakVi } from '../../lib/speech';
import { Theme, useStyles, useTheme } from '../../theme';

/** 跟读练习：一句一句地听、录、对比（id = 主题，fav = 收藏的句子） */
export default function Shadow() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { favorites, autoPlay, tick } = useProgress();
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const topic = getTopic(id) ?? topics[0];
  const [list] = useState(() => (id === 'fav' ? allPhrases.filter((p) => favorites.includes(p.vi)) : topic.phrases));
  const [i, setI] = useState(0);
  const item = list[i];

  useEffect(() => {
    if (autoPlay && item) speakVi(item.vi);
  }, [item, autoPlay]);

  const title = <Stack.Screen options={{ title: `🎙 跟读 · ${id === 'fav' ? '收藏' : topic.zh}` }} />;
  if (!item)
    return (
      <>
        {title}
        <Empty icon="mic-outline" title="没有可以跟读的句子" />
      </>
    );

  const go = (d: number) => {
    // 往后翻算完成一次练习
    if (d > 0) tick();
    setI((x) => Math.min(list.length - 1, Math.max(0, x + d)));
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      {title}
      <View style={s.progressRow}>
        <View style={{ flex: 1 }}>
          <ProgressBar value={(i + 1) / list.length} color={c.primary} height={5} />
        </View>
        <Text style={s.count}>
          {i + 1}/{list.length}
        </Text>
      </View>

      <Card style={s.card}>
        <Text style={s.vi}>{item.vi}</Text>
        <Text style={s.zh}>{item.zh}</Text>
        {item.note ? <Text style={s.note}>💡 {item.note}</Text> : null}
        <View style={s.speak}>
          <SpeakButton text={item.vi} />
          <SpeakButton text={item.vi} slow />
        </View>
      </Card>

      <View style={{ marginTop: 12 }}>
        <Recorder key={item.vi} text={item.vi} />
      </View>

      <View style={s.tips}>
        <Ionicons name="bulb-outline" size={14} color={c.goldText} />
        <Text style={s.tipText}>
          跟读小窍门：先用慢速听清每个声调，再用正常速度跟读。对比时重点听声调的高低升降是否一样。
        </Text>
      </View>

      <View style={s.nav}>
        <Button label="上一句" kind="ghost" icon="chevron-back" style={{ flex: 1 }} disabled={i === 0} onPress={() => go(-1)} />
        <Button label={i + 1 >= list.length ? '已是最后一句' : '下一句'} icon="chevron-forward" style={{ flex: 1 }} disabled={i + 1 >= list.length} onPress={() => go(1)} />
      </View>
    </ScrollView>
  );
}

const makeStyles = ({ c }: Theme) => ({
  container: { padding: 16, paddingTop: 8, paddingBottom: 40 },
  progressRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, marginBottom: 12 },
  count: { color: c.sub, fontSize: 12, fontWeight: '600' as const },
  card: { alignItems: 'center' as const, paddingVertical: 26 },
  vi: { fontSize: 24, fontWeight: '700' as const, color: c.text, textAlign: 'center' as const },
  zh: { fontSize: 15, color: c.sub, marginTop: 8, textAlign: 'center' as const },
  note: { fontSize: 12, color: c.goldText, marginTop: 6, textAlign: 'center' as const },
  speak: { flexDirection: 'row' as const, gap: 10, marginTop: 16 },
  tips: { flexDirection: 'row' as const, gap: 6, marginTop: 12, paddingHorizontal: 4 },
  tipText: { flex: 1, fontSize: 12, color: c.goldText, lineHeight: 17 },
  nav: { flexDirection: 'row' as const, gap: 8, marginTop: 16 },
});
