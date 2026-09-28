// 跟读录音：先听标准发音，录下自己的，再对比着回放。录音只保存在手机上，不上传。
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';

import { speakVi, stopSpeaking } from '../lib/speech';
import { radius, Theme, useStyles, useTheme } from '../theme';
import { Text } from './Text';
import { native, PressableScale, tap } from './ui';

const MAX_SECONDS = 10;

/** 换句子时请给它不同的 key（例如 key={text}），录音会自动清空 */
export function Recorder({ text, compact }: { text: string; compact?: boolean }) {
  const s = useStyles(makeStyles);
  const { c } = useTheme();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const rec = useAudioRecorderState(recorder, 200);
  const player = useAudioPlayer(null);
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulse = useState(() => new Animated.Value(1))[0];

  // 录音时红点呼吸动画
  useEffect(() => {
    if (!rec.isRecording) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.25, duration: 500, useNativeDriver: native }),
        Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [rec.isRecording, pulse]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const stop = async () => {
    if (timer.current) clearTimeout(timer.current);
    try {
      await recorder.stop();
    } catch {}
    // 恢复成播放模式，不然 iPhone 会从听筒小声播放
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => {});
    if (recorder.uri) {
      setUri(recorder.uri);
      player.replace({ uri: recorder.uri });
    }
  };

  const start = async () => {
    tap();
    setError(null);
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setError('没有麦克风权限。请到手机「设置」里允许本 App 使用麦克风。');
        return;
      }
      stopSpeaking();
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      timer.current = setTimeout(stop, MAX_SECONDS * 1000);
    } catch {
      setError('无法录音：这台设备或浏览器可能不支持录音。');
    }
  };

  const playMine = () => {
    if (!uri) return;
    tap();
    stopSpeaking();
    player.seekTo(0);
    player.play();
  };

  const seconds = Math.floor((rec.durationMillis ?? 0) / 1000);

  return (
    <View style={[s.box, compact && s.compact]}>
      {!compact && <Text style={s.title}>🎙 跟读练习：先听标准发音，再录下你的发音对比</Text>}
      <View style={s.row}>
        <PressableScale onPress={() => { tap(); speakVi(text); }} style={s.btn} accessibilityLabel="听标准发音">
          <Ionicons name="volume-high" size={17} color={c.primary} />
          <Text style={s.btnText}>标准</Text>
        </PressableScale>
        {rec.isRecording ? (
          <PressableScale onPress={stop} style={[s.btn, s.recOn]} accessibilityLabel="停止录音">
            <Animated.View style={[s.dot, { transform: [{ scale: pulse }] }]} />
            <Text style={[s.btnText, { color: c.danger }]}>停止 {seconds}s</Text>
          </PressableScale>
        ) : (
          <PressableScale onPress={start} style={[s.btn, s.rec]} accessibilityLabel="录音">
            <Ionicons name="mic" size={17} color={c.onPrimary} />
            <Text style={[s.btnText, { color: c.onPrimary }]}>{uri ? '重录' : '录音'}</Text>
          </PressableScale>
        )}
        <PressableScale onPress={playMine} disabled={!uri || rec.isRecording} style={s.btn} accessibilityLabel="听我的发音">
          <Ionicons name="person" size={16} color={c.primary} />
          <Text style={s.btnText}>我的</Text>
        </PressableScale>
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

const makeStyles = ({ c }: Theme) => ({
  box: { backgroundColor: c.cardAlt, borderRadius: radius.md, padding: 10 },
  compact: { padding: 6, backgroundColor: 'transparent' },
  title: { fontSize: 12, color: c.sub, marginBottom: 8 },
  row: { flexDirection: 'row' as const, gap: 8 },
  btn: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 5,
    paddingVertical: 9,
    borderRadius: radius.sm,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
  },
  rec: { backgroundColor: c.primary, borderColor: c.primary },
  recOn: { backgroundColor: c.dangerSoft, borderColor: c.danger },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.danger },
  btnText: { fontSize: 13, fontWeight: '600' as const, color: c.text },
  error: { fontSize: 11, color: c.danger, marginTop: 6 },
});
