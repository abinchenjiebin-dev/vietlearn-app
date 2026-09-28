import { BeVietnamPro_400Regular } from '@expo-google-fonts/be-vietnam-pro/400Regular';
import { BeVietnamPro_500Medium } from '@expo-google-fonts/be-vietnam-pro/500Medium';
import { BeVietnamPro_600SemiBold } from '@expo-google-fonts/be-vietnam-pro/600SemiBold';
import { BeVietnamPro_700Bold } from '@expo-google-fonts/be-vietnam-pro/700Bold';
import { BeVietnamPro_800ExtraBold } from '@expo-google-fonts/be-vietnam-pro/800ExtraBold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';

import { AppBackground } from '../components/Art';
import { FONT } from '../components/Text';
import { ProgressProvider, useProgress } from '../lib/progress';
import { setSpeechRate } from '../lib/speech';
import { useTheme } from '../theme';

// 网页版：字体文件本身已经是粗体，不让浏览器再额外“加粗”一遍
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = '* { font-synthesis: none; }';
  document.head.appendChild(style);
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
    BeVietnamPro_800ExtraBold,
  });
  // 字体加载好再显示（加载失败就用系统字体）
  if (!fontsLoaded && !fontError) return null;
  return (
    <ProgressProvider>
      <Root />
    </ProgressProvider>
  );
}

function Root() {
  const { c, isDark } = useTheme();
  const { speechRate } = useProgress();
  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, primary: c.primary, background: c.bg, card: c.bgTop, text: c.text, border: c.border },
  };

  useEffect(() => setSpeechRate(speechRate), [speechRate]);

  return (
    <ThemeProvider value={navTheme}>
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
            headerTitleStyle: { fontFamily: FONT[700], fontWeight: Platform.OS === 'android' ? 'normal' : '700', fontSize: 16, color: c.text },
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
          <Stack.Screen name="settings" options={{ title: '设置' }} />
          <Stack.Screen name="word/[vi]" options={{ title: '单词' }} />
          <Stack.Screen name="shadow/[id]" options={{ title: '跟读' }} />
          <Stack.Screen name="dialogues" options={{ title: '情景对话' }} />
          <Stack.Screen name="dialogue/[id]" options={{ title: '对话' }} />
          <Stack.Screen name="level/[id]" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen
            name="search"
            options={{ title: '搜索', presentation: 'modal', contentStyle: { backgroundColor: c.bg } }}
          />
        </Stack>
      </View>
    </ThemeProvider>
  );
}
