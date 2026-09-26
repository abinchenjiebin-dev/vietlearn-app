import { useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

// 配色：越南国旗的红与金为主色，浅色 / 深色两套，跟随系统切换
const light = {
  bg: '#F8F4EE',
  /** 背景渐变的顶部颜色 */
  bgTop: '#FCEDE5',
  tabBar: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#F0EBE3',
  text: '#1B1B1F',
  sub: '#6B6B74',
  faint: '#A3A3AB',
  border: '#E6E0D5',
  primary: '#D7263D',
  primarySoft: '#FCE9EB',
  onPrimary: '#FFFFFF',
  gold: '#F2A900',
  goldSoft: '#FFF4D6',
  goldText: '#7A5600',
  success: '#1F9D63',
  successSoft: '#E2F5EC',
  danger: '#E5484D',
  dangerSoft: '#FDE8E8',
  shadow: '#3B2A1A',
};

export type Colors = typeof light;

const dark: Colors = {
  bg: '#121214',
  bgTop: '#2A1519',
  tabBar: '#1E1D22',
  card: '#1C1C20',
  cardAlt: '#26262C',
  text: '#F3F3F5',
  sub: '#A2A2AC',
  faint: '#6E6E78',
  border: '#2E2E35',
  primary: '#FF5468',
  primarySoft: '#3A1B21',
  onPrimary: '#FFFFFF',
  gold: '#F7C948',
  goldSoft: '#352B12',
  goldText: '#F7D77A',
  success: '#3DD68C',
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
  const isDark = scheme === 'dark';
  return useMemo(() => {
    const c = isDark ? dark : light;
    const shadow = isDark
      ? { borderWidth: StyleSheet.hairlineWidth, borderColor: c.border }
      : {
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
