import React from 'react';
import { Button } from 'antd';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

/**
 * 스킵 링크 컴포넌트 - 키보드 사용자를 위한 접근성 개선
 */
export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <Button
      type="text"
      href={href}
      style={{
        position: 'absolute',
        top: '-40px',
        left: '6px',
        zIndex: 1000,
        background: '#000',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '4px',
        fontSize: '14px',
        textDecoration: 'none',
        transition: 'top 0.3s',
      }}
      onFocus={(e) => {
        e.currentTarget.style.top = '6px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.top = '-40px';
      }}
    >
      {children}
    </Button>
  );
};
