"""批量生成越南语录音：assets/audio/<hash>.mp3 + src/data/audio.ts 映射表。已存在的文件跳过，可重复运行。

加了新词/句子后：
  npx tsx scripts/audio-texts.ts > scripts/audio-texts.json
  pip install edge-tts && python scripts/gen-audio.py scripts/audio-texts.json          # 女声
                          python scripts/gen-audio.py scripts/audio-texts.json male     # 男声
"""
import asyncio, hashlib, json, os, sys

import edge_tts

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
MALE = len(sys.argv) > 2 and sys.argv[2] == 'male'
# 两个都是北部（河内）口音
VOICE = 'vi-VN-NamMinhNeural' if MALE else 'vi-VN-HoaiMyNeural'
DIR = 'audio-m' if MALE else 'audio'
OUT = os.path.join(ROOT, 'assets', DIR)
os.makedirs(OUT, exist_ok=True)

texts = json.load(open(sys.argv[1], encoding='utf-8'))  # key -> 原文
name = lambda k: hashlib.md5(k.encode('utf-8')).hexdigest()[:10] + '.mp3'

sem = asyncio.Semaphore(6)
failed = []


async def one(key, text):
    path = os.path.join(OUT, name(key))
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return
    async with sem:
        for attempt in range(4):
            try:
                # 单条最多等 30 秒，网络卡住就重试
                await asyncio.wait_for(edge_tts.Communicate(text, VOICE, rate='-5%').save(path), 30)
                if os.path.getsize(path) > 0:
                    return
            except Exception as e:  # 网络抖动时重试
                err = e
            await asyncio.sleep(1 + attempt * 2)
        failed.append(text)
        if os.path.exists(path):
            os.remove(path)


async def main():
    await asyncio.gather(*(one(k, t) for k, t in texts.items()))


asyncio.run(main())

ok = {k: name(k) for k in texts if os.path.exists(os.path.join(OUT, name(k)))}
# 删掉文本表里已经没有的旧录音（比如改掉的题目），不然会一直占着空间
keep = set(ok.values())
old = [f for f in os.listdir(OUT) if f.endswith('.mp3') and f not in keep]
for f in old:
    os.remove(os.path.join(OUT, f))
print('removed', len(old), 'unused files')
lines = [
    f'// 自动生成（scripts/gen-audio.py），不要手改。越南语录音：Edge 神经语音 {VOICE}（北部口音）',
    f'export const {"audioFilesMale" if MALE else "audioFiles"}: Record<string, number> = {{',
]
for k in sorted(ok):
    lines.append(f"  {json.dumps(k, ensure_ascii=False)}: require('../../assets/{DIR}/{ok[k]}'),")
lines.append('};')
open(os.path.join(ROOT, 'src', 'data', 'audioMale.ts' if MALE else 'audio.ts'), 'w', encoding='utf-8', newline='\n').write('\n'.join(lines) + '\n')
print('ok', len(ok), 'failed', len(failed), failed[:10])
