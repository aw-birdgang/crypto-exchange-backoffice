// XSS 방지를 위한 입력 검증 및 정리
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // HTML 태그 제거
    .replace(/javascript:/gi, '') // JavaScript URL 제거
    .replace(/on\w+\s*=/gi, '') // 이벤트 핸들러 제거
    .trim();
};

// SQL Injection 방지를 위한 입력 검증
export const validateInput = (input: string): boolean => {
  if (typeof input !== 'string') {
    return false;
  }

  // 위험한 SQL 키워드 검사
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(\b(OR|AND)\s+['"]\s*=\s*['"])/gi,
    /(\b(OR|AND)\s+['"]\s*LIKE\s*['"])/gi,
  ];

  return !dangerousPatterns.some(pattern => pattern.test(input));
};

// CSRF 토큰 생성
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// CSRF 토큰 검증
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken && token.length === 64;
};

// 안전한 로컬 스토리지 사용
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      const sanitizedValue = sanitizeInput(value);
      localStorage.setItem(key, sanitizedValue);
    } catch (error) {
      console.error('Failed to set secure storage item:', error);
    }
  },

  getItem: (key: string): string | null => {
    try {
      const value = localStorage.getItem(key);
      return value ? sanitizeInput(value) : null;
    } catch (error) {
      console.error('Failed to get secure storage item:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove secure storage item:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear secure storage:', error);
    }
  },
};

// Content Security Policy 헬퍼
export const getCSPDirectives = (): Record<string, string[]> => {
  return {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'", process.env.VITE_API_BASE_URL || 'http://localhost:3001'],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  };
};

// 안전한 URL 생성
export const createSafeUrl = (baseUrl: string, path: string): string => {
  const sanitizedPath = sanitizeInput(path);
  const url = new URL(sanitizedPath, baseUrl);
  
  // 프로토콜 검증
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Invalid protocol');
  }
  
  return url.toString();
};

// 민감한 데이터 마스킹
export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }
  
  const visible = data.slice(-visibleChars);
  const masked = '*'.repeat(data.length - visibleChars);
  
  return masked + visible;
};

// 토큰 만료 시간 검증
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// 안전한 JSON 파싱
export const safeJsonParse = <T>(jsonString: string, defaultValue: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return defaultValue;
  }
};
