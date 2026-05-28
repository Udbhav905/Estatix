import { useState, useEffect } from 'react';

/**
 * useDebounce - returns a debounced value that updates after the delay.
 * @param value The value to debounce.
 * @param delay Milliseconds to wait before updating.
 */
export default function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}
