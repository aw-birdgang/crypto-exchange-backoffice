import React from 'react';
import { Row, Col, RowProps, ColProps } from 'antd';
import { useResponsive } from '../../hooks';

interface ResponsiveGridProps extends Omit<RowProps, 'gutter'> {
  children: React.ReactNode;
  gutter?: number | [number, number] | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number };
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number };
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

interface ResponsiveColProps {
  children: React.ReactNode;
  span?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number };
  offset?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number };
  order?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number };
  className?: string;
  style?: React.CSSProperties;
}

// 반응형 그리드 컨테이너
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  gutter,
  columns,
  spacing = 'md',
  ...props
}) => {
  const { isMobile, isTablet, isDesktop, getGridColumns } = useResponsive();

  // 기본 간격 설정
  const getDefaultGutter = () => {
    if (gutter !== undefined) return gutter;
    
    switch (spacing) {
      case 'none': return 0;
      case 'sm': return isMobile ? 8 : 12;
      case 'md': return isMobile ? 12 : isTablet ? 16 : 24;
      case 'lg': return isMobile ? 16 : isTablet ? 20 : 32;
      case 'xl': return isMobile ? 20 : isTablet ? 24 : 40;
      default: return isMobile ? 12 : isTablet ? 16 : 24;
    }
  };

  // 컬럼 수 계산
  const getColumns = () => {
    if (typeof columns === 'number') {
      return columns;
    }
    if (typeof columns === 'object') {
      if (isMobile) return columns.xs || 1;
      if (isTablet) return columns.sm || columns.md || 2;
      if (isDesktop) return columns.lg || columns.xl || columns.xxl || 3;
      return 3;
    }
    return getGridColumns(3);
  };

  return (
    <Row
      gutter={getDefaultGutter()}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement<ResponsiveColProps>(child)) {
          const totalColumns = getColumns();
          const colSpan = typeof child.props.span === 'number' 
            ? child.props.span 
            : totalColumns;
          
          return React.cloneElement(child, {
            ...child.props,
            span: colSpan,
            key: child.key || index,
          });
        }
        return child;
      })}
    </Row>
  );
};

// 반응형 그리드 아이템
export const ResponsiveCol: React.FC<ResponsiveColProps> = ({
  children,
  span,
  offset,
  order,
  className,
  style,
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // 반응형 span 계산
  const getResponsiveSpan = () => {
    if (typeof span === 'number') return span;
    if (typeof span === 'object') {
      if (isMobile) return span.xs || 24;
      if (isTablet) return span.sm || span.md || 12;
      if (isDesktop) return span.lg || span.xl || span.xxl || 8;
      return 8;
    }
    return 24;
  };

  // 반응형 offset 계산
  const getResponsiveOffset = () => {
    if (typeof offset === 'number') return offset;
    if (typeof offset === 'object') {
      if (isMobile) return offset.xs || 0;
      if (isTablet) return offset.sm || offset.md || 0;
      if (isDesktop) return offset.lg || offset.xl || offset.xxl || 0;
      return 0;
    }
    return 0;
  };

  // 반응형 order 계산
  const getResponsiveOrder = () => {
    if (typeof order === 'number') return order;
    if (typeof order === 'object') {
      if (isMobile) return order.xs || 0;
      if (isTablet) return order.sm || order.md || 0;
      if (isDesktop) return order.lg || order.xl || order.xxl || 0;
      return 0;
    }
    return 0;
  };

  return (
    <Col
      span={getResponsiveSpan()}
      offset={getResponsiveOffset()}
      order={getResponsiveOrder()}
      className={className}
      style={style}
    >
      {children}
    </Col>
  );
};

// 카드 그리드 컴포넌트
interface CardGridProps {
  children: React.ReactNode;
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number };
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
}

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  columns,
  spacing = 'md',
  className,
  style,
}) => {
  const { getCardColumns } = useResponsive();

  const getColumns = () => {
    if (typeof columns === 'number') return columns;
    if (typeof columns === 'object') {
      const { isMobile, isTablet, isDesktop } = useResponsive();
      if (isMobile) return columns.xs || 1;
      if (isTablet) return columns.sm || columns.md || 2;
      if (isDesktop) return columns.lg || columns.xl || columns.xxl || 3;
      return 3;
    }
    return getCardColumns();
  };

  const getGutter = () => {
    switch (spacing) {
      case 'none': return 0;
      case 'sm': return 8;
      case 'md': return 16;
      case 'lg': return 24;
      case 'xl': return 32;
      default: return 16;
    }
  };

  const totalColumns = getColumns();
  const gutter = getGutter();

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${totalColumns}, 1fr)`,
        gap: gutter,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// 반응형 컨테이너
interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'xl',
  padding = 'md',
  className,
  style,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [isReady, setIsReady] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    // 컴포넌트 마운트 상태 설정
    setIsMounted(true);
    
    // 레이아웃 안정화
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const getMaxWidth = () => {
    const maxWidths = {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1200px',
      '2xl': '1400px',
      full: '100%',
    };
    return maxWidths[maxWidth];
  };

  const getPadding = () => {
    switch (padding) {
      case 'none': return '0';
      case 'sm': return isMobile ? '8px' : '12px';
      case 'md': return isMobile ? '12px' : isTablet ? '16px' : '24px';
      case 'lg': return isMobile ? '16px' : isTablet ? '20px' : '32px';
      case 'xl': return isMobile ? '20px' : isTablet ? '24px' : '40px';
      default: return isMobile ? '12px' : isTablet ? '16px' : '24px';
    }
  };

  return (
    <div
      className={`${className || ''} ${isReady ? 'container-ready' : 'container-loading'} ${isMounted ? 'container-mounted' : 'container-unmounted'}`}
      style={{
        maxWidth: getMaxWidth(),
        margin: '0 auto',
        padding: getPadding(),
        width: '100%',
        opacity: isReady && isMounted ? 1 : 0.7,
        transform: isReady && isMounted ? 'translateY(0)' : 'translateY(15px)',
        transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
