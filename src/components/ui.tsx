import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Platform, Pressable, PressableProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { Text } from './Text';
import { speakVi } from '../lib/speech';
import { font, radius, useStyles, useTheme, type Theme } from '../theme';

export type IconName = keyof typeof Ionicons.glyphMap;

export const native = Platform.OS !== 'web';

export function tap() {
  if (native) Haptics.selectionAsync().catch(() => {});
}

/** 答对 / 答错的震动反馈 */
export function buzz(ok: boolean) {
  if (native)
    Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(
      () => {},
    );
}

/** 按下时轻微缩小的按钮 */
export function PressableScale({
  style,
  children,
  scaleTo = 0.96,
  dimDisabled = true,
  ...props
}: Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle>; scaleTo?: number; dimDisabled?: boolean; children: React.ReactNode }) {
  const scale = useState(() => new Animated.Value(1))[0];
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: native, speed: 40, bounciness: 6 }).start();
  // 占位相关的样式（flex、宽度、外边距…）放在外层，外观样式放在会缩放的内层
  const outer: Record<string, unknown> = {};
  const inner: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(StyleSheet.flatten(style) ?? {}))
    (LAYOUT_KEYS.has(k) ? outer : inner)[k] = v;
  return (
    <Pressable
      {...props}
      style={outer as ViewStyle}
      onPressIn={(e) => { to(scaleTo); props.onPressIn?.(e); }}
      onPressOut={(e) => { to(1); props.onPressOut?.(e); }}
    >
      <Animated.View style={[inner as ViewStyle, { flexGrow: 1, transform: [{ scale }] }, props.disabled && dimDisabled && { opacity: 0.4 }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const LAYOUT_KEYS = new Set([
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'width',
  'minWidth',
  'maxWidth',
  'alignSelf',
  'position',
  'top',
  'left',
  'right',
  'bottom',
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginHorizontal',
  'marginVertical',
]);

/** 发音按钮：点一下正常语速，长按慢速 */
export function SpeakButton({ text, size = 18, slow = false, color }: { text: string; size?: number; slow?: boolean; color?: string }) {
  const { c } = useTheme();
  const d = size + 16;
  return (
    <PressableScale
      accessibilityLabel={slow ? '慢速朗读' : '朗读'}
      hitSlop={8}
      scaleTo={0.85}
      onPress={() => {
        tap();
        speakVi(text, slow);
      }}
      onLongPress={() => speakVi(text, true)}
      style={{
        width: d,
        height: d,
        borderRadius: d / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: slow ? c.cardAlt : c.primarySoft,
      }}
    >
      <Ionicons name={slow ? 'hourglass-outline' : 'volume-high'} size={size} color={color ?? (slow ? c.sub : c.primary)} />
    </PressableScale>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const s = useStyles(makeStyles);
  return <View style={[s.card, style]}>{children}</View>;
}

export function Chip({ label, active, onPress, color }: { label: string; active?: boolean; onPress: () => void; color?: string }) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const col = color ?? c.primary;
  return (
    <PressableScale
      onPress={() => {
        tap();
        onPress();
      }}
      style={[s.chip, active && { backgroundColor: col, borderColor: col }]}
    >
      <Text style={[s.chipText, active && { color: '#fff' }]}>{label}</Text>
    </PressableScale>
  );
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  icon,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'ghost' | 'soft' | 'success' | 'danger';
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const bg = { primary: c.primary, ghost: c.card, soft: c.primarySoft, success: c.success, danger: c.danger }[kind];
  const fg = kind === 'ghost' ? c.text : kind === 'soft' ? c.primary : '#fff';
  return (
    <PressableScale
      disabled={disabled}
      onPress={() => {
        tap();
        onPress();
      }}
      style={[s.button, { backgroundColor: bg }, kind === 'ghost' && s.ghost, style]}
    >
      {icon && <Ionicons name={icon} size={16} color={fg} style={{ marginRight: 5 }} />}
      <Text style={[s.buttonText, { color: fg }]}>{label}</Text>
    </PressableScale>
  );
}

/** 圆环进度 */
export function ProgressRing({
  value,
  size = 120,
  stroke = 12,
  color,
  track,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
}) {
  const { c } = useTheme();
  const r = (size - stroke) / 2;
  const len = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track ?? c.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? c.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${len} ${len}`}
          strokeDashoffset={len * (1 - v)}
        />
      </Svg>
      {children}
    </View>
  );
}

export function ProgressBar({ value, color, height = 8 }: { value: number; color?: string; height?: number }) {
  const { c } = useTheme();
  const w = useState(() => new Animated.Value(value))[0];
  useEffect(() => {
    Animated.timing(w, { toValue: value, duration: 350, useNativeDriver: false }).start();
  }, [value, w]);
  return (
    <View style={{ height, backgroundColor: c.border, borderRadius: height / 2, overflow: 'hidden' }}>
      <Animated.View
        style={{
          height,
          borderRadius: height / 2,
          backgroundColor: color ?? c.primary,
          width: w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'], extrapolate: 'clamp' }),
        }}
      />
    </View>
  );
}

export function SectionTitle({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.sectionWrap}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[s.section, { flex: 1 }]}>{title}</Text>
        {right}
      </View>
      {sub ? <Text style={s.sectionSub}>{sub}</Text> : null}
    </View>
  );
}

/** 标签页顶部标题栏（画在页面里，背景能一直延伸到屏幕顶部） */
export function TabHeader({ title }: { title: string }) {
  const s = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.tabHeader, { paddingTop: insets.top + 8 }]}>
      <Text style={s.tabTitle}>{title}</Text>
      <SettingsButton />
      <SearchButton />
    </View>
  );
}

/** 标题栏右上角的设置按钮 */
export function SettingsButton() {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityLabel="设置"
      hitSlop={10}
      onPress={() => router.push('/settings')}
      style={({ pressed }) => ({ paddingLeft: 8, opacity: pressed ? 0.5 : 1 })}
    >
      <Ionicons name="settings-outline" size={21} color={c.text} />
    </Pressable>
  );
}

/** 标题栏右上角的搜索按钮 */
export function SearchButton() {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityLabel="搜索"
      hitSlop={10}
      onPress={() => router.push('/search')}
      style={({ pressed }) => ({ paddingHorizontal: 16, opacity: pressed ? 0.5 : 1 })}
    >
      <Ionicons name="search" size={22} color={c.text} />
    </Pressable>
  );
}

export type OptionState = 'idle' | 'right' | 'wrong' | 'dim';

/** 选择题选项：答错会左右晃一下 */
export function OptionButton({ label, sub, state, onPress, big }: { label: string; sub?: string; state: OptionState; onPress: () => void; big?: boolean }) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const shake = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    if (state === 'wrong')
      Animated.sequence(
        [8, -8, 6, -6, 0].map((toValue) => Animated.timing(shake, { toValue, duration: 55, useNativeDriver: native })),
      ).start();
  }, [state, shake]);
  const tone =
    state === 'right'
      ? { backgroundColor: c.successSoft, borderColor: c.success }
      : state === 'wrong'
        ? { backgroundColor: c.dangerSoft, borderColor: c.danger }
        : null;
  return (
    <Animated.View style={{ transform: [{ translateX: shake }], opacity: state === 'dim' ? 0.45 : 1 }}>
      <PressableScale disabled={state !== 'idle'} dimDisabled={false} onPress={onPress} style={[s.option, tone]}>
        <View style={{ flex: 1 }}>
          <Text style={[s.optionText, big && { fontSize: 18 }]}>{label}</Text>
          {sub ? <Text style={s.optionSub}>{sub}</Text> : null}
        </View>
        {state === 'right' && <Ionicons name="checkmark-circle" size={20} color={c.success} />}
        {state === 'wrong' && <Ionicons name="close-circle" size={20} color={c.danger} />}
      </PressableScale>
    </Animated.View>
  );
}

/** 从下方弹出的结果条 */
export function Feedback({ ok, title, children }: { ok: boolean; title: string; children?: React.ReactNode }) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const y = useState(() => new Animated.Value(30))[0];
  const o = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    Animated.parallel([
      Animated.spring(y, { toValue: 0, useNativeDriver: native, bounciness: 8 }),
      Animated.timing(o, { toValue: 1, duration: 180, useNativeDriver: native }),
    ]).start();
  }, [y, o]);
  return (
    <Animated.View style={[s.feedback, { backgroundColor: ok ? c.successSoft : c.dangerSoft, opacity: o, transform: [{ translateY: y }] }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: children ? 6 : 0 }}>
        <Ionicons name={ok ? 'checkmark-circle' : 'alert-circle'} size={18} color={ok ? c.success : c.danger} />
        <Text style={[s.fbTitle, { color: ok ? c.success : c.danger }]}>{title}</Text>
      </View>
      {children}
    </Animated.View>
  );
}

/** 空状态 */
export function Empty({ icon, title, sub, children }: { icon: IconName; title: string; sub?: string; children?: React.ReactNode }) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Ionicons name={icon} size={28} color={c.primary} />
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      {sub ? <Text style={s.emptySub}>{sub}</Text> : null}
      {children}
    </View>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  card: { backgroundColor: c.card, borderRadius: radius.lg, padding: 14, ...shadow },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    backgroundColor: c.card,
    marginRight: 6,
  },
  chipText: { fontSize: 13, color: c.text, fontWeight: '600' as const },
  button: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.md,
  },
  ghost: { borderWidth: StyleSheet.hairlineWidth, borderColor: c.border },
  buttonText: { fontSize: 15, fontWeight: '700' as const },
  tabHeader: { flexDirection: 'row' as const, alignItems: 'center' as const, paddingLeft: 16, paddingBottom: 6 },
  tabTitle: { flex: 1, fontSize: 22, fontWeight: '800' as const, color: c.text, letterSpacing: -0.3 },
  sectionWrap: { marginTop: 22, marginBottom: 10 },
  section: { ...font.title, color: c.text },
  sectionSub: { fontSize: 12, color: c.sub, marginTop: 3, lineHeight: 17 },
  option: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: c.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  optionText: { fontSize: 16, fontWeight: '600' as const, color: c.text },
  optionSub: { fontSize: 11, color: c.sub, marginTop: 2 },
  feedback: { borderRadius: radius.md, padding: 12, marginTop: 12 },
  fbTitle: { fontSize: 14, fontWeight: '700' as const, marginLeft: 5 },
  empty: { alignItems: 'center' as const, paddingVertical: 48, paddingHorizontal: 24 },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: c.primarySoft,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  emptyTitle: { ...font.h3, color: c.text, textAlign: 'center' as const },
  emptySub: { fontSize: 13, color: c.sub, textAlign: 'center' as const, marginTop: 6, lineHeight: 19 },
});
