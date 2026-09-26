import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useProgress } from '../lib/progress';
import { DRILL_SIZES } from '../lib/quiz';
import { font, radius, Theme, useStyles, useTheme } from '../theme';
import { PressableScale, tap } from './ui';

/** 每日一刷：自己选题量，所有题型随机混合 */
export function DailyDrill() {
  const { drillSize, setDrillSize } = useProgress();
  const s = useStyles(makeStyles);
  const { c } = useTheme();

  return (
    <View style={s.card}>
      <View style={s.head}>
        <View style={s.icon}>
          <Ionicons name="flash" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>每日一刷</Text>
          <Text style={s.sub}>选择、听音、拼写、声调随机混合</Text>
        </View>
      </View>
      <Text style={s.label}>这次刷几题？</Text>
      <View style={s.sizes}>
        {DRILL_SIZES.map((n) => {
          const on = n === drillSize;
          return (
            <PressableScale
              key={n}
              onPress={() => { tap(); setDrillSize(n); }}
              style={[s.size, on && { backgroundColor: c.primary, borderColor: c.primary }]}
              accessibilityLabel={`${n} 题`}
            >
              <Text style={[s.sizeNum, on && { color: '#fff' }]}>{n}</Text>
              <Text style={[s.sizeUnit, on && { color: 'rgba(255,255,255,0.85)' }]}>题</Text>
            </PressableScale>
          );
        })}
      </View>
      <PressableScale onPress={() => { tap(); router.push(`/quiz/mix?count=${drillSize}` as Href); }} style={s.start}>
        <Text style={s.startText}>开始刷 {drillSize} 题</Text>
        <Ionicons name="arrow-forward" size={15} color="#fff" />
      </PressableScale>
    </View>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  card: { backgroundColor: c.card, borderRadius: radius.md, padding: 12, ...shadow },
  head: { flexDirection: 'row' as const, alignItems: 'center' as const },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: c.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  title: { ...font.h3, color: c.text },
  sub: { fontSize: 12, color: c.sub, marginTop: 1 },
  label: { fontSize: 12, color: c.sub, marginTop: 10, marginBottom: 6 },
  sizes: { flexDirection: 'row' as const, gap: 6 },
  size: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    justifyContent: 'center' as const,
    paddingVertical: 7,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    backgroundColor: c.cardAlt,
  },
  sizeNum: { fontSize: 15, fontWeight: '700' as const, color: c.text },
  sizeUnit: { fontSize: 11, color: c.sub, marginLeft: 2 },
  start: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    backgroundColor: c.primary,
    borderRadius: radius.md,
    paddingVertical: 11,
    marginTop: 10,
  },
  startText: { color: '#fff', fontSize: 15, fontWeight: '700' as const },
});
