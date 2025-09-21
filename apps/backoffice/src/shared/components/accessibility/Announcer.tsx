import React, { useEffect, useState } from 'react';

interface AnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

/**
 * 스크린 리더를 위한 공지 컴포넌트
 */
export const Announcer: React.FC<AnnouncerProps> = ({ message, priority = 'polite' }) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (message) {
      setAnnouncement(message);
      // 메시지를 읽은 후 초기화
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [message]);

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      {announcement}
    </div>
  );
};
