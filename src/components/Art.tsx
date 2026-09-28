// 装饰插画：会安灯笼、莲花（越南国花）、渐变背景。全部是矢量图，任何屏幕都清晰
import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, G, Line, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '../theme';

/** 会安灯笼 */
export function Lantern({ size = 60, color = '#E63946', trim = '#F4C542', opacity = 1 }: { size?: number; color?: string; trim?: string; opacity?: number }) {
  return (
    <Svg width={size * 0.6} height={size} viewBox="0 0 60 100" opacity={opacity}>
      <Line x1="30" y1="0" x2="30" y2="13" stroke={trim} strokeWidth="1.5" />
      <Rect x="19" y="11" width="22" height="6" rx="2" fill={trim} />
      <Ellipse cx="30" cy="47" rx="25" ry="31" fill={color} />
      <Ellipse cx="30" cy="47" rx="16" ry="31" fill="none" stroke={trim} strokeOpacity="0.55" strokeWidth="1.2" />
      <Ellipse cx="30" cy="47" rx="7" ry="31" fill="none" stroke={trim} strokeOpacity="0.55" strokeWidth="1.2" />
      <Ellipse cx="30" cy="47" rx="25" ry="31" fill="none" stroke={trim} strokeOpacity="0.8" strokeWidth="1.2" />
      <Ellipse cx="22" cy="36" rx="5" ry="9" fill="#fff" opacity="0.18" />
      <Rect x="21" y="76" width="18" height="5" rx="2" fill={trim} />
      <G stroke={trim} strokeWidth="1.3">
        <Line x1="30" y1="81" x2="30" y2="99" />
        <Line x1="27" y1="81" x2="25" y2="96" />
        <Line x1="33" y1="81" x2="35" y2="96" />
      </G>
    </Svg>
  );
}

/** 莲花 */
export function Lotus({ size = 100, color = '#E86A92', opacity = 1 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <Svg width={size} height={size * 0.6} viewBox="0 0 100 60" opacity={opacity}>
      <Path d="M50 57 C28 58, 8 48, 2 36 C20 34, 38 42, 50 57 Z" fill={color} opacity="0.55" />
      <Path d="M50 57 C72 58, 92 48, 98 36 C80 34, 62 42, 50 57 Z" fill={color} opacity="0.55" />
      <Path d="M50 55 C30 50, 18 35, 20 16 C35 21, 46 34, 50 55 Z" fill={color} opacity="0.8" />
      <Path d="M50 55 C70 50, 82 35, 80 16 C65 21, 54 34, 50 55 Z" fill={color} opacity="0.8" />
      <Path d="M50 3 C63 18, 63 40, 50 56 C37 40, 37 18, 50 3 Z" fill={color} />
    </Svg>
  );
}

/** 整个 App 的背景：暖色渐变 + 两团柔光 + 右下角莲花水印 */
export function AppBackground({ glow = true }: { glow?: boolean }) {
  const { c, isDark } = useTheme();
  const id = useId().replace(/:/g, '');
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={`bg${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.bgTop} />
            <Stop offset="0.04" stopColor={c.bgTop} />
            <Stop offset="0.4" stopColor={c.bg} />
            <Stop offset="1" stopColor={c.bg} />
          </LinearGradient>
          <RadialGradient id={`red${id}`} cx="0%" cy="0%" rx="75%" ry="40%" fx="0%" fy="0%">
            <Stop offset="0" stopColor={c.primary} stopOpacity={isDark ? 0.22 : 0.12} />
            <Stop offset="1" stopColor={c.primary} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id={`gold${id}`} cx="100%" cy="6%" rx="65%" ry="30%" fx="100%" fy="6%">
            <Stop offset="0" stopColor={c.gold} stopOpacity={isDark ? 0.1 : 0.12} />
            <Stop offset="1" stopColor={c.gold} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#bg${id})`} />
        {glow && <Rect width="100%" height="100%" fill={`url(#red${id})`} />}
        {glow && <Rect width="100%" height="100%" fill={`url(#gold${id})`} />}
      </Svg>
      <View style={{ position: 'absolute', right: -24, bottom: 70 }}>
        <Lotus size={170} color="#E86A92" opacity={isDark ? 0.08 : 0.07} />
      </View>
    </View>
  );
}

/** 填满父容器的斜向渐变（卡片底色用） */
export function GradientFill({ from, to, radius = 0 }: { from: string; to: string; radius?: number }) {
  const id = `card${useId().replace(/:/g, '')}`;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/**
 * 声调走势图（五度标调法，5 最高 1 最低，北方音）
 * 顺序：平声 33、玄声 21、锐声 35、问声 313、跌声 3ʔ5、重声 21ʔ
 */
const TONE_PATHS: { d: string; stop?: [number, number] }[] = [
  { d: 'M4 16 L52 16' },
  { d: 'M4 19 C20 21, 36 25, 52 28' },
  { d: 'M4 16 C20 15, 36 10, 52 4' },
  { d: 'M4 16 C14 26, 26 30, 34 27 C42 24, 48 20, 52 18' },
  { d: 'M4 16 L22 13 M30 13 L52 3' },
  { d: 'M4 20 L30 28', stop: [30, 28] },
];

export function ToneCurve({ index, color, grid }: { index: number; color: string; grid: string }) {
  const t = TONE_PATHS[index];
  return (
    <Svg width={56} height={32} viewBox="0 0 56 32">
      {[4, 10, 16, 22, 28].map((y) => (
        <Line key={y} x1="2" y1={y} x2="54" y2={y} stroke={grid} strokeWidth="0.8" />
      ))}
      <Path d={t.d} stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
      {t.stop && <Line x1={t.stop[0] + 3} y1={t.stop[1] - 5} x2={t.stop[0] + 3} y2={t.stop[1] + 3} stroke={color} strokeWidth="2.5" strokeLinecap="round" />}
      {index === 4 && <Line x1="26" y1="9" x2="26" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />}
    </Svg>
  );
}
