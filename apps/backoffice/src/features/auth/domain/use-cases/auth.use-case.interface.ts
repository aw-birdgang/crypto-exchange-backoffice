import { AdminUser } from '@crypto-exchange/shared';

// 타입 정의
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * 인증 Use Case 인터페이스
 */
export interface AuthUseCase {
  // 인증 관련 Use Cases
  login(email: string, password: string): Promise<AuthResponse>;
  register(userData: RegisterRequest): Promise<AuthResponse>;
  refreshToken(refreshToken: string): Promise<RefreshResponse>;
  logout(): Promise<void>;
  
  // 사용자 프로필 관련 Use Cases
  getCurrentAdminUser(): Promise<AdminUser | null>;
  updateProfile(userData: Partial<AdminUser>): Promise<AdminUser>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  
  // 토큰 관리 Use Cases
  validateToken(token: string): Promise<boolean>;
  revokeToken(token: string): Promise<void>;
  revokeAllTokens(): Promise<void>;
}

/**
 * 권한 Use Case 인터페이스
 */
export interface PermissionUseCase {
  // 권한 조회 Use Cases
  getMyPermissions(): Promise<AdminUserPermissions>;
  getUserPermissions(userId: string): Promise<AdminUserPermissions>;
  checkPermission(resource: Resource, permission: Permission): Promise<boolean>;
  checkMenuAccess(menuKey: string): Promise<boolean>;
  
  // 역할 관리 Use Cases
  getRoles(): Promise<Role[]>;
  createRole(roleData: CreateRoleRequest): Promise<Role>;
  updateRole(roleId: string, roleData: UpdateRoleRequest): Promise<Role>;
  deleteRole(roleId: string): Promise<void>;
  
  // 사용자 역할 할당 Use Cases
  assignRoleToUser(userId: string, roleId: string, expiresAt?: Date): Promise<void>;
  removeRoleFromUser(userId: string, roleId: string): Promise<void>;
  getUserRoles(userId: string): Promise<AdminUserRoleAssignment[]>;
  
  // 권한 템플릿 Use Cases
  getPermissionTemplates(): Promise<PermissionTemplate[]>;
  createPermissionTemplate(templateData: CreatePermissionTemplateRequest): Promise<PermissionTemplate>;
}

/**
 * 인증 검증 Use Case 인터페이스
 */
export interface AuthValidationUseCase {
  validateLoginCredentials(email: string, password: string): Promise<{ isValid: boolean; errors: string[] }>;
  validateRegistrationData(userData: RegisterRequest): Promise<{ isValid: boolean; errors: string[] }>;
  validatePasswordStrength(password: string): Promise<{ isValid: boolean; errors: string[] }>;
  validateEmailFormat(email: string): Promise<boolean>;
  canAccessResource(resource: Resource, permission: Permission): Promise<boolean>;
}

// 타입 정의
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AdminUserPermissions {
  userId: string;
  permissions: Record<string, string[]>;
  role?: string;
  expiresAt?: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, string[]>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: Record<string, string[]>;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: Record<string, string[]>;
}

export interface AdminUserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  assignedAt: Date;
  expiresAt?: Date;
  assignedBy: string;
}

export interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, string[]>;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePermissionTemplateRequest {
  name: string;
  description: string;
  permissions: Record<string, string[]>;
  isDefault?: boolean;
}

export enum Resource {
  DASHBOARD = 'dashboard',
  SETTINGS = 'settings',
  PERMISSIONS = 'permissions',
  ROLES = 'roles',
  USERS = 'users',
  WALLET = 'wallet',
  CUSTOMER = 'customer',
}

export enum Permission {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}
