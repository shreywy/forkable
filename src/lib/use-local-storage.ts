"use client";

import { useCallback, useSyncExternalStore } from "react";

// Per-key listener registry so multiple components stay in sync within a tab.
const listeners = new Map<string, Set<() => void>>();

function emit(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

/**
 * Read/write a localStorage key with SSR-safe hydration.
 *
 * Server render (and the hydration pass) sees `null`; the first client render
 * after hydration picks up the stored value, so there is never a markup
 * mismatch. Updates propagate to every subscribed component in this tab and,
 * via the `storage` event, to other tabs.
 */
export function useLocalStorage(key: string): [string | null, (next: string | null) => void] {
  const subscribe = useCallback(
    (cb: () => void) => {
      let set = listeners.get(key);
      if (!set) {
        set = new Set();
        listeners.set(key, set);
      }
      set.add(cb);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) cb();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        set.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key],
  );

  const value = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key),
    () => null,
  );

  const setValue = useCallback(
    (next: string | null) => {
      try {
        if (next === null) localStorage.removeItem(key);
        else localStorage.setItem(key, next);
      } catch {
        /* ignore quota errors */
      }
      emit(key);
    },
    [key],
  );

  return [value, setValue];
}
