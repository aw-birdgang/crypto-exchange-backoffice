export const APP_CONSTANTS = {
  JWT_SECRET: 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: '24h',
  JWT_REFRESH_EXPIRES_IN: '7d',
  BCRYPT_ROUNDS: 12,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  API_RATE_LIMIT: 100,
  API_RATE_WINDOW: 900000, // 15 minutes
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
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
  
  // 지갑관리 라우트
  WALLET: {
    TRANSACTIONS: '/wallet/transactions',
  },
  
  // 고객관리 라우트
  CUSTOMER: {
    SUPPORT: '/customer/support',
  },
  
  // 어드민 계정 관리 라우트
  ADMIN: {
    PERMISSIONS: '/admin/permissions',
    USERS: '/admin/users',
  },
  
  // 기존 라우트 (호환성을 위해 유지)
  PERMISSIONS: '/admin/permissions',
  USERS: '/customer/users',
  USERS_PENDING: '/customer/users/pending',
  USERS_APPROVED: '/customer/users/approved',
  USERS_REJECTED: '/customer/users/rejected',
  USERS_SUSPENDED: '/customer/users/suspended',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  AUTH_STORAGE: 'auth-storage',
  PERMISSION_STORAGE: 'permission-storage',
  AUTH_LOGGED_OUT: 'auth-logged-out',
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
      settings: ['manage'],
      permissions: ['manage'],
      users: ['manage'],
      roles: ['manage'],
    },
  },
  ADMIN: {
    role: 'admin',
    permissions: {
      dashboard: ['read'],
      settings: ['read'],
      permissions: ['read'],
      users: ['read'],
      roles: ['read'],
    },
  },
} as const;

export const MENU_PERMISSIONS = {
  dashboard: ['super_admin', 'admin'],
  settings: ['super_admin', 'admin'],
  permissions: ['super_admin', 'admin'],
  users: ['super_admin', 'admin'],
  roles: ['super_admin', 'admin'],
} as const;
