/** 录音表的键：统一大小写、空格和 Unicode 写法，保留标点（问句和陈述句的语调不同） */
export const audioKey = (text: string) => text.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
