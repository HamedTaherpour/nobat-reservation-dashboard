"use client";

import { useEffect, useRef, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const appliedValueRef = useRef(value);

  useEffect(() => {
    if (Object.is(appliedValueRef.current, value)) return;

    const timeoutId = window.setTimeout(() => {
      appliedValueRef.current = value;
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [delay, value]);

  return debouncedValue;
}
