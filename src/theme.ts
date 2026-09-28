import { useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { useSettings } from './lib/progress';

// 配色：清爽的绿色为主色，浅色 / 深色两套
const light = {
  bg: '#F4F8F5',
  /** 背景渐变的顶部颜色 */
  bgTop: '#E4F3EA',
  tabBar: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#EEF4F0',
  text: '#15201A',
  sub: '#5E6E65',
  faint: '#9AA9A0',
  border: '#DFE9E3',
  primary: '#0F9D6B',
  primarySoft: '#E0F4EA',
  onPrimary: '#FFFFFF',
  /** 首页今日目标卡片的渐变 */
  heroFrom: '#2BB673',
  heroTo: '#0B8A5E',
  gold: '#F2A900',
  goldSoft: '#FFF4D6',
  goldText: '#7A5600',
  success: '#16A34A',
  successSoft: '#E3F6E8',
  danger: '#E5484D',
  dangerSoft: '#FDE8E8',
  shadow: '#16352A',
};

export type Colors = typeof light;

const dark: Colors = {
  bg: '#0F1512',
  bgTop: '#13261C',
  tabBar: '#18211C',
  card: '#18211C',
  cardAlt: '#212C26',
  text: '#EEF5F1',
  sub: '#A3B3AA',
  faint: '#6B7A72',
  border: '#28342E',
  primary: '#34D399',
  primarySoft: '#143427',
  onPrimary: '#06281B',
  heroFrom: '#17744C',
  heroTo: '#0C4A31',
  gold: '#F7C948',
  goldSoft: '#352B12',
  goldText: '#F7D77A',
  success: '#4ADE80',
  successSoft: '#12301F',
  danger: '#FF6B6E',
  dangerSoft: '#3A1B1C',
  shadow: '#000000',
};

export const radius = { sm: 10, md: 12, lg: 16, pill: 999 };

// 字号按手机屏幕（375–430 宽）来定，整体偏精致
export const font = {
  hero: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.4 },
  title: { fontSize: 18, fontWeight: '700' as const, letterSpacing: -0.2 },
  h3: { fontSize: 15, fontWeight: '700' as const },
  body: { fontSize: 15 },
  small: { fontSize: 12 },
};

export function useTheme() {
  const scheme = useColorScheme();
  const { appearance } = useSettings();
  const isDark = appearance === 'system' ? scheme === 'dark' : appearance === 'dark';
  return useMemo(() => {
    const c = isDark ? dark : light;
    const shadow = isDark
      ? { borderWidth: StyleSheet.hairlineWidth, borderColor: c.border }
      : {
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.border,
          shadowColor: c.shadow,
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        };
    return { c, isDark, shadow };
  }, [isDark]);
}

export type Theme = ReturnType<typeof useTheme>;

/** 按当前主题生成样式：const s = useStyles(makeStyles) */
export function useStyles<T extends StyleSheet.NamedStyles<T>>(factory: (t: Theme) => T): T {
  const theme = useTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
}
