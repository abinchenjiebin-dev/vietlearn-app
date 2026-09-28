import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Grade, schedule, SrsCard } from './srs';
import { addDays, dayKey } from './utils';

const KEY = 'vietlearn.progress.v2';

const OLD_KEY = 'vietlearn.progress.v1';

export type MistakeKind = 'word' | 'sentence' | 'compound';
export type Mistake = { kind: MistakeKind; id: string; count: number; at: string };

type ProgressState = {
  /** 已掌握的词汇（越南语原文） */
  known: string[];
  /** 收藏的常用语 */
  favorites: string[];
  /** 组词、组句子答对次数 */
  compoundCorrect: number;
  sentenceCorrect: number;
  /** 智能复习：每个词的复习计划 */
  srs: Record<string, SrsCard>;
  /** 今天已经开始学的新词数 */
  newToday: { day: string; count: number };
  /** 错题本，key = kind:id */
  mistakes: Record<string, Mistake>;
  /** 每天完成的练习次数 */
  activity: Record<string, number>;
  /** 每日目标（次） */
  goal: number;
  /** 每日一刷的题量 */
  drillSize: number;
} & Settings & {
  /** 上次学到的主题（首页“继续学习”） */
  lastVisit: { kind: 'phrases' | 'cards'; id: string } | null;
  /** 收藏的单词 */
  favWords: string[];
  /** 闯关：每一关得到的最高星数（1–3），有记录就算通过 */
  levels: Record<string, number>;
  /** 经验值 */
  xp: number;
};

export type Settings = {
  /** 外观：跟随系统 / 浅色 / 深色 */
  appearance: 'system' | 'light' | 'dark';
  /** 单词卡片、复习新词出现时自动朗读 */
  autoPlay: boolean;
  speechRate: 'slow' | 'normal' | 'fast';
  /** 文字大小倍数 */
  textScale: number;
};

export const defaultSettings: Settings = { appearance: 'system', autoPlay: true, speechRate: 'normal', textScale: 1 };

const initial: ProgressState = {
  known: [],
  favorites: [],
  compoundCorrect: 0,
  sentenceCorrect: 0,
  srs: {},
  newToday: { day: '', count: 0 },
  mistakes: {},
  activity: {},
  goal: 20,
  drillSize: 20,
  ...defaultSettings,
  lastVisit: null,
  favWords: [],
  levels: {},
  xp: 0,
};

type Ctx = ProgressState & {
  loaded: boolean;
  today: string;
  todayCount: number;
  streak: number;
  newLeftToday: (limit: number) => number;
  isKnown: (vi: string) => boolean;
  setKnown: (vi: string, known: boolean) => void;
  isFavorite: (vi: string) => boolean;
  toggleFavorite: (vi: string) => void;
  /** 智能复习打分 */
  review: (vi: string, grade: Grade) => void;
  /** 记录一次答题：答错进错题本，答对从错题本里减掉 */
  recordAnswer: (kind: MistakeKind, id: string, correct: boolean) => void;
  removeMistake: (kind: MistakeKind, id: string) => void;
  /** 只记一次练习（不进错题本） */
  tick: () => void;
  setGoal: (n: number) => void;
  setDrillSize: (n: number) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  isFavWord: (vi: string) => boolean;
  toggleFavWord: (vi: string) => void;
  /** 通过一关：记录星数（保留最高），加经验值 */
  finishLevel: (levelId: string, stars: number) => void;
  setLastVisit: (kind: 'phrases' | 'cards', id: string) => void;
  /** 清空学习记录（设置保留） */
  reset: () => void;
};

const ProgressContext = createContext<Ctx | null>(null);

const mkey = (kind: MistakeKind, id: string) => `${kind}:${id}`;

function bump(s: ProgressState, today: string): ProgressState {
  return { ...s, activity: { ...s.activity, [today]: (s.activity[today] ?? 0) + 1 } };
}

function withMistake(s: ProgressState, kind: MistakeKind, id: string, correct: boolean, today: string) {
  const k = mkey(kind, id);
  const m = s.mistakes[k];
  if (correct) {
    if (!m) return s;
    const rest = { ...s.mistakes };
    if (m.count <= 1) delete rest[k];
    else rest[k] = { ...m, count: m.count - 1 };
    return { ...s, mistakes: rest };
  }
  // 答错一次记 2 分，需要再答对 2 次才会移出错题本
  return { ...s, mistakes: { ...s.mistakes, [k]: { kind, id, count: Math.min((m?.count ?? 0) + 2, 4), at: today } } };
}

function withReview(s: ProgressState, vi: string, grade: Grade, today: string): ProgressState {
  const isNew = !s.srs[vi];
  const card = schedule(s.srs[vi], grade, today);
  const newToday =
    isNew ? { day: today, count: (s.newToday.day === today ? s.newToday.count : 0) + 1 } : s.newToday;
  let next: ProgressState = { ...s, srs: { ...s.srs, [vi]: card }, newToday };
  next = withMistake(next, 'word', vi, grade !== 'again', today);
  // 间隔达到 21 天算“已掌握”
  const known = new Set(next.known);
  if (card.interval >= 21) known.add(vi);
  if (grade === 'again') known.delete(vi);
  return { ...next, known: [...known] };
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(initial);
  const [loaded, setLoaded] = useState(false);
  const [today, setToday] = useState(dayKey);

  useEffect(() => {
    (async () => {
      try {
        const raw = (await AsyncStorage.getItem(KEY)) ?? (await AsyncStorage.getItem(OLD_KEY));
        if (raw) setState({ ...initial, ...JSON.parse(raw) });
      } catch {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  // App 开着跨过午夜时更新“今天”
  useEffect(() => {
    const id = setInterval(() => setToday(dayKey()), 60_000);
    return () => clearInterval(id);
  }, []);

  const setKnown = useCallback(
    (vi: string, known: boolean) => setState((s) => bump(withReview(s, vi, known ? 'good' : 'again', dayKey()), dayKey())),
    [],
  );

  const toggleFavorite = useCallback((vi: string) => {
    setState((s) => {
      const set = new Set(s.favorites);
      if (set.has(vi)) set.delete(vi);
      else set.add(vi);
      return { ...s, favorites: [...set] };
    });
  }, []);

  const review = useCallback(
    (vi: string, grade: Grade) => setState((s) => bump(withReview(s, vi, grade, dayKey()), dayKey())),
    [],
  );

  const recordAnswer = useCallback((kind: MistakeKind, id: string, correct: boolean) => {
    setState((s) => {
      const t = dayKey();
      let next = bump(withMistake(s, kind, id, correct, t), t);
      if (correct && kind === 'compound') next = { ...next, compoundCorrect: next.compoundCorrect + 1 };
      if (correct && kind === 'sentence') next = { ...next, sentenceCorrect: next.sentenceCorrect + 1 };
      return next;
    });
  }, []);

  const removeMistake = useCallback((kind: MistakeKind, id: string) => {
    setState((s) => {
      const rest = { ...s.mistakes };
      delete rest[mkey(kind, id)];
      return { ...s, mistakes: rest };
    });
  }, []);

  const setLastVisit = useCallback(
    (kind: 'phrases' | 'cards', id: string) =>
      setState((s) => (s.lastVisit?.kind === kind && s.lastVisit.id === id ? s : { ...s, lastVisit: { kind, id } })),
    [],
  );

  const toggleFavWord = useCallback((vi: string) => {
    setState((s) => {
      const set = new Set(s.favWords);
      if (set.has(vi)) set.delete(vi);
      else set.add(vi);
      return { ...s, favWords: [...set] };
    });
  }, []);

  const finishLevel = useCallback((levelId: string, stars: number) => {
    setState((s) => ({
      ...s,
      levels: { ...s.levels, [levelId]: Math.max(s.levels[levelId] ?? 0, stars) },
      xp: s.xp + 10 + stars * 5,
    }));
  }, []);

  const tick = useCallback(() => setState((s) => bump(s, dayKey())), []);

  const value = useMemo<Ctx>(() => {
    const done = (d: string) => (state.activity[d] ?? 0) >= state.goal;
    let d = done(today) ? today : addDays(today, -1);
    let streak = 0;
    while (done(d)) {
      streak++;
      d = addDays(d, -1);
    }
    return {
      ...state,
      loaded,
      today,
      todayCount: state.activity[today] ?? 0,
      streak,
      newLeftToday: (limit) => Math.max(0, limit - (state.newToday.day === today ? state.newToday.count : 0)),
      isKnown: (vi) => state.known.includes(vi),
      setKnown,
      isFavorite: (vi) => state.favorites.includes(vi),
      toggleFavorite,
      review,
      recordAnswer,
      removeMistake,
      tick,
      setGoal: (goal) => setState((s) => ({ ...s, goal })),
      setDrillSize: (drillSize) => setState((s) => ({ ...s, drillSize })),
      updateSettings: (patch) => setState((s) => ({ ...s, ...patch })),
      isFavWord: (vi) => state.favWords.includes(vi),
      toggleFavWord,
      finishLevel,
      setLastVisit,
      reset: () =>
        setState((s) => ({
          ...initial,
          appearance: s.appearance,
          autoPlay: s.autoPlay,
          speechRate: s.speechRate,
          textScale: s.textScale,
        })),
    };
  }, [state, loaded, today, setKnown, toggleFavorite, review, recordAnswer, removeMistake, tick, setLastVisit, toggleFavWord, finishLevel]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}

/** 读取设置；在 ProgressProvider 外面调用时返回默认值 */
export function useSettings(): Settings {
  const ctx = useContext(ProgressContext);
  return ctx ?? defaultSettings;
}
