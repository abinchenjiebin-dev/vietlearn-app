// 网页版：直接用 iframe 嵌入 B 站播放器
import React from 'react';
import { View } from 'react-native';

import { embedUrl } from '../data/videos';
import { radius } from '../theme';

export function VideoPlayer({ bvid }: { bvid: string }) {
  return (
    <View style={{ aspectRatio: 16 / 9, borderRadius: radius.md, overflow: 'hidden', backgroundColor: '#000' }}>
      <iframe
        src={embedUrl(bvid)}
        title="视频"
        allowFullScreen
        allow="fullscreen; picture-in-picture"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ width: '100%', height: '100%', border: 0 }}
      />
    </View>
  );
}
