// 网页版：没从桌面图标打开时，提示“添加到主屏幕”（添加后全屏打开，像 App 一样）
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { Image, Platform, Pressable, View } from 'react-native';

import { radius, Theme, useStyles, useTheme } from '../theme';
import { Text } from './Text';
import { PressableScale, tap } from './ui';

const DISMISS_KEY = 'vietlearn.installHint.dismissed';
const HIDE_DAYS = 7;

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// 安卓 Chrome 会在页面加载后很快发出这个事件，要尽早接住，等用户点“安装”时再用
let deferred: InstallEvent | null = null;
const listeners = new Set<() => void>();
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    listeners.forEach((f) => f());
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((f) => f());
  });
}

type Kind = 'wechat' | 'ios' | 'android';

/** 需要提示时返回手机类型，不需要（App、电脑、已从桌面打开、最近关掉过）返回 null */
function detect(): Kind | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
  if (standalone) return null;
  const ua = navigator.userAgent;
  if (!/Android|iPhone|iPad|iPod/i.test(ua)) return null;
  try {
    const t = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    if (Date.now() - t < HIDE_DAYS * 86400000) return null;
  } catch {}
  if (/MicroMessenger/i.test(ua)) return 'wechat';
  return /iPhone|iPad|iPod/i.test(ua) ? 'ios' : 'android';
}

const TIPS: Record<Kind, string> = {
  wechat: '微信里不能添加。点右上角「…」→「在浏览器打开」，再添加到主屏幕',
  ios: '用 Safari 打开，点底部「分享」按钮 →「添加到主屏幕」',
  android: '点浏览器菜单「⋮」→「添加到主屏幕」或「安装应用」',
};

export function InstallHint() {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const [kind, setKind] = useState<Kind | null>(detect);
  const [canInstall, setCanInstall] = useState(!!deferred);

  useEffect(() => {
    const f = () => setCanInstall(!!deferred);
    listeners.add(f);
    return () => {
      listeners.delete(f);
    };
  }, []);

  if (!kind) return null;

  const close = () => {
    tap();
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setKind(null);
  };

  const install = async () => {
    if (!deferred) return;
    tap();
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    setCanInstall(false);
    if (outcome === 'accepted') setKind(null);
  };

  return (
    <View style={s.card}>
      <Image source={require('../../assets/pwa/icon-192.png')} style={s.icon} />
      <View style={{ flex: 1 }}>
        <Text style={s.title}>添加到桌面，像 App 一样用</Text>
        <Text style={s.tip}>{kind === 'android' && canInstall ? '一键安装到桌面，以后点图标全屏打开' : TIPS[kind]}</Text>
      </View>
      {kind === 'android' && canInstall ? (
        <PressableScale onPress={install} style={s.btn} scaleTo={0.94}>
          <Text style={s.btnText}>安装</Text>
        </PressableScale>
      ) : null}
      <Pressable onPress={close} hitSlop={10} accessibilityLabel="关闭提示" style={s.close}>
        <Ionicons name="close" size={16} color={c.faint} />
      </Pressable>
    </View>
  );
}

const makeStyles = ({ c, shadow }: Theme) => ({
  card: {
    ...shadow,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.card,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 12,
    gap: 10,
  },
  icon: { width: 38, height: 38, borderRadius: 9 },
  title: { fontSize: 13, fontWeight: '700' as const, color: c.text },
  tip: { fontSize: 11, color: c.sub, marginTop: 2, lineHeight: 15 },
  btn: { backgroundColor: c.primary, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 7 },
  btnText: { color: c.onPrimary, fontSize: 13, fontWeight: '700' as const },
  close: { padding: 2 },
});
