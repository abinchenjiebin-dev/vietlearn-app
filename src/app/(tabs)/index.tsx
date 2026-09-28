import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '../../components/Text';
import { GradientFill, Lantern } from '../../components/Art';
import { DailyDrill } from '../../components/DailyDrill';
import { Card, Chip, PressableScale, ProgressRing, tap } from '../../components/ui';
import { allWords } from '../../data';
import { currentLevel, getUnit } from '../../data/levels';
import { getTopic } from '../../data/topics';
import { useProgress } from '../../lib/progress';
import { findVietnameseVoice } from '../../lib/speech';
import { NEW_PER_DAY } from '../../lib/srs';
import { addDays } from '../../lib/utils';
import { font, radius, Theme, useStyles, useTheme } from '../../theme';

const GOALS = [10, 20, 30, 50];
const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export default function Home() {
  const p = useProgress();
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const [hasVoice, setHasVoice] = useState<boolean | null>(null);
  const [pickGoal, setPickGoal] = useState(false);
  const [showMonth, setShowMonth] = useState(false);

  useEffect(() => {
    findVietnameseVoice().then(setHasVoice);
  }, []);

  const due = useMemo(() => Object.values(p.srs).filter((x) => x.due <= p.today).length, [p.srs, p.today]);
  const fresh = Math.min(p.newLeftToday(NEW_PER_DAY), allWords.filter((w) => !p.srs[w.vi]).length);
  const learning = Object.keys(p.srs).length;
  const mistakes = Object.keys(p.mistakes).length;
  const pct = p.todayCount / p.goal;
  const last = p.lastVisit ? getTopic(p.lastVisit.id) : undefined;
  const cur = currentLevel(p.levels);
  const curUnit = cur ? getUnit(cur.unitId) : undefined;
  const totalStars = Object.values(p.levels).reduce((n, x) => n + x, 0);
  const done = p.todayCount >= p.goal;

  const d = new Date();
  const dateText = `${d.getMonth() + 1}月${d.getDate()}日 星期${WEEKDAYS[(d.getDay() + 6) % 7]}`;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={s.container}>
        <View style={s.top}>
          <View style={{ flex: 1 }}>
            <Text style={s.date}>{dateText}</Text>
            <Text style={s.hello}>Xin chào! 👋</Text>
          </View>
          <PressableScale onPress={() => router.push('/settings')} style={[s.searchBtn, { marginRight: 8 }]} accessibilityLabel="设置">
            <Ionicons name="settings-outline" size={18} color={c.text} />
          </PressableScale>
          <PressableScale onPress={() => router.push('/search')} style={s.searchBtn} accessibilityLabel="搜索">
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

        {/* 今日目标：紧凑卡片，红色渐变 + 灯笼插画 */}
        <View style={s.hero}>
          <GradientFill from={c.heroFrom} to={c.heroTo} radius={16} />
          <View style={s.lantern1}>
            <Lantern size={62} color="#FFB23F" trim="#FFE7A3" opacity={0.9} />
          </View>
          <View style={s.lantern2}>
            <Lantern size={40} color="#FF7A59" trim="#FFE7A3" opacity={0.75} />
          </View>
          <ProgressRing value={pct} size={62} stroke={6} color="#FFFFFF" track="rgba(255,255,255,0.25)">
            <Text style={s.ringNum}>{p.todayCount}</Text>
            <Text style={s.ringSub}>/{p.goal}</Text>
          </ProgressRing>
          <View style={s.heroRight}>
            <Text style={s.heroTitle}>{done ? '今日目标完成 🎉' : '今日目标'}</Text>
            <Text style={s.heroText}>{done ? '继续保持，明天见～' : `再练 ${p.goal - p.todayCount} 次就达标`}</Text>
            <View style={s.heroRow}>
              <View style={s.streak}>
                <Text style={s.streakText}>🔥 连续 {p.streak} 天</Text>
              </View>
              <Pressable onPress={() => { tap(); setPickGoal((v) => !v); }} hitSlop={8}>
                <Text style={s.goalLink}>调整目标 ›</Text>
              </Pressable>
            </View>
          </View>
        </View>
        {pickGoal && (
          <View style={s.goalRow}>
            {GOALS.map((g) => (
              <Chip key={g} label={`${g} 次/天`} active={p.goal === g} onPress={() => { p.setGoal(g); setPickGoal(false); }} />
            ))}
          </View>
        )}

        {/* 课程闯关：当前这一关 */}
        <View style={s.course}>
          <View style={s.courseIcon}>
            <Text style={{ fontSize: 20 }}>{curUnit?.emoji ?? '🏆'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.contLabel}>
              课程闯关 · ⭐ {totalStars} · ⚡ {p.xp} 经验
            </Text>
            <Text style={s.contTitle}>
              {cur && curUnit ? `第 ${curUnit.n} 单元 ${curUnit.zh} · ${cur.title}` : '全部通关了！🎉'}
            </Text>
            <Pressable onPress={() => router.push('/levels')} hitSlop={8}>
              <Text style={s.courseAll}>查看闯关地图 ›</Text>
            </Pressable>
          </View>
          {cur && (
            <PressableScale onPress={() => router.push(`/level/${cur.id}` as Href)} style={s.courseGo} scaleTo={0.92}>
              <Text style={s.courseGoText}>开始</Text>
            </PressableScale>
          )}
        </View>

        {last && (
          <PressableScale
            onPress={() => router.push((p.lastVisit!.kind === 'cards' ? `/cards/${last.id}` : `/topic/${last.id}`) as Href)}
            style={s.cont}
            scaleTo={0.98}
          >
            <View style={[s.contIcon, { backgroundColor: last.color + '22' }]}>
              <Text style={{ fontSize: 16 }}>{last.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.contLabel}>继续学习</Text>
              <Text style={s.contTitle}>
                {last.zh} · {p.lastVisit!.kind === 'cards' ? '单词卡片' : '单词和常用语'}
              </Text>
            </View>
            <Ionicons name="play-circle" size={26} color={c.primary} />
          </PressableScale>
        )}

        <View style={{ marginTop: 10 }}>
          <DailyDrill />
        </View>

        {/* 智能复习 */}
        <PressableScale onPress={() => router.push('/review')} style={s.review}>
          <View style={s.reviewIcon}>
            <Ionicons name="sparkles" size={18} color={c.onPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.reviewTitle}>智能复习</Text>
            <Text style={s.reviewSub}>
              {due + fresh === 0 ? '今天的复习都完成了 ✓' : `${due} 个待复习 · ${fresh} 个新词`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={c.faint} />
        </PressableScale>

        <View style={s.stats}>
          <Stat n={p.known.length} label="已掌握" />
          <Stat n={learning} label="学习中" />
          <Stat n={mistakes} label="错题" onPress={() => router.push('/mistakes')} />
        </View>

        <Card style={{ marginTop: 10 }}>
          <View style={s.calTop}>
            <Text style={s.calTitle}>{showMonth ? '最近 5 周' : '本周'}</Text>
            <Pressable onPress={() => { tap(); setShowMonth((v) => !v); }} hitSlop={10}>
              <Text style={s.calToggle}>{showMonth ? '收起 ▴' : '展开 ▾'}</Text>
            </Pressable>
          </View>
          <Calendar weeks={showMonth ? 5 : 1} />
          {showMonth && <Text style={s.calHint}>颜色越深，那天练得越多；达到目标的日子会点亮 🔥</Text>}
        </Card>

        <Text style={s.footer}>小技巧：长按任意 🔊 按钮可以慢速播放</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ n, label, onPress }: { n: number; label: string; onPress?: () => void }) {
  const s = useStyles(makeStyles);
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={s.stat}>
      <Text style={s.statNum}>{n}</Text>
      <Text style={s.statLabel}>
        {label}
        {onPress ? ' ›' : ''}
      </Text>
    </Pressable>
  );
}

/** 学习日历：本周或最近 5 周 */
function Calendar({ weeks }: { weeks: number }) {
  const { activity, goal, today } = useProgress();
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const [y, m, d] = today.split('-').map(Number);
  const weekday = (new Date(y, m - 1, d).getDay() + 6) % 7; // 周一 = 0
  const start = addDays(today, -weekday - 7 * (weeks - 1));
  const days = Array.from({ length: 7 * weeks }, (_, i) => addDays(start, i));

  return (
    <View>
      <View style={s.calRow}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={s.calHead}>
            {w}
          </Text>
        ))}
      </View>
      {Array.from({ length: weeks }, (_, row) => (
        <View key={row} style={s.calRow}>
          {days.slice(row * 7, row * 7 + 7).map((day) => {
            const n = activity[day] ?? 0;
            const future = day > today;
            const level = n === 0 ? 0 : n >= goal ? 1 : 0.25 + (0.5 * n) / goal;
            return (
              <View key={day} style={s.calCell}>
                <View
                  style={[
                    s.calDot,
                    {
                      backgroundColor: level ? c.primary + Math.round(level * 255).toString(16).padStart(2, '0') : c.cardAlt,
                      opacity: future ? 0.35 : 1,
                    },
                    day === today && { borderWidth: 1.5, borderColor: c.text },
                  ]}
                >
                  <Text style={[s.calNum, level >= 0.5 && { color: '#fff' }]}>
                    {n >= goal ? '🔥' : Number(day.slice(8))}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  container: { padding: 16, paddingBottom: 40 },
  top: { flexDirection: 'row' as const, alignItems: 'center' as const, marginTop: 6, marginBottom: 14 },
  date: { fontSize: 12, color: c.sub, fontWeight: '600' as const },
  hello: { ...font.hero, color: c.text, marginTop: 2 },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.card,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...shadow,
  },
  warn: { backgroundColor: c.goldSoft, marginBottom: 12 },
  warnText: { color: c.goldText, fontSize: 13, lineHeight: 19 },
  hero: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    overflow: 'hidden' as const,
  },
  lantern1: { position: 'absolute' as const, right: 14, top: -4 },
  lantern2: { position: 'absolute' as const, right: 56, top: -8 },
  ringNum: { color: '#fff', fontSize: 18, fontWeight: '800' as const },
  ringSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: -3 },
  heroRight: { flex: 1, marginLeft: 12, paddingRight: 70 },
  heroTitle: { color: '#fff', fontSize: 15, fontWeight: '700' as const },
  heroText: { color: 'rgba(255,255,255,0.88)', fontSize: 12, marginTop: 2 },
  heroRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, marginTop: 7 },
  streak: {
    backgroundColor: 'rgba(0,0,0,0.16)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  streakText: { color: '#fff', fontWeight: '700' as const, fontSize: 11 },
  goalLink: { color: 'rgba(255,255,255,0.92)', fontSize: 11, fontWeight: '600' as const },
  course: {
    ...shadow,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: c.primary,
  },
  courseIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: c.primarySoft,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 10,
  },
  courseAll: { fontSize: 12, color: c.primary, fontWeight: '700' as const, marginTop: 4 },
  courseGo: { backgroundColor: c.primary, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9 },
  courseGoText: { fontSize: 14, fontWeight: '800' as const, color: c.onPrimary },
  cont: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    padding: 10,
    marginTop: 10,
    ...shadow,
  },
  contIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 10,
  },
  contLabel: { fontSize: 11, color: c.sub },
  contTitle: { fontSize: 14, fontWeight: '700' as const, color: c.text, marginTop: 1 },
  goalRow: { flexDirection: 'row' as const, marginTop: 10 },
  review: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 10,
    ...shadow,
  },
  reviewIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: c.gold,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  reviewTitle: { ...font.h3, color: c.text },
  reviewSub: { fontSize: 12, color: c.sub, marginTop: 2 },
  stats: {
    flexDirection: 'row' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    paddingVertical: 12,
    marginTop: 10,
    ...shadow,
  },
  stat: { flex: 1, alignItems: 'center' as const },
  statNum: { fontSize: 19, fontWeight: '800' as const, color: c.text },
  statLabel: { fontSize: 11, color: c.sub, marginTop: 1 },
  calTop: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: 8 },
  calTitle: { ...font.h3, color: c.text, flex: 1 },
  calToggle: { fontSize: 12, color: c.primary, fontWeight: '700' as const },
  calHint: { fontSize: 11, color: c.faint, marginTop: 6, textAlign: 'center' as const },
  calRow: { flexDirection: 'row' as const },
  calHead: { flex: 1, textAlign: 'center' as const, color: c.faint, fontSize: 11, marginBottom: 4 },
  calCell: { flex: 1, alignItems: 'center' as const, paddingVertical: 2 },
  calDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  calNum: { fontSize: 11, color: c.sub, fontWeight: '600' as const },
  footer: { textAlign: 'center' as const, color: c.faint, fontSize: 11, marginTop: 18 },
});
