import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, type ColorValue, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBackground } from '../../components/Art';
import { FONT } from '../../components/Text';
import { IconName } from '../../components/ui';
import { useTheme } from '../../theme';

export default function TabLayout() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // 选中的标签：图标后面加一个淡红色胶囊
  const tab = (title: string, icon: IconName, activeIcon: IconName) => ({
    title,
    tabBarIcon: ({ color, focused }: { color: ColorValue; focused: boolean }) => (
      <View
        style={{
          width: 46,
          height: 26,
          borderRadius: 13,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: focused ? c.primarySoft : 'transparent',
        }}
      >
        <Ionicons name={focused ? activeIcon : icon} size={19} color={color as string} />
      </View>
    ),
  });

  return (
    <Tabs
      // 每个标签页自带不透明背景，切换时不会透出别的页面
      screenLayout={({ children }) => (
        <View style={{ flex: 1, backgroundColor: c.bg }}>
          <AppBackground />
          {children}
        </View>
      )}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.faint,
        tabBarLabelStyle: { fontSize: 11, fontFamily: FONT[600], fontWeight: Platform.OS === 'android' ? 'normal' : '600', marginTop: 3 },
        tabBarItemStyle: { paddingTop: 6 },
        sceneStyle: { backgroundColor: c.bg },
        tabBarStyle: {
          backgroundColor: c.tabBar,
          borderTopWidth: 0,
          // 图标 + 文字 + 手机底部安全区
          height: 68 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          ...(Platform.OS === 'android'
            ? { elevation: 12 }
            : {
                shadowColor: '#3B2A1A',
                shadowOpacity: isDark ? 0.4 : 0.08,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: -4 },
              }),
        },
      }}
    >
      <Tabs.Screen name="index" options={tab('今天', 'sunny-outline', 'sunny')} />
      <Tabs.Screen name="learn" options={tab('学习', 'book-outline', 'book')} />
      <Tabs.Screen name="levels" options={tab('闯关', 'map-outline', 'map')} />
      <Tabs.Screen name="practice" options={tab('练习', 'barbell-outline', 'barbell')} />
      <Tabs.Screen name="pronounce" options={tab('发音', 'mic-outline', 'mic')} />
    </Tabs>
  );
}
