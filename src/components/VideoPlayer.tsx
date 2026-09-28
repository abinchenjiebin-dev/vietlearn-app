// 手机 App：用 WebView 嵌入 B 站播放器（网页版见 VideoPlayer.web.tsx）
import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

import { embedUrl } from '../data/videos';
import { radius } from '../theme';

export function VideoPlayer({ bvid }: { bvid: string }) {
  return (
    <View style={{ aspectRatio: 16 / 9, borderRadius: radius.md, overflow: 'hidden', backgroundColor: '#000' }}>
      <WebView
        source={{ uri: embedUrl(bvid) }}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        // 播放器里的链接不在 App 里乱跳
        setSupportMultipleWindows={false}
        style={{ backgroundColor: '#000' }}
      />
    </View>
  );
}
