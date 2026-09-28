import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams, type Href } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Recorder } from '../../components/Recorder';
import { Text } from '../../components/Text';
import { Button, Card, Chip, Empty, SectionTitle, SpeakButton, tap } from '../../components/ui';
import { examplesFor, relatedCompounds, relatedWords, wordByVi } from '../../data';
import { getTopic } from '../../data/topics';
import { wordHref } from '../../lib/links';
import { useProgress } from '../../lib/progress';
import { speakVi } from '../../lib/speech';
import { radius, Theme, useStyles, useTheme } from '../../theme';

/** 单词详情：释义、例句、相关组词、相关单词、跟读 */
export default function WordDetail() {
  const { vi } = useLocalSearchParams<{ vi: string }>();
  const word = wordByVi.get(vi);
  const p = useProgress();
  const s = useStyles(makeStyles);
  const { c } = useTheme();

  if (!word)
    return (
      <>
        <Stack.Screen options={{ title: '单词' }} />
        <Empty icon="help-circle-outline" title="找不到这个词" />
      </>
    );

  const topic = getTopic(word.topicId);
  const fav = p.isFavWord(word.vi);
  const card = p.srs[word.vi];
  const status = p.isKnown(word.vi)
    ? '已掌握 ✓'
    : card
      ? card.due <= p.today
        ? '学习中 · 今天该复习了'
        : `学习中 · ${card.due.slice(5).replace('-', '月')}日复习`
      : '还没学过';
  const examples = examplesFor(word.vi, 3);
  const compounds = relatedCompounds(word.vi);
  const related = relatedWords(word.vi);

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Stack.Screen options={{ title: word.vi }} />

      <Card style={s.hero}>
        <Pressable
          hitSlop={8}
          onPress={() => { tap(); p.toggleFavWord(word.vi); }}
          style={s.fav}
          accessibilityLabel={fav ? '取消收藏' : '收藏单词'}
        >
          <Ionicons name={fav ? 'star' : 'star-outline'} size={22} color={fav ? c.gold : c.faint} />
        </Pressable>
        <Text style={s.vi}>{word.vi}</Text>
        <Text style={s.zh}>{word.zh}</Text>
        {word.note ? <Text style={s.note}>💡 {word.note}</Text> : null}
        <View style={s.speak}>
          <SpeakButton text={word.vi} />
          <SpeakButton text={word.vi} slow />
        </View>
        <View style={s.metaRow}>
          {topic && (
            <Chip label={`${topic.emoji} ${topic.zh}`} color={topic.color} onPress={() => router.push(`/cards/${topic.id}` as Href)} />
          )}
          <Text style={s.status}>{status}</Text>
        </View>
      </Card>

      <View style={s.actions}>
        <Button label="还不会" kind="danger" icon="close" style={{ flex: 1 }} onPress={() => p.setKnown(word.vi, false)} />
        <Button label="记住了" kind="success" icon="checkmark" style={{ flex: 1 }} onPress={() => p.setKnown(word.vi, true)} />
      </View>

      <View style={{ marginTop: 12 }}>
        <Recorder key={word.vi} text={word.vi} />
      </View>

      {examples.length > 0 && (
        <>
          <SectionTitle title="例句" />
          <Card style={s.list}>
            {examples.map((e, i) => (
              <Pressable key={e.vi} onPress={() => { tap(); speakVi(e.vi); }} style={[s.item, i > 0 && s.divider]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemVi}>{e.vi}</Text>
                  <Text style={s.itemZh}>{e.zh}</Text>
                </View>
                <Ionicons name="volume-medium-outline" size={16} color={c.faint} />
              </Pressable>
            ))}
          </Card>
        </>
      )}

      {compounds.length > 0 && (
        <>
          <SectionTitle title="相关组词" />
          <Card style={s.list}>
            {compounds.map((cp, i) => (
              <Pressable key={cp.vi} onPress={() => { tap(); speakVi(cp.vi); }} style={[s.item, i > 0 && s.divider]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemVi}>
                    {cp.vi} <Text style={s.itemZh}>{cp.zh}</Text>
                  </Text>
                  <Text style={s.formula}>{cp.parts.map((x) => `${x.vi}(${x.zh})`).join(' + ')}</Text>
                </View>
                <Ionicons name="volume-medium-outline" size={16} color={c.faint} />
              </Pressable>
            ))}
          </Card>
        </>
      )}

      {related.length > 0 && (
        <>
          <SectionTitle title="相关单词" sub="有相同音节的词，点一个看详情" />
          <View style={s.chips}>
            {related.map((w) => (
              <Pressable key={w.vi} onPress={() => { tap(); router.push(wordHref(w.vi)); }} style={s.chip}>
                <Text style={s.chipVi}>{w.vi}</Text>
                <Text style={s.chipZh} numberOfLines={1}>
                  {w.zh}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  container: { padding: 16, paddingTop: 8, paddingBottom: 40 },
  hero: { alignItems: 'center' as const, paddingTop: 26, paddingBottom: 14 },
  fav: { position: 'absolute' as const, top: 12, right: 12, padding: 4 },
  vi: { fontSize: 34, fontWeight: '800' as const, color: c.text, textAlign: 'center' as const },
  zh: { fontSize: 18, fontWeight: '600' as const, color: c.sub, marginTop: 6, textAlign: 'center' as const },
  note: { fontSize: 12, color: c.goldText, marginTop: 6, textAlign: 'center' as const },
  speak: { flexDirection: 'row' as const, gap: 10, marginTop: 14 },
  metaRow: { flexDirection: 'row' as const, alignItems: 'center' as const, marginTop: 14, alignSelf: 'stretch' as const },
  status: { flex: 1, textAlign: 'right' as const, fontSize: 12, color: c.sub },
  actions: { flexDirection: 'row' as const, gap: 8, marginTop: 12 },
  list: { paddingVertical: 2 },
  item: { flexDirection: 'row' as const, alignItems: 'center' as const, paddingVertical: 9 },
  divider: { borderTopWidth: 1, borderTopColor: c.border },
  itemVi: { fontSize: 15, fontWeight: '600' as const, color: c.text },
  itemZh: { fontSize: 12, fontWeight: '400' as const, color: c.sub, marginTop: 1 },
  formula: { fontSize: 11, color: c.faint, marginTop: 2 },
  chips: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 },
  chip: { ...shadow, backgroundColor: c.card, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 7, maxWidth: '48%' as const },
  chipVi: { fontSize: 14, fontWeight: '600' as const, color: c.text },
  chipZh: { fontSize: 11, color: c.sub, marginTop: 1 },
});
