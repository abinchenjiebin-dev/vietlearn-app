import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { topics } from '../data/topics';
import { speakVi } from '../lib/speech';
import { colors, radius, shadow } from '../theme';

export function tap() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}

/** 发音按钮：点一下正常语速，长按慢速 */
export function SpeakButton({
  text,
  size = 22,
  slow = false,
  color = colors.primary,
}: {
  text: string;
  size?: number;
  slow?: boolean;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityLabel={slow ? '慢速朗读' : '朗读'}
      hitSlop={8}
      onPress={() => {
        tap();
        speakVi(text, slow);
      }}
      onLongPress={() => speakVi(text, true)}
      style={({ pressed }) => [
        styles.speakBtn,
        { width: size + 20, height: size + 20, borderRadius: (size + 20) / 2 },
        pressed && { opacity: 0.6 },
      ]}
    >
      <Ionicons name={slow ? 'hourglass-outline' : 'volume-high'} size={size} color={color} />
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Chip({
  label,
  active,
  onPress,
  color = colors.primary,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={[styles.chip, active && { backgroundColor: color, borderColor: color }]}
    >
      <Text style={[styles.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

/** 顶部主题选择条 */
export function TopicPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.picker}
      style={{ flexGrow: 0, flexShrink: 0 }}
    >
      {topics.map((t) => (
        <Chip
          key={t.id}
          label={`${t.emoji} ${t.zh}`}
          active={t.id === value}
          color={t.color}
          onPress={() => onChange(t.id)}
        />
      ))}
    </ScrollView>
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
  kind?: 'primary' | 'ghost' | 'success' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const bg = {
    primary: colors.primary,
    ghost: colors.card,
    success: colors.success,
    danger: colors.danger,
  }[kind];
  const fg = kind === 'ghost' ? colors.text : '#fff';
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg },
        kind === 'ghost' && { borderWidth: 1, borderColor: colors.border },
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.8 },
        style,
      ]}
    >
      {icon && <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 6 }} />}
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  speakBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    ...shadow,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginRight: 8,
  },
  chipText: { fontSize: 15, color: colors.text, fontWeight: '500' },
  picker: { paddingHorizontal: 16, paddingVertical: 12 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radius.md,
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
});
