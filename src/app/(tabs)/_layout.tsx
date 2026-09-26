import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import type { ColorValue } from 'react-native';

import { colors } from '../../theme';

type IconName = keyof typeof Ionicons.glyphMap;

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={icon} size={size} color={color as string} />
  ),
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.sub,
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', fontSize: 18, color: colors.text },
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="index" options={{ ...tab('首页', 'home'), headerShown: false }} />
      <Tabs.Screen name="phrases" options={tab('常用语', 'chatbubbles')} />
      <Tabs.Screen name="vocab" options={tab('词汇', 'albums')} />
      <Tabs.Screen name="compounds" options={tab('组词', 'git-merge')} />
      <Tabs.Screen name="sentences" options={tab('组句子', 'reorder-four')} />
    </Tabs>
  );
}
