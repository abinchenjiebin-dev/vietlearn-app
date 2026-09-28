import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientFill, Lantern } from '../../components/Art';
import { Text } from '../../components/Text';
import { Card, Chip, IconName, PressableScale, ProgressRing, tap } from '../../components/ui';
import { allWords } from '../../data';
import { currentLevel, getUnit } from '../../data/levels';
import { useProgress } from '../../lib/progress';
import { findVietnameseVoice } from '../../lib/speech';
import { NEW_PER_DAY } from '../../lib/srs';
import { addDays } from '../../lib/utils';
import { font, radius, Theme, useStyles, useTheme } from '../../theme';

const GOALS = [10, 20, 30, 50];
const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

/** 首页：只回答“今天要做什么”——今日目标 + 三个今日任务 */
export default function Home() {
  const p = useProgress();
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const [hasVoice, setHasVoice] = useState<boolean | null>(null);
  const [pickGoal, setPickGoal] = useState(false);

  useEffect(() => {
    findVietnameseVoice().then(setHasVoice);
  }, []);

  const due = useMemo(() => Object.values(p.srs).filter((x) => x.due <= p.today).length, [p.srs, p.today]);
  const fresh = Math.min(p.newLeftToday(NEW_PER_DAY), allWords.filter((w) => !p.srs[w.vi]).length);
  const cur = currentLevel(p.levels);
  const curUnit = cur ? getUnit(cur.unitId) : undefined;
  const totalStars = Object.values(p.levels).reduce((n, x) => n + x, 0);
  const done = p.todayCount >= p.goal;

  const d = new Date();
  const dateText = `${d.getMonth() + 1}月${d.getDate()}日 星期${WEEKDAYS[(d.getDay() + 6) % 7]}`;

  const tasks: { icon: IconName; color: string; title: string; sub: string; done?: boolean; href: string }[] = [
    {
      icon: 'map',
      color: c.primary,
      title: cur && curUnit ? `闯关：第 ${curUnit.n} 单元 · ${cur.title}` : '闯关：全部通关了！',
      sub: `${curUnit ? `${curUnit.emoji} ${curUnit.zh} · ` : ''}⭐ ${totalStars} · ⚡ ${p.xp} 经验`,
      done: !cur,
      href: cur ? `/level/${cur.id}` : '/levels',
    },
    {
      icon: 'sparkles',
      color: c.gold,
      title: '智能复习',
      sub: due + fresh ? `${due} 个待复习 · ${fresh} 个新词` : '今天的复习都完成了',
      done: due + fresh === 0,
      href: '/review',
    },
    {
      icon: 'flash',
      color: '#E4572E',
      title: `每日一刷 · ${p.drillSize} 题`,
      sub: '选择、听音、拼写、声调随机混合',
      href: `/quiz/mix?count=${p.drillSize}`,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={s.container}>
        <View style={s.top}>
          <View style={{ flex: 1 }}>
            <Text style={s.date}>{dateText}</Text>
            <Text style={s.hello}>Xin chào! 👋</Text>
          </View>
          <PressableScale onPress={() => router.push('/settings')} style={[s.roundBtn, { marginRight: 8 }]} accessibilityLabel="设置">
            <Ionicons name="settings-outline" size={18} color={c.text} />
          </PressableScale>
          <PressableScale onPress={() => router.push('/search')} style={s.roundBtn} accessibilityLabel="搜索">
            <Ionicons name="search" size={19} color={c.text} />
          </PressableScale>
        </View>

        {hasVoice === false && Platform.OS === 'ios' && (
          <Card style={s.warn}>
            <Text style={s.warnText}>
              没有检测到越南语语音。请到 iPhone「设置 → 辅助功能 → 朗读内容 → 声音」里下载越南语（Linh）。
            </Text>
          </Card>
        )}

        {/* 今日目标 + 本周打卡 */}
        <View style={s.hero}>
          <GradientFill from={c.heroFrom} to={c.heroTo} radius={16} />
          <View style={s.lantern1}>
            <Lantern size={58} color="#FFB23F" trim="#FFE7A3" opacity={0.9} />
          </View>
          <View style={s.lantern2}>
            <Lantern size={38} color="#FF7A59" trim="#FFE7A3" opacity={0.75} />
          </View>
          <View style={s.heroRow}>
            <ProgressRing value={p.todayCount / p.goal} size={62} stroke={6} color="#FFFFFF" track="rgba(255,255,255,0.25)">
              <Text style={s.ringNum}>{p.todayCount}</Text>
              <Text style={s.ringSub}>/{p.goal}</Text>
            </ProgressRing>
            <View style={s.heroText}>
              <Text style={s.heroTitle}>{done ? '今日目标完成 🎉' : '今日目标'}</Text>
              <Text style={s.heroSub}>{done ? '继续保持，明天见～' : `再练 ${p.goal - p.todayCount} 次就达标`}</Text>
              <View style={s.heroMeta}>
                <Text style={s.streak}>🔥 连续 {p.streak} 天</Text>
                <Pressable onPress={() => { tap(); setPickGoal((v) => !v); }} hitSlop={8}>
                  <Text style={s.goalLink}>调整目标 ›</Text>
                </Pressable>
              </View>
            </View>
          </View>
          <Week />
        </View>
        {pickGoal && (
          <View style={s.goalRow}>
            {GOALS.map((g) => (
              <Chip key={g} label={`${g} 次/天`} active={p.goal === g} onPress={() => { p.setGoal(g); setPickGoal(false); }} />
            ))}
          </View>
        )}

        <Text style={s.section}>今日任务</Text>
        {tasks.map((t) => (
          <PressableScale key={t.title} onPress={() => router.push(t.href as Href)} style={s.task} scaleTo={0.98}>
            <View style={[s.taskIcon, { backgroundColor: t.done ? c.successSoft : t.color + '22' }]}>
              <Ionicons name={t.done ? 'checkmark' : t.icon} size={18} color={t.done ? c.success : t.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.taskTitle, t.done && { color: c.sub }]} numberOfLines={1}>
                {t.title}
              </Text>
              <Text style={s.taskSub} numberOfLines={1}>
                {t.sub}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={c.faint} />
          </PressableScale>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/** 本周 7 天：达标的一天点亮 🔥 */
function Week() {
  const { activity, goal, today } = useProgress();
  const s = useStyles(makeStyles);
  const [y, m, d] = today.split('-').map(Number);
  const weekday = (new Date(y, m - 1, d).getDay() + 6) % 7; // 周一 = 0
  const start = addDays(today, -weekday);
  return (
    <View style={s.week}>
      {WEEKDAYS.map((w, i) => {
        const day = addDays(start, i);
        const n = activity[day] ?? 0;
        const isToday = day === today;
        return (
          <View key={w} style={s.weekCell}>
            <Text style={s.weekDay}>{w}</Text>
            <View style={[s.weekDot, n > 0 && s.weekDotOn, isToday && s.weekToday]}>
              <Text style={s.weekNum}>{n >= goal ? '🔥' : n > 0 ? '·' : ''}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  container: { padding: 16, paddingBottom: 32 },
  top: { flexDirection: 'row' as const, alignItems: 'center' as const, marginTop: 6, marginBottom: 14 },
  date: { fontSize: 12, color: c.sub, fontWeight: '600' as const },
  hello: { ...font.hero, color: c.text, marginTop: 2 },
  roundBtn: {
    ...shadow,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.card,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  warn: { backgroundColor: c.goldSoft, marginBottom: 12 },
  warnText: { color: c.goldText, fontSize: 13, lineHeight: 19 },
  hero: { borderRadius: radius.lg, padding: 14, overflow: 'hidden' as const },
  lantern1: { position: 'absolute' as const, right: 14, top: -4 },
  lantern2: { position: 'absolute' as const, right: 54, top: -8 },
  heroRow: { flexDirection: 'row' as const, alignItems: 'center' as const },
  ringNum: { color: '#fff', fontSize: 18, fontWeight: '800' as const },
  ringSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: -3 },
  heroText: { flex: 1, marginLeft: 12, paddingRight: 64 },
  heroTitle: { color: '#fff', fontSize: 15, fontWeight: '700' as const },
  heroSub: { color: 'rgba(255,255,255,0.88)', fontSize: 12, marginTop: 2 },
  heroMeta: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, marginTop: 6 },
  streak: {
    color: '#fff',
    fontWeight: '700' as const,
    fontSize: 11,
    backgroundColor: 'rgba(0,0,0,0.16)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden' as const,
  },
  goalLink: { color: 'rgba(255,255,255,0.92)', fontSize: 11, fontWeight: '600' as const },
  week: {
    flexDirection: 'row' as const,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  weekCell: { flex: 1, alignItems: 'center' as const },
  weekDay: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  weekDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  weekDotOn: { backgroundColor: 'rgba(255,255,255,0.35)' },
  weekToday: { borderWidth: 1.5, borderColor: '#fff' },
  weekNum: { fontSize: 11, color: '#fff', fontWeight: '800' as const },
  goalRow: { flexDirection: 'row' as const, marginTop: 10 },
  section: { ...font.h3, color: c.text, marginTop: 20, marginBottom: 8 },
  task: {
    ...shadow,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  taskIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center' as const, justifyContent: 'center' as const },
  taskTitle: { fontSize: 15, fontWeight: '700' as const, color: c.text },
  taskSub: { fontSize: 12, color: c.sub, marginTop: 2 },
});
