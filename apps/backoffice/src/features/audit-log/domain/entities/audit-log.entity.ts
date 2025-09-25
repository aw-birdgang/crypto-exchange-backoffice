export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  requestId: string;
  status: 'success' | 'failure' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  subcategory: string;
  metadata: Record<string, any>;
  createdAt: string;
  timestamp: string;
}

export interface AuditLogFilters {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action?: string;
  resource?: string;
  status?: 'success' | 'failure' | 'warning';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  subcategory?: string;
  ipAddress?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LogStatistics {
  totalLogs: number;
  successLogs: number;
  failureLogs: number;
  warningLogs: number;
  categoryStats: Record<string, number>;
  severityStats: Record<string, number>;
  userStats: Record<string, number>;
  hourlyStats: Record<string, number>;
}

export enum LogCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  USER_MANAGEMENT = 'user_management',
  WALLET_MANAGEMENT = 'wallet_management',
  CUSTOMER_SUPPORT = 'customer_support',
  SYSTEM_ADMINISTRATION = 'system_administration',
  SECURITY = 'security',
  DATA_ACCESS = 'data_access',
}

export enum LogAction {
  // Authentication & Authorization
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  TOKEN_REFRESH = 'token_refresh',
  PERMISSION_DENIED = 'permission_denied',
  ROLE_CHANGE = 'role_change',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',

  // User Management
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_APPROVED = 'user_approved',
  USER_REJECTED = 'user_rejected',
  USER_SUSPENDED = 'user_suspended',
  USER_ACTIVATED = 'user_activated',
  BULK_ACTION = 'bulk_action',

  // Wallet Management
  TRANSACTION_VIEWED = 'transaction_viewed',
  TRANSACTION_FILTERED = 'transaction_filtered',
  WALLET_BALANCE_VIEWED = 'wallet_balance_viewed',
  TRANSACTION_EXPORTED = 'transaction_exported',
  WALLET_ANALYSIS = 'wallet_analysis',

  // Customer Support
  TICKET_CREATED = 'ticket_created',
  TICKET_UPDATED = 'ticket_updated',
  TICKET_RESOLVED = 'ticket_resolved',
  TICKET_CLOSED = 'ticket_closed',
  CUSTOMER_CONTACTED = 'customer_contacted',

  // System Administration
  CONFIGURATION_CHANGED = 'configuration_changed',
  SYSTEM_BACKUP = 'system_backup',
  SYSTEM_RESTORE = 'system_restore',
  DATABASE_MAINTENANCE = 'database_maintenance',
  SECURITY_SCAN = 'security_scan',

  // Data Access
  DATA_VIEWED = 'data_viewed',
  DATA_EXPORTED = 'data_exported',
  DATA_MODIFIED = 'data_modified',
  DATA_DELETED = 'data_deleted',
}

export enum LogSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum LogStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  WARNING = 'warning',
}
