import { useEffect, useRef } from 'react';

/**
 * Runs `effect` whenever `value` changes, debounced by `delayMs`. Cancels the
 * pending call if `value` changes again before the delay elapses.
 */
export function useDebouncedEffect<T>(value: T, delayMs: number, effect: (v: T) => void): void {
  const effectRef = useRef(effect);
  effectRef.current = effect;

  useEffect(() => {
    const id = window.setTimeout(() => effectRef.current(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
}
