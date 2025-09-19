export const appConfig = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  
  // Application Configuration
  appName: 'Crypto Exchange Backoffice',
  version: '1.0.0',
  
  // Query Configuration
  query: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retryCount: 3,
    refetchOnWindowFocus: false,
  },
  
  // Pagination Configuration
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  
  // UI Configuration
  ui: {
    theme: 'light',
    locale: 'ko-KR',
    timezone: 'Asia/Seoul',
  },
} as const;

export type AppConfig = typeof appConfig;
