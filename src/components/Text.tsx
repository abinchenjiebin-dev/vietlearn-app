// 统一文字：使用 Be Vietnam Pro 字体（越南语声调符号更清晰），并按设置里的“文字大小”缩放。
// 中文字符字体里没有，会自动用系统中文字体显示。
import React, { createContext, useContext } from 'react';
import {
  Platform,
  Text as RNText,
  TextInput as RNTextInput,
  StyleSheet,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { useSettings } from '../lib/progress';

export const FONT = {
  400: 'BeVietnamPro_400Regular',
  500: 'BeVietnamPro_500Medium',
  600: 'BeVietnamPro_600SemiBold',
  700: 'BeVietnamPro_700Bold',
  800: 'BeVietnamPro_800ExtraBold',
} as const;

/** 字重 → 对应的字体文件名 */
export function fontFor(weight?: TextStyle['fontWeight']): string {
  const w = weight === 'bold' ? 700 : weight === 'normal' || weight == null ? 400 : Number(weight);
  if (w >= 800) return FONT[800];
  if (w >= 700) return FONT[700];
  if (w >= 600) return FONT[600];
  if (w >= 500) return FONT[500];
  return FONT[400];
}

// 嵌套在文字里面的文字不重复设置字体和大小，继承外层
const Nested = createContext(false);

function useFontStyle(style: TextProps['style'], nested: boolean) {
  const { textScale } = useSettings();
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const extra: TextStyle = {};
  if (!nested || flat.fontWeight != null) {
    extra.fontFamily = fontFor(flat.fontWeight);
    // 保留字重：中文会用系统字体显示，靠它保持粗体。
    // 安卓上自定义字体再加粗会变形，所以只在安卓去掉（网页版另外关掉了“伪粗体”）
    if (Platform.OS === 'android') extra.fontWeight = 'normal';
  }
  if (flat.fontSize != null) extra.fontSize = flat.fontSize * textScale;
  else if (!nested) extra.fontSize = 14 * textScale;
  if (flat.lineHeight != null) extra.lineHeight = flat.lineHeight * textScale;
  return extra;
}

export function Text({ style, children, ...props }: TextProps) {
  const nested = useContext(Nested);
  const extra = useFontStyle(style, nested);
  return (
    <RNText {...props} style={[style, extra]}>
      <Nested.Provider value>{children}</Nested.Provider>
    </RNText>
  );
}

export function TextInput({ style, ...props }: TextInputProps) {
  const extra = useFontStyle(style, false);
  return <RNTextInput {...props} style={[style, extra]} />;
}
