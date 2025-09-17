export const APP_CONSTANTS = {
  JWT_SECRET: 'your-super-secret-jwt-key-change-in-production',
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
  PERMISSIONS: {
    USER_PERMISSIONS: '/permissions/user',
    MY_PERMISSIONS: '/permissions/my-permissions',
    CHECK_PERMISSION: '/permissions/check',
    MENU_ACCESS: '/permissions/menu-access',
    ROLE_PERMISSIONS: '/permissions/role-permissions',
    INITIALIZE: '/permissions/initialize',
  },
} as const;

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  ORDERS: '/orders',
  MARKETS: '/markets',
  WALLETS: '/wallets',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  PERMISSIONS: '/settings/permissions',
  AUDIT_LOGS: '/audit-logs',
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

// 권한 관리 상수
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: {
    role: 'super_admin',
    permissions: {
      dashboard: ['manage'],
      users: ['manage'],
      orders: ['manage'],
      markets: ['manage'],
      wallets: ['manage'],
      settings: ['manage'],
      reports: ['manage'],
      audit_logs: ['manage'],
    },
  },
  ADMIN: {
    role: 'admin',
    permissions: {
      dashboard: ['read'],
      users: ['read', 'update'],
      orders: ['read', 'update'],
      markets: ['read', 'update'],
      wallets: ['read', 'update'],
      reports: ['read'],
    },
  },
  USER_MANAGER: {
    role: 'user_manager',
    permissions: {
      dashboard: ['read'],
      users: ['manage'],
      reports: ['read'],
    },
  },
  ORDER_MANAGER: {
    role: 'order_manager',
    permissions: {
      dashboard: ['read'],
      orders: ['manage'],
      reports: ['read'],
    },
  },
  MARKET_MANAGER: {
    role: 'market_manager',
    permissions: {
      dashboard: ['read'],
      markets: ['manage'],
      reports: ['read'],
    },
  },
  WALLET_MANAGER: {
    role: 'wallet_manager',
    permissions: {
      dashboard: ['read'],
      wallets: ['manage'],
      reports: ['read'],
    },
  },
} as const;

export const MENU_PERMISSIONS = {
  dashboard: ['super_admin', 'admin', 'user_manager', 'order_manager', 'market_manager', 'wallet_manager'],
  users: ['super_admin', 'admin', 'user_manager'],
  orders: ['super_admin', 'admin', 'order_manager'],
  markets: ['super_admin', 'admin', 'market_manager'],
  wallets: ['super_admin', 'admin', 'wallet_manager'],
  settings: ['super_admin'],
  reports: ['super_admin', 'admin', 'user_manager', 'order_manager', 'market_manager', 'wallet_manager'],
  audit_logs: ['super_admin'],
} as const;
