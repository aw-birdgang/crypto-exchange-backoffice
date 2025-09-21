export const appConfig = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    version: import.meta.env.VITE_API_VERSION || 'v1',
    get baseApiUrl() {
      return `${this.baseUrl}/api/${this.version}`;
    },
    get healthUrl() {
      return `${this.baseUrl}/health`;
    },
    get docsUrl() {
      return `${this.baseUrl}/api-docs`;
    },
  },
  
  // Application Configuration
  app: {
    name: 'Crypto Exchange Backoffice',
    version: '1.0.0',
  },
  
  // Environment
  environment: {
    mode: import.meta.env.MODE || 'development',
    get isDevelopment() {
      return this.mode === 'development';
    },
    get isProduction() {
      return this.mode === 'production';
    },
  },
  
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
