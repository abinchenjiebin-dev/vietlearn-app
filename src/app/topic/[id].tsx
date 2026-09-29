import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams, type Href } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { Text } from '../../components/Text';
import { Empty, IconName, PressableScale, SpeakButton, tap } from '../../components/ui';
import { allPhrases, wordByVi, type Word } from '../../data';
import { dialogues, type Dialogue } from '../../data/dialogues';
import { getTopic, topics } from '../../data/topics';
import { videos } from '../../data/videos';
import { wordHref } from '../../lib/links';
import { useProgress } from '../../lib/progress';
import { usePreload } from '../../lib/usePreload';
import { speakVi, speakWords } from '../../lib/speech';
import { radius, Theme, useStyles, useTheme } from '../../theme';

type Tab = 'words' | 'phrases' | 'talks';

/** 一个主题：单词、常用语、对话三栏（id = fav 时是“我的收藏”） */
export default function TopicScreen() {
  const { id, tab: initialTab } = useLocalSearchParams<{ id: string; tab?: Tab }>();
  const fav = id === 'fav';
  const topic = getTopic(id) ?? topics[0];
  usePreload(topic);
  const { favorites, favWords, isKnown, setLastVisit } = useProgress();
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const [tab, setTab] = useState<Tab>(initialTab ?? 'words');
  // 同一时间只有一句在逐词播放
  const [playing, setPlaying] = useState<{ vi: string; i: number } | null>(null);

  useEffect(() => {
    if (!fav) setLastVisit('phrases', topic.id);
  }, [fav, setLastVisit, topic.id]);

  const words: Word[] = fav
    ? favWords.map((v) => wordByVi.get(v)).filter((w): w is Word => !!w)
    : topic.words.map((w) => ({ ...w, topicId: topic.id }));
  const phrases: Word[] = fav ? allPhrases.filter((p) => favorites.includes(p.vi)) : topic.phrases.map((p) => ({ ...p, topicId: topic.id }));
  const talks = fav ? [] : dialogues.filter((d) => d.topicId === topic.id);
  const known = words.filter((w) => isKnown(w.vi)).length;

  const tabs: { key: Tab; label: string; n: number }[] = [
    { key: 'words', label: '单词', n: words.length },
    { key: 'phrases', label: '常用语', n: phrases.length },
    ...(talks.length ? [{ key: 'talks' as const, label: '对话', n: talks.length }] : []),
  ];

  const actions: { label: string; icon: IconName; href: string }[] =
    tab === 'words' && words.length
      ? [
          { label: '卡片背诵', icon: 'albums', href: `/cards/${fav ? 'fav' : topic.id}` },
          ...(fav ? [] : [{ label: '测验', icon: 'school' as IconName, href: `/quiz/meaning?topic=${topic.id}` }]),
          ...(!fav && videos.some((v) => v.topicId === topic.id)
            ? [{ label: '看视频', icon: 'play-circle' as IconName, href: `/videos?topic=${topic.id}` }]
            : []),
        ]
      : tab === 'phrases' && phrases.length
        ? [{ label: '跟读练习', icon: 'mic', href: `/shadow/${fav ? 'fav' : topic.id}` }]
        : [];

  const header = (
    <View>
      {!fav && (
        <Text style={s.summary}>
          {topic.vi} · 单词已掌握 {known}/{words.length}
        </Text>
      )}
      <View style={s.segment}>
        {tabs.map((t) => (
          <Pressable key={t.key} onPress={() => { tap(); setTab(t.key); }} style={[s.seg, tab === t.key && s.segOn]}>
            <Text style={[s.segText, tab === t.key && s.segTextOn]}>
              {t.label} <Text style={s.segN}>{t.n}</Text>
            </Text>
          </Pressable>
        ))}
      </View>
      {actions.length > 0 && (
        <View style={s.topActions}>
          {actions.map((a) => (
            <PressableScale key={a.label} onPress={() => { tap(); router.push(a.href as Href); }} style={s.action} scaleTo={0.96}>
              <Ionicons name={a.icon} size={15} color={c.primary} />
              <Text style={s.actionText}>{a.label}</Text>
            </PressableScale>
          ))}
        </View>
      )}
      <Text style={s.hint}>
        {tab === 'words' ? '点单词看详情和例句，☆ 收藏' : tab === 'phrases' ? '点句子朗读，点单词只读这个词，“逐词”一个个读' : '选一个场景，可以听整段，也可以扮演角色'}
      </Text>
    </View>
  );

  const empty = <Empty icon="star-outline" title="还没有收藏" sub={tab === 'words' ? '在单词详情页点 ☆ 收藏单词' : '在句子右边点 ☆ 收藏句子'} />;

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: fav ? '⭐ 我的收藏' : `${topic.emoji} ${topic.zh}` }} />
      {tab === 'words' && (
        <FlatList
          data={words}
          keyExtractor={(w) => w.vi}
          contentContainerStyle={s.list}
          ListHeaderComponent={header}
          ListEmptyComponent={empty}
          renderItem={({ item }) => <WordRow word={item} />}
        />
      )}
      {tab === 'phrases' && (
        <FlatList
          data={phrases}
          keyExtractor={(item) => item.vi}
          extraData={playing}
          contentContainerStyle={s.list}
          ListHeaderComponent={header}
          ListEmptyComponent={empty}
          renderItem={({ item }) => (
            <PhraseRow
              item={item}
              active={playing?.vi === item.vi ? playing.i : -1}
              onWords={() => {
                tap();
                const w = item.vi.split(' ');
                speakWords(
                  w.map((x) => x.replace(/[.,!?]/g, '')),
                  (i) => setPlaying(i < 0 ? null : { vi: item.vi, i }),
                );
              }}
            />
          )}
        />
      )}
      {tab === 'talks' && (
        <FlatList
          data={talks}
          keyExtractor={(d) => d.id}
          contentContainerStyle={s.list}
          ListHeaderComponent={header}
          renderItem={({ item }) => <TalkRow d={item} />}
        />
      )}
    </View>
  );
}

function WordRow({ word }: { word: Word }) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const { isKnown, isFavWord, toggleFavWord } = useProgress();
  const fav = isFavWord(word.vi);
  return (
    <Pressable onPress={() => { tap(); router.push(wordHref(word.vi)); }} style={({ pressed }) => [s.wordRow, pressed && { opacity: 0.85 }]}>
      <View style={s.pic}>
        {word.emoji ? <Text style={s.picEmoji}>{word.emoji}</Text> : <Text style={s.picLetter}>{word.vi.charAt(0).toUpperCase()}</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.vi}>
          {word.vi} {isKnown(word.vi) ? <Text style={{ color: c.success, fontSize: 13 }}>✓</Text> : null}
        </Text>
        <Text style={s.zh}>{word.zh}</Text>
      </View>
      <SpeakButton text={word.vi} size={15} />
      <Pressable hitSlop={6} onPress={() => { tap(); toggleFavWord(word.vi); }} accessibilityLabel="收藏单词" style={s.icon}>
        <Ionicons name={fav ? 'star' : 'star-outline'} size={17} color={fav ? c.gold : c.faint} />
      </Pressable>
    </Pressable>
  );
}

function TalkRow({ d }: { d: Dialogue }) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  return (
    <Pressable onPress={() => { tap(); router.push(`/dialogue/${d.id}` as Href); }} style={({ pressed }) => [s.wordRow, pressed && { opacity: 0.85 }]}>
      <Text style={{ fontSize: 22, marginRight: 10 }}>{d.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.vi}>{d.zh}</Text>
        <Text style={s.zh}>
          {d.scene} · {d.lines.length} 句
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={c.faint} />
    </Pressable>
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
  list: { padding: 16, paddingTop: 6, paddingBottom: 32 },
  summary: { fontSize: 12, color: c.sub, marginBottom: 10 },
  segment: { flexDirection: 'row' as const, backgroundColor: c.cardAlt, borderRadius: radius.sm, padding: 3 },
  seg: { flex: 1, alignItems: 'center' as const, paddingVertical: 8, borderRadius: 8 },
  segOn: { ...shadow, backgroundColor: c.card },
  segText: { fontSize: 14, fontWeight: '600' as const, color: c.sub },
  segTextOn: { color: c.primary },
  segN: { fontSize: 11, fontWeight: '400' as const },
  topActions: { flexDirection: 'row' as const, gap: 8, marginTop: 10 },
  action: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 5,
    backgroundColor: c.primarySoft,
    borderRadius: radius.sm,
    paddingVertical: 9,
  },
  actionText: { fontSize: 13, fontWeight: '700' as const, color: c.primary },
  hint: { fontSize: 11, color: c.faint, marginTop: 10, marginBottom: 8 },
  pic: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: c.cardAlt,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 10,
  },
  picEmoji: { fontSize: 22 },
  picLetter: { fontSize: 16, fontWeight: '700' as const, color: c.faint },
  wordRow: {
    ...shadow,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
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
