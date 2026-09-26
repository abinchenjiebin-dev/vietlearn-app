// 智能复习（间隔重复）：答得越好，下次复习隔得越久；忘了就明天再来。
// 简化版 SM-2 算法。日期都用本地 YYYY-MM-DD 字符串，可以直接比较大小。
import { addDays } from './utils';

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export type SrsCard = {
  /** 距离下次复习的天数 */
  interval: number;
  ease: number;
  /** 下次复习日期 */
  due: string;
  reps: number;
  lapses: number;
};

export const NEW_PER_DAY = 10;

export function schedule(card: SrsCard | undefined, grade: Grade, today: string): SrsCard {
  const c = card ?? { interval: 0, ease: 2.5, due: today, reps: 0, lapses: 0 };
  let { interval, ease, reps, lapses } = c;
  switch (grade) {
    case 'again':
      return { interval: 0, ease: Math.max(1.3, ease - 0.2), due: today, reps: 0, lapses: lapses + 1 };
    case 'hard':
      interval = reps === 0 ? 1 : Math.max(1, Math.round(interval * 1.2));
      ease = Math.max(1.3, ease - 0.15);
      break;
    case 'good':
      interval = reps === 0 ? 1 : reps === 1 ? 3 : Math.round(interval * ease);
      break;
    case 'easy':
      interval = reps === 0 ? 3 : Math.round(Math.max(interval, 1) * ease * 1.3);
      ease += 0.15;
      break;
  }
  return { interval, ease, due: addDays(today, interval), reps: reps + 1, lapses };
}

/** 预估下次间隔（显示在按钮上） */
export function previewInterval(card: SrsCard | undefined, grade: Grade, today: string): string {
  const n = schedule(card, grade, today).interval;
  if (n === 0) return '今天';
  if (n < 30) return `${n}天`;
  if (n < 365) return `${Math.round(n / 30)}个月`;
  return `${(n / 365).toFixed(1)}年`;
}
