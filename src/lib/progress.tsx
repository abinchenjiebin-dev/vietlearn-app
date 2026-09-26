import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'vietlearn.progress.v1';

type ProgressState = {
  /** 已掌握的词汇（越南语原文） */
  known: string[];
  /** 收藏的常用语 */
  favorites: string[];
  /** 组词、组句子答对次数 */
  compoundCorrect: number;
  sentenceCorrect: number;
};

const initial: ProgressState = { known: [], favorites: [], compoundCorrect: 0, sentenceCorrect: 0 };

type Ctx = ProgressState & {
  isKnown: (vi: string) => boolean;
  setKnown: (vi: string, known: boolean) => void;
  isFavorite: (vi: string) => boolean;
  toggleFavorite: (vi: string) => void;
  addCompoundCorrect: () => void;
  addSentenceCorrect: () => void;
  reset: () => void;
};

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setState({ ...initial, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  const setKnown = useCallback((vi: string, known: boolean) => {
    setState((s) => {
      const set = new Set(s.known);
      if (known) set.add(vi);
      else set.delete(vi);
      return { ...s, known: [...set] };
    });
  }, []);

  const toggleFavorite = useCallback((vi: string) => {
    setState((s) => {
      const set = new Set(s.favorites);
      if (set.has(vi)) set.delete(vi);
      else set.add(vi);
      return { ...s, favorites: [...set] };
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      isKnown: (vi) => state.known.includes(vi),
      setKnown,
      isFavorite: (vi) => state.favorites.includes(vi),
      toggleFavorite,
      addCompoundCorrect: () => setState((s) => ({ ...s, compoundCorrect: s.compoundCorrect + 1 })),
      addSentenceCorrect: () => setState((s) => ({ ...s, sentenceCorrect: s.sentenceCorrect + 1 })),
      reset: () => setState(initial),
    }),
    [state, setKnown, toggleFavorite],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
