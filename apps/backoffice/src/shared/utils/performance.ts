import React, { useCallback, useMemo, useRef } from 'react';

// 메모이제이션을 위한 헬퍼 함수들
export const useStableCallback = <T extends (...args: any[]) => any>(callback: T): T => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
};

// 객체 비교를 위한 깊은 비교 함수
export const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  return false;
};

// 디바운스 훅
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// 쓰로틀 훅
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T => {
  const lastRun = useRef(Date.now());
  
  return useCallback((...args: any[]) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]) as T;
};

// 가상화를 위한 아이템 크기 계산
export const calculateItemSize = (
  containerHeight: number,
  itemCount: number,
  minItemHeight: number = 50,
): number => {
  const calculatedHeight = containerHeight / itemCount;
  return Math.max(calculatedHeight, minItemHeight);
};

// 이미지 지연 로딩을 위한 Intersection Observer
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {},
) => {
  const targetRef = useRef<HTMLElement>(null);

  React.useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, options);

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [callback, options]);

  return targetRef;
};

// 성능 측정을 위한 유틸리티
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// 메모리 사용량 측정
export const measureMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    };
  }
  return null;
};
