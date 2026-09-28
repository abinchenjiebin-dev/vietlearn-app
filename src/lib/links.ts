import type { Href } from 'expo-router';

/** 单词详情页地址 */
export const wordHref = (vi: string) => `/word/${encodeURIComponent(vi)}` as Href;
