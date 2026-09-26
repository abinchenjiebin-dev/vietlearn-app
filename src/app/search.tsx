import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { Text, TextInput } from '../components/Text';
import { Chip, Empty, SpeakButton, tap } from '../components/ui';
import { searchIndex, SearchItem } from '../data';
import { getTopic } from '../data/topics';
import { speakVi } from '../lib/speech';
import { plain } from '../lib/utils';
import { radius, Theme, useStyles, useTheme } from '../theme';

const KINDS = ['全部', '词汇', '常用语', '组词', '句子'] as const;
const EXAMPLES = ['谢谢', 'cam on', '多少钱', 'pho', '医院', 'nuoc'];

export default function Search() {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<(typeof KINDS)[number]>('全部');

  const results = useMemo(() => {
    const raw = q.trim();
    if (!raw) return [];
    const key = plain(raw);
    const seen = new Set<string>();
    return searchIndex.filter((it) => {
      if (kind !== '全部' && it.kind !== kind) return false;
      const hit = it.zh.includes(raw) || (key && plain(it.vi).includes(key));
      const id = it.kind + it.vi;
      if (!hit || seen.has(id)) return false;
      seen.add(id);
      return true;
    }).slice(0, 100);
  }, [q, kind]);

  return (
    <View style={{ flex: 1 }}>
      <View style={s.searchBox}>
        <Ionicons name="search" size={17} color={c.faint} />
        <TextInput
          value={q}
          onChangeText={setQ}
          autoFocus
          placeholder="搜中文或越南语（可以不打声调）"
          placeholderTextColor={c.faint}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={s.input}
        />
        {q ? (
          <Pressable onPress={() => setQ('')} hitSlop={10} accessibilityLabel="清空">
            <Ionicons name="close-circle" size={20} color={c.faint} />
          </Pressable>
        ) : null}
      </View>
      <View style={s.kinds}>
        {KINDS.map((k) => (
          <Chip key={k} label={k} active={kind === k} onPress={() => setKind(k)} />
        ))}
      </View>

      <FlatList
        data={results}
        keyExtractor={(it) => it.kind + it.vi}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        ListHeaderComponent={q.trim() && results.length ? <Text style={s.count}>找到 {results.length} 条</Text> : null}
        ListEmptyComponent={
          q.trim() ? (
            <Empty icon="search" title="没有找到" sub="换个说法试试，或者去掉声调再搜" />
          ) : (
            <View style={s.examples}>
              <Text style={s.exTitle}>试试搜：</Text>
              <View style={s.exRow}>
                {EXAMPLES.map((e) => (
                  <Chip key={e} label={e} onPress={() => setQ(e)} />
                ))}
              </View>
            </View>
          )
        }
        renderItem={({ item }) => <ResultRow item={item} />}
      />
    </View>
  );
}

function ResultRow({ item }: { item: SearchItem }) {
  const s = useStyles(makeStyles);
  const topic = item.topicId ? getTopic(item.topicId) : undefined;
  return (
    <Pressable onPress={() => { tap(); speakVi(item.vi); }} style={({ pressed }) => [s.row, pressed && { opacity: 0.85 }]}>
      <View style={{ flex: 1 }}>
        <View style={s.tagRow}>
          <Text style={s.tag}>{item.kind}</Text>
          {topic && <Text style={s.topic}>{topic.emoji} {topic.zh}</Text>}
        </View>
        <Text style={s.vi}>{item.vi}</Text>
        <Text style={s.zh}>{item.zh}</Text>
        {item.note ? <Text style={s.note}>💡 {item.note}</Text> : null}
      </View>
      <SpeakButton text={item.vi} size={14} />
    </Pressable>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  searchBox: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    margin: 16,
    marginTop: 10,
    marginBottom: 2,
    paddingHorizontal: 12,
    backgroundColor: c.card,
    borderRadius: radius.md,
    ...shadow,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 10, color: c.text },
  kinds: { flexDirection: 'row' as const, paddingHorizontal: 16, paddingVertical: 8 },
  count: { color: c.sub, fontSize: 12, marginBottom: 6 },
  examples: { paddingTop: 16 },
  exTitle: { color: c.sub, fontSize: 14, marginBottom: 10 },
  exRow: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    padding: 11,
    marginBottom: 8,
    ...shadow,
  },
  tagRow: { flexDirection: 'row' as const, gap: 8, marginBottom: 4 },
  tag: { fontSize: 11, fontWeight: '700' as const, color: c.primary },
  topic: { fontSize: 11, color: c.faint },
  vi: { fontSize: 15, fontWeight: '600' as const, color: c.text },
  zh: { fontSize: 12, color: c.sub, marginTop: 2 },
  note: { fontSize: 12, color: c.goldText, marginTop: 4 },
});
