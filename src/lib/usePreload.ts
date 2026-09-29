import { useEffect } from 'react';

import { preloadAudio } from './speech';

/** 进入页面时在后台预下载这一页要念的录音（只在网页版生效）。data 要保持引用稳定（state、useMemo、模块常量） */
export function usePreload(data: unknown) {
  useEffect(() => preloadAudio(data), [data]);
}
