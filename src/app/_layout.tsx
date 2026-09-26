import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';

import { AppBackground } from '../components/Art';
import { ProgressProvider } from '../lib/progress';
import { useTheme } from '../theme';

export default function RootLayout() {
  const { c, isDark } = useTheme();
  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, primary: c.primary, background: c.bg, card: c.bgTop, text: c.text, border: c.border },
  };

  return (
    <ThemeProvider value={navTheme}>
      <ProgressProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={{ flex: 1, backgroundColor: c.bg }}>
          <Stack
            // 每个页面自带不透明的渐变背景（顶部颜色和标题栏一致），叠在别的页面上面也不会透出来
            screenLayout={({ children }) => (
              <View style={{ flex: 1, backgroundColor: c.bg }}>
                <AppBackground glow={false} />
                {children}
              </View>
            )}
            screenOptions={{
              headerShadowVisible: false,
              headerStyle: { backgroundColor: c.bgTop },
              headerTitleStyle: { fontWeight: '700', fontSize: 16, color: c.text },
              headerTintColor: c.primary,
              headerBackButtonDisplayMode: 'minimal',
              contentStyle: { backgroundColor: c.bg },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="topic/[id]" options={{ title: '常用语' }} />
            <Stack.Screen name="cards/[id]" options={{ title: '词汇' }} />
            <Stack.Screen name="review" options={{ title: '智能复习' }} />
            <Stack.Screen name="quiz/[type]" options={{ title: '测验' }} />
            <Stack.Screen name="compounds" options={{ title: '组词' }} />
            <Stack.Screen name="sentences" options={{ title: '组句子' }} />
            <Stack.Screen name="mistakes" options={{ title: '错题本' }} />
            <Stack.Screen
              name="search"
              options={{ title: '搜索', presentation: 'modal', contentStyle: { backgroundColor: c.bg } }}
            />
          </Stack>
        </View>
      </ProgressProvider>
    </ThemeProvider>
  );
}
