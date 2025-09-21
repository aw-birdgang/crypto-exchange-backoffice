import { useState, useEffect } from 'react';
import { theme } from 'antd';

// 브레이크포인트 정의
export const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// 현재 브레이크포인트를 반환하는 훅
export const useBreakpoint = () => {
  const { token } = theme.useToken();
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg');
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      if (width < breakpoints.xs) {
        setCurrentBreakpoint('xs');
      } else if (width < breakpoints.sm) {
        setCurrentBreakpoint('sm');
      } else if (width < breakpoints.md) {
        setCurrentBreakpoint('md');
      } else if (width < breakpoints.lg) {
        setCurrentBreakpoint('lg');
      } else if (width < breakpoints.xl) {
        setCurrentBreakpoint('xl');
      } else {
        setCurrentBreakpoint('2xl');
      }
    };

    // 초기 설정
    updateBreakpoint();

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    currentBreakpoint,
    windowWidth,
    isMobile: currentBreakpoint === 'xs' || currentBreakpoint === 'sm',
    isTablet: currentBreakpoint === 'md',
    isDesktop: currentBreakpoint === 'lg' || currentBreakpoint === 'xl' || currentBreakpoint === '2xl',
    isSmallScreen: currentBreakpoint === 'xs' || currentBreakpoint === 'sm' || currentBreakpoint === 'md',
    isLargeScreen: currentBreakpoint === 'lg' || currentBreakpoint === 'xl' || currentBreakpoint === '2xl',
  };
};

// 특정 브레이크포인트 이상인지 확인하는 훅
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

// 반응형 값들을 관리하는 훅
export const useResponsive = () => {
  const { currentBreakpoint, isMobile, isTablet, isDesktop, isSmallScreen, isLargeScreen } = useBreakpoint();

  // 반응형 값 선택 함수
  const responsive = <T>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T => {
    return values[currentBreakpoint] ?? defaultValue;
  };

  // 반응형 스타일 생성 함수
  const getResponsiveStyle = (styles: Partial<Record<Breakpoint, React.CSSProperties>>) => {
    return styles[currentBreakpoint] || {};
  };

  // 그리드 컬럼 수 계산
  const getGridColumns = (baseColumns: number = 1) => {
    if (isMobile) return 1;
    if (isTablet) return Math.min(2, baseColumns);
    if (isDesktop) return baseColumns;
    return baseColumns;
  };

  // 카드 그리드 컬럼 수 계산
  const getCardColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    if (isDesktop) return 3;
    return 4;
  };

  // 테이블 스크롤 모드 결정
  const getTableScrollMode = () => {
    if (isMobile) return 'horizontal';
    if (isTablet) return 'horizontal';
    return 'auto';
  };

  // 사이드바 모드 결정
  const getSidebarMode = () => {
    if (isMobile) return 'drawer';
    if (isTablet) return 'collapsible';
    return 'fixed';
  };

  return {
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isLargeScreen,
    responsive,
    getResponsiveStyle,
    getGridColumns,
    getCardColumns,
    getTableScrollMode,
    getSidebarMode,
  };
};
