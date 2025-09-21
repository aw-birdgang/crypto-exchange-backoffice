import { useState, useCallback } from 'react';

/**
 * 스크린 리더 공지를 위한 훅
 */
export function useAnnouncer() {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((text: string, messagePriority: 'polite' | 'assertive' = 'polite') => {
    setMessage(text);
    setPriority(messagePriority);
  }, []);

  const announceError = useCallback((text: string) => {
    announce(text, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((text: string) => {
    announce(text, 'polite');
  }, [announce]);

  return {
    message,
    priority,
    announce,
    announceError,
    announceSuccess,
  };
}
