
export interface BaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ApiResponse는 api.types.ts에서 정의됨

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  email: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}


export enum AdminUserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  SUPPORT = 'SUPPORT',
  AUDITOR = 'AUDITOR',
}

export enum Permission {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage', // 모든 권한 포함
}

export enum Resource {
  DASHBOARD = 'dashboard',
  SETTINGS = 'settings',
  PERMISSIONS = 'permissions',
  USERS = 'users',
  ROLES = 'roles',
  
  // 지갑관리 리소스
  WALLET = 'wallet',
  WALLET_TRANSACTIONS = 'wallet_transactions',
  
  // 고객관리 리소스
  CUSTOMER_SUPPORT = 'customer_support',
  
  // 어드민 계정 관리 리소스
  ADMIN_USERS = 'admin_users',
}

export interface RolePermission {
  id: string;
  role: AdminUserRole;
  resource: Resource;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPermissions {
  userId: string;
  role: AdminUserRole;
  permissions: {
    resource: Resource;
    permissions: Permission[];
  }[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: RolePermission[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  permissions: {
    resource: Resource;
    permissions: Permission[];
  }[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path: string;
  requiredPermissions: {
    resource: Resource;
    permissions: Permission[];
  }[];
  children?: MenuItem[];
}

export interface PermissionCheckRequest {
  resource: Resource;
  permission: Permission;
  userId?: string;
}

export interface PermissionCheckResponse {
  hasPermission: boolean;
  reason?: string;
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

// User interface removed - use AdminUser instead

export interface AdminUser extends BaseEntity {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  adminRole: AdminUserRole;
  permissions: string[];
  isActive: boolean;
  status: UserStatus;
  approvedBy?: string;
  approvedAt?: string;
  lastLoginAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface UserApprovalRequest {
  role: AdminUserRole;
  isActive: boolean;
}

export interface UserBulkAction {
  userIds: string[];
  action: 'approve' | 'reject' | 'suspend' | 'activate' | 'deactivate';
  role?: AdminUserRole;
}

export interface UserStats {
  totalUsers?: number;
  activeUsers?: number;
  pendingUsers?: number;
  approvedUsers?: number;
  rejectedUsers?: number;
  suspendedUsers?: number;
  todayRegistrations?: number;
  weeklyRegistrations?: number;
  monthlyRegistrations?: number;
  roleStats?: Record<string, number>;
}

export interface UserFilters {
  status?: UserStatus;
  role?: AdminUserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'email' | 'firstName' | 'lastName';
  sortOrder?: 'asc' | 'desc';
}
