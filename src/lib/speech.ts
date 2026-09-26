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

/** 用越南语朗读。slow=true 时放慢语速，方便跟读 */
export async function speakVi(text: string, slow = false) {
  if (!voiceChecked) await findVietnameseVoice();
  await Speech.stop();
  Speech.speak(text, {
    language: 'vi-VN',
    voice: viVoiceId,
    rate: slow ? 0.55 : 0.9,
    pitch: 1.0,
  });
}

export function stopSpeaking() {
  Speech.stop();
}
