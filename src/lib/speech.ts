// 发音：优先播放预先生成的真人级录音（assets/audio，北部口音），找不到录音时再用手机系统语音
import { Asset } from 'expo-asset';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioSource } from 'expo-audio';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import { audioFiles } from '../data/audio';
import { audioFilesMale } from '../data/audioMale';
import { audioKey } from './audioKey';

let viVoiceId: string | undefined;
let voiceChecked = false;

/** 查找系统里的越南语语音（iOS 自带 “Linh”） */
export async function findVietnameseVoice(): Promise<boolean> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const vi = voices.filter((v) => v.language?.toLowerCase().startsWith('vi'));
    // 优先使用增强版（Enhanced）语音，音质更好
    const best =
      vi.find((v) => v.quality === Speech.VoiceQuality.Enhanced) ?? vi[0];
    viVoiceId = best?.identifier;
    voiceChecked = true;
    return vi.length > 0;
  } catch {
    voiceChecked = true;
    return false;
  }
}

let rateScale = 1;
let wordRun = 0;

/** 设置里的语速：慢 / 正常 / 快 */
export function setSpeechRate(rate: 'slow' | 'normal' | 'fast') {
  rateScale = rate === 'slow' ? 0.8 : rate === 'fast' ? 1.18 : 1;
}

export type Voice = 'female' | 'male';
let files = audioFiles;

/** 设置里的发音人：女声 / 男声（都是北部河内口音） */
export function setVoice(voice: Voice) {
  files = voice === 'male' ? audioFilesMale : audioFiles;
}

/** 这句话有没有录音（先按原文找，再去掉标点找） */
function clipFor(text: string): number | undefined {
  return files[audioKey(text)] ?? files[audioKey(text.replace(/[.,!?]/g, ''))];
}

// ---- 网页版预下载：录音在服务器上，进入页面时先在后台下好，点的时候马上就能播 ----
// （手机 App 里录音本来就打包在本地，不需要）
const ready = new Map<number, string>(); // 录音 → 已下载好的本地地址
const queued = new Set<number>();
const queue: number[] = [];
let downloading = 0;

function pump() {
  while (downloading < 4 && queue.length) {
    const id = queue.shift()!;
    downloading++;
    fetch(Asset.fromModule(id).uri)
      .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
      .then((b) => ready.set(id, URL.createObjectURL(b)))
      .catch(() => queued.delete(id)) // 下载失败的下次再试
      .finally(() => {
        downloading--;
        pump();
      });
  }
}

/** 预下载一个页面要用到的录音：传单词、句子、题目、关卡步骤都行，会自动找出里面所有越南语 */
export function preloadAudio(data: unknown) {
  if (Platform.OS !== 'web' || data == null) return;
  const seen = new Set<unknown>();
  const want = (text: string) => {
    const id = clipFor(text);
    if (id !== undefined && !queued.has(id)) {
      queued.add(id);
      queue.push(id);
    }
  };
  const walk = (v: unknown, depth: number) => {
    if (typeof v === 'string') {
      if (!/[a-zà-ỹđ]/i.test(v)) return;
      want(v);
      // 逐词朗读时每个词单独播放
      if (v.includes(' ')) v.split(' ').forEach((w) => want(w.replace(/[.,!?]/g, '')));
      return;
    }
    if (depth > 5 || typeof v !== 'object' || v === null || seen.has(v)) return;
    seen.add(v);
    Object.values(v).forEach((x) => walk(x, depth + 1));
  };
  walk(data, 0);
  pump();
}

let player: AudioPlayer | null = null;
let clipTimer: ReturnType<typeof setTimeout> | null = null;
let onClipStopped: (() => void) | null = null;
let modeReady = false;

function stopClip() {
  if (clipTimer) clearTimeout(clipTimer);
  clipTimer = null;
  if (player) {
    try {
      player.pause();
      player.remove();
    } catch {}
    player = null;
  }
  const cb = onClipStopped;
  onClipStopped = null;
  cb?.();
}

/** 播放一段录音；rate 是播放速度（1 = 原速），读完调用 onDone */
function playClip(id: number, rate: number, onDone?: () => void, onStopped?: () => void) {
  stopClip();
  if (!modeReady) {
    modeReady = true;
    // 手机静音键打开时也要能听到
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }
  const local = ready.get(id);
  const source: AudioSource = local ? { uri: local } : id;
  const p = createAudioPlayer(source);
  player = p;
  onClipStopped = onStopped ?? null;
  try {
    p.shouldCorrectPitch = true;
    if (rate !== 1) p.setPlaybackRate(rate, 'high');
  } catch {}
  let finished = false;
  const finish = () => {
    if (finished || player !== p) return;
    finished = true;
    if (clipTimer) clearTimeout(clipTimer);
    clipTimer = null;
    onClipStopped = null;
    onDone?.();
  };
  p.addListener('playbackStatusUpdate', (s) => {
    if (s.didJustFinish) finish();
  });
  // 万一加载失败收不到“播完”，也不能让逐词朗读卡住
  clipTimer = setTimeout(finish, 12000);
  p.play();
}

/** 用越南语朗读。slow=true 时放慢语速，方便跟读 */
export async function speakVi(text: string, slow = false) {
  wordRun++;
  const clip = clipFor(text);
  if (clip !== undefined) {
    Speech.stop();
    playClip(clip, (slow ? 0.7 : 1) * rateScale);
    return;
  }
  stopClip();
  if (!voiceChecked) await findVietnameseVoice();
  await Speech.stop();
  Speech.speak(text, {
    language: 'vi-VN',
    voice: viVoiceId,
    rate: (slow ? 0.55 : 0.9) * rateScale,
    pitch: 1.0,
  });
}

/** 逐词（或逐句）朗读：一个读完再读下一个，onWord 告诉界面正在读第几个词（-1 表示结束） */
export async function speakWords(words: string[], onWord: (i: number) => void, rate = 0.75) {
  const run = ++wordRun;
  stopClip();
  await Speech.stop();
  if (!voiceChecked) await findVietnameseVoice();
  const next = (i: number) => {
    if (run !== wordRun) return; // 被新的朗读打断
    if (i >= words.length) return onWord(-1);
    onWord(i);
    const after = () => {
      setTimeout(() => next(i + 1), 180);
    };
    const stopped = () => {
      if (run === wordRun) onWord(-1);
    };
    const clip = clipFor(words[i]);
    if (clip !== undefined) {
      // 系统语音的 0.9 大约相当于录音原速
      playClip(clip, Math.min(1, rate / 0.9) * rateScale, after, stopped);
      return;
    }
    Speech.speak(words[i], {
      language: 'vi-VN',
      voice: viVoiceId,
      rate: rate * rateScale,
      onDone: after,
      onStopped: stopped,
      onError: () => onWord(-1),
    });
  };
  next(0);
}

export function stopSpeaking() {
  stopClip();
  Speech.stop();
}
