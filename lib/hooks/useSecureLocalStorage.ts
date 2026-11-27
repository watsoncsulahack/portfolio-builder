/**
 * useSecureLocalStorage
 * Thin wrapper around localStorage for sensitive values like PATs.
 * Keys are prefixed with "pb_" (portfolio builder) to avoid collisions.
 * Values are stored as-is in localStorage — this is local-only storage,
 * never sent to the server, and never committed to source control.
 */
import { useState, useEffect, useCallback } from "react";

const PREFIX = "pb_";

export function useSecureLocalStorage(key: string, defaultValue = "") {
  const storageKey = PREFIX + key;

  const [value, setValue] = useState<string>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) setValue(stored);
    } catch { /* private browsing mode */ }
    setHydrated(true);
  }, [storageKey]);

  const set = useCallback((next: string) => {
    setValue(next);
    try {
      if (next) {
        localStorage.setItem(storageKey, next);
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch { /* private browsing mode */ }
  }, [storageKey]);

  const clear = useCallback(() => set(""), [set]);

  return { value, set, clear, hydrated };
}
