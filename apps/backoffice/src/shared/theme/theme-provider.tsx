import React, { createContext, useContext, ReactNode } from 'react';
import { ConfigProvider, theme } from 'antd';
import { designTokens } from './design-tokens';

// 테마 타입 정의
export interface AppTheme {
  mode: 'light' | 'dark';
  colors: typeof designTokens.colors;
  typography: typeof designTokens.typography;
  spacing: typeof designTokens.spacing;
  borderRadius: typeof designTokens.borderRadius;
  boxShadow: typeof designTokens.boxShadow;
  animation: typeof designTokens.animation;
  breakpoints: typeof designTokens.breakpoints;
  zIndex: typeof designTokens.zIndex;
}

// 테마 컨텍스트
const ThemeContext = createContext<{
  theme: AppTheme;
  toggleTheme: () => void;
} | null>(null);

// 테마 훅
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 테마 프로바이더 props
interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: 'light' | 'dark';
}

// Ant Design 테마 토큰 생성
const createAntdTheme = (appTheme: AppTheme) => {
  const { colors } = appTheme;
  
  return {
    token: {
      // 색상
      colorPrimary: colors.primary[500],
      colorSuccess: colors.success[500],
      colorWarning: colors.warning[500],
      colorError: colors.error[500],
      colorInfo: colors.primary[500],
      
      // 배경색
      colorBgContainer: colors.semantic.background.primary,
      colorBgElevated: colors.semantic.background.elevated,
      colorBgLayout: colors.semantic.background.secondary,
      colorBgMask: 'rgba(0, 0, 0, 0.45)',
      
      // 텍스트 색상
      colorText: colors.semantic.text.primary,
      colorTextSecondary: colors.semantic.text.secondary,
      colorTextTertiary: colors.semantic.text.tertiary,
      colorTextQuaternary: colors.semantic.text.disabled,
      
      // 보더 색상
      colorBorder: colors.semantic.border.primary,
      colorBorderSecondary: colors.semantic.border.secondary,
      
      // 폰트
      fontFamily: appTheme.typography.fontFamily.sans.join(', '),
      fontSize: 14,
      fontSizeHeading1: 36,
      fontSizeHeading2: 30,
      fontSizeHeading3: 24,
      fontSizeHeading4: 20,
      fontSizeHeading5: 18,
      
      // 간격
      padding: 16,
      paddingLG: 24,
      paddingXL: 32,
      margin: 16,
      marginLG: 24,
      marginXL: 32,
      
      // 보더 반경
      borderRadius: 6,
      borderRadiusLG: 8,
      
      // 그림자
      boxShadow: appTheme.boxShadow.base,
      boxShadowSecondary: appTheme.boxShadow.sm,
      
      // 애니메이션
      motionDurationFast: appTheme.animation.duration.fast,
      motionDurationMid: appTheme.animation.duration.normal,
      motionDurationSlow: appTheme.animation.duration.slow,
      motionEaseInOut: appTheme.animation.easing.easeInOut,
    },
    components: {
      Layout: {
        headerBg: colors.semantic.background.primary,
        siderBg: colors.semantic.background.primary,
        bodyBg: colors.semantic.background.secondary,
      },
      Menu: {
        itemBg: 'transparent',
        itemSelectedBg: colors.primary[50],
        itemHoverBg: colors.primary[50],
        itemActiveBg: colors.primary[100],
        itemSelectedColor: colors.primary[600],
        itemColor: colors.semantic.text.secondary,
        itemHoverColor: colors.semantic.text.primary,
      },
      Card: {
        headerBg: colors.semantic.background.primary,
        bodyBg: colors.semantic.background.primary,
        boxShadow: appTheme.boxShadow.base,
      },
      Button: {
        primaryShadow: `0 2px 0 ${colors.primary[200]}`,
        defaultShadow: `0 2px 0 ${colors.neutral[200]}`,
      },
      Table: {
        headerBg: colors.semantic.background.tertiary,
        rowHoverBg: colors.primary[50],
      },
      Form: {
        labelColor: colors.semantic.text.primary,
        labelRequiredMarkColor: colors.error[500],
      },
    },
  };
};

// 테마 프로바이더 컴포넌트
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultMode = 'light' 
}) => {
  const [mode, setMode] = React.useState<'light' | 'dark'>(defaultMode);
  
  // 앱 테마 생성
  const appTheme: AppTheme = {
    mode,
    colors: designTokens.colors,
    typography: designTokens.typography,
    spacing: designTokens.spacing,
    borderRadius: designTokens.borderRadius,
    boxShadow: designTokens.boxShadow,
    animation: designTokens.animation,
    breakpoints: designTokens.breakpoints,
    zIndex: designTokens.zIndex,
  };
  
  // 테마 토글 함수
  const toggleTheme = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  // Ant Design 테마 생성
  const antdTheme = createAntdTheme(appTheme);
  
  return (
    <ThemeContext.Provider value={{ theme: appTheme, toggleTheme }}>
      <ConfigProvider theme={antdTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
