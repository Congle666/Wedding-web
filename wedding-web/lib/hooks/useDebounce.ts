'use client';

import { useEffect, useState } from 'react';

/**
 * Hook trì hoãn giá trị theo khoảng thời gian cho trước.
 * Thường dùng cho ô tìm kiếm để tránh gọi API liên tục.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
