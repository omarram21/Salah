import { useSyncExternalStore } from 'react';

type PersistApi = {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
};

/** True once a persisted Zustand store has loaded from AsyncStorage. */
export function useHydrated(store: PersistApi): boolean {
  return useSyncExternalStore(store.persist.onFinishHydration, store.persist.hasHydrated);
}
