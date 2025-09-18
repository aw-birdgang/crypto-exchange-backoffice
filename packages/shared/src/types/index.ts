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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

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

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
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
}

export interface RolePermission {
  id: string;
  role: UserRole;
  resource: Resource;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPermissions {
  userId: string;
  role: UserRole;
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

export interface UserRoleAssignment {
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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
