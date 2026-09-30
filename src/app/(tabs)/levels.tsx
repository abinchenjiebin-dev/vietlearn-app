import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Text } from '../../components/Text';
import { IconName, PressableScale, TabHeader, tap } from '../../components/ui';
import { allLevels, currentLevel, isOpen, units, type LevelKind } from '../../data/levels';
import { useProgress } from '../../lib/progress';
import { radius, Theme, useStyles, useTheme } from '../../theme';

const ICON: Record<LevelKind, IconName> = {
  tones: 'musical-notes',
  letters: 'text',
  toneBoss: 'trophy',
  words: 'book',
  phrases: 'chatbubble-ellipses',
  dialogue: 'people',
  boss: 'trophy',
};

// 关卡节点左右错开，走出一条弯弯的路
const OFFSETS = [0, 46, 70, 46, 0, -46, -70, -46];

/** 闯关地图 */
export default function Levels() {
  const p = useProgress();
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const [hint, setHint] = useState<string | null>(null);
  const cur = currentLevel(p.levels);
  const passed = allLevels.filter((l) => p.levels[l.id]).length;
  const stars = Object.values(p.levels).reduce((n, x) => n + x, 0);

  // 打开地图时自动滚到当前关卡（不然学到后面几个单元，看起来像是又从第一关开始）。
  // 记下每个单元、每个关卡的位置；进度读取完、排版稳定后再滚，过了新关卡回来也会重新滚
  const scroll = useRef<ScrollView>(null);
  const unitY = useRef<Record<string, number>>({});
  const nodeY = useRef<Record<string, number>>({});
  useEffect(() => {
    if (!p.loaded || !cur) return;
    const t = setTimeout(() => {
      const uy = unitY.current[cur.unitId];
      const ny = nodeY.current[cur.id];
      if (uy !== undefined && ny !== undefined) scroll.current?.scrollTo({ y: Math.max(0, uy + ny - 180), animated: false });
    }, 300);
    return () => clearTimeout(t);
  }, [p.loaded, cur]);

  return (
    <View style={{ flex: 1 }}>
      <TabHeader title="闯关" />
      <ScrollView ref={scroll} contentContainerStyle={s.container}>
      <View style={s.summary}>
        <Stat icon="flag" color={c.primary} value={`${passed}/${allLevels.length}`} label="关卡" />
        <Stat icon="star" color={c.gold} value={`${stars}`} label="星星" />
        <Stat icon="flash" color="#E4572E" value={`${p.xp}`} label="经验值" />
      </View>

      {units.map((u) => {
        const done = u.levels.every((l) => p.levels[l.id]);
        return (
          <View
            key={u.id}
            style={{ marginTop: 18 }}
            onLayout={(e) => {
              unitY.current[u.id] = e.nativeEvent.layout.y;
            }}
          >
            <View style={[s.unit, { backgroundColor: u.color }]}>
              <Text style={s.unitEmoji}>{u.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.unitNo}>第 {u.n} 单元{done ? ' · 👑 已完成' : ''}</Text>
                <Text style={s.unitTitle}>{u.zh}</Text>
                <Text style={s.unitGoal}>{u.goal}</Text>
              </View>
            </View>

            {u.levels.map((l, i) => {
              const got = p.levels[l.id] ?? 0;
              const open = isOpen(l, p.levels);
              const isCur = cur?.id === l.id;
              const boss = l.kind === 'boss' || l.kind === 'toneBoss';
              return (
                <View
                  key={l.id}
                  style={[s.nodeRow, { transform: [{ translateX: OFFSETS[i % OFFSETS.length] }] }]}
                  onLayout={(e) => {
                    nodeY.current[l.id] = e.nativeEvent.layout.y;
                  }}
                >
                  {isCur && (
                    <View style={s.bubble}>
                      <Text style={s.bubbleText}>开始</Text>
                    </View>
                  )}
                  <PressableScale
                    onPress={() => {
                      tap();
                      if (open) router.push(`/level/${l.id}` as Href);
                      else setHint(l.id);
                    }}
                    style={[
                      s.node,
                      boss && s.boss,
                      got > 0 && { backgroundColor: boss ? c.gold : u.color, borderColor: 'rgba(0,0,0,0.12)' },
                      isCur && { backgroundColor: c.primary, borderColor: c.primarySoft, borderWidth: 6 },
                      !open && s.locked,
                    ]}
                    scaleTo={0.9}
                    accessibilityLabel={l.title}
                  >
                    <Ionicons
                      name={open ? ICON[l.kind] : 'lock-closed'}
                      size={boss ? 28 : 24}
                      color={got > 0 || isCur ? '#fff' : c.faint}
                    />
                  </PressableScale>
                  <Text style={[s.nodeTitle, !open && { color: c.faint }]}>{hint === l.id ? '先通过前面的关卡' : l.title}</Text>
                  {got > 0 && (
                    <Text style={s.nodeStars}>
                      {'★'.repeat(got)}
                      <Text style={{ color: c.border }}>{'★'.repeat(3 - got)}</Text>
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}
      <Text style={s.end}>🏁 全部通关后，你就能应付在越南的日常生活了！</Text>
    </ScrollView>
    </View>
  );
}

function Stat({ icon, color, value, label }: { icon: IconName; color: string; value: string; label: string }) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.stat}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  container: { padding: 16, paddingTop: 8, paddingBottom: 48 },
  summary: { ...shadow, flexDirection: 'row' as const, backgroundColor: c.card, borderRadius: radius.md, paddingVertical: 12 },
  stat: { flex: 1, alignItems: 'center' as const, gap: 2 },
  statValue: { fontSize: 17, fontWeight: '800' as const, color: c.text },
  statLabel: { fontSize: 11, color: c.sub },
  unit: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12, borderRadius: radius.md, padding: 14, marginBottom: 6 },
  unitEmoji: { fontSize: 30 },
  unitNo: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '700' as const },
  unitTitle: { fontSize: 18, fontWeight: '800' as const, color: '#fff' },
  unitGoal: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 1 },
  nodeRow: { alignItems: 'center' as const, marginTop: 14 },
  node: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: c.card,
    borderWidth: 3,
    borderColor: c.border,
    borderBottomWidth: 6,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  boss: { width: 76, height: 76, borderRadius: 38 },
  locked: { backgroundColor: c.cardAlt },
  nodeTitle: { fontSize: 12, fontWeight: '600' as const, color: c.text, marginTop: 5 },
  nodeStars: { fontSize: 12, color: c.gold, letterSpacing: 1 },
  bubble: {
    backgroundColor: c.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 6,
  },
  bubbleText: { fontSize: 12, fontWeight: '800' as const, color: c.onPrimary },
  end: { textAlign: 'center' as const, fontSize: 12, color: c.sub, marginTop: 26 },
});
