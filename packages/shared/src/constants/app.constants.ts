export const APP_CONSTANTS = {
  JWT_SECRET: 'your-secret-key',
  JWT_EXPIRES_IN: '24h',
  BCRYPT_ROUNDS: 12,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
  USERS: '/users',
  ORDERS: '/orders',
  MARKETS: '/markets',
  WALLETS: '/wallets',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  ORDERS: '/orders',
  MARKETS: '/markets',
  WALLETS: '/wallets',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
} as const;

export const DATE_FORMATS = {
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
} as const;

export const DATABASE_CONSTANTS = {
  DEFAULT_CONNECTION: 'default',
} as const;
