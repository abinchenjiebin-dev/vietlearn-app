import * as Speech from 'expo-speech';

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

/** 用越南语朗读。slow=true 时放慢语速，方便跟读 */
export async function speakVi(text: string, slow = false) {
  if (!voiceChecked) await findVietnameseVoice();
  wordRun++;
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
  if (!voiceChecked) await findVietnameseVoice();
  const run = ++wordRun;
  await Speech.stop();
  const next = (i: number) => {
    if (run !== wordRun) return; // 被新的朗读打断
    if (i >= words.length) return onWord(-1);
    onWord(i);
    Speech.speak(words[i], {
      language: 'vi-VN',
      voice: viVoiceId,
      rate: rate * rateScale,
      onDone: () => {
        setTimeout(() => next(i + 1), 180);
      },
      onStopped: () => {
        if (run === wordRun) onWord(-1);
      },
      onError: () => onWord(-1),
    });
  };
  next(0);
}

export function stopSpeaking() {
  Speech.stop();
}
