import { 
  AuthUseCase, 
  PermissionUseCase, 
  AuthValidationUseCase,
  RegisterRequest,
  AdminUserPermissions,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  AdminUserRoleAssignment,
  PermissionTemplate,
  CreatePermissionTemplateRequest,
  Resource,
  Permission
} from '../../domain/use-cases/auth.use-case.interface';
import { Resource as SharedResource, Permission as SharedPermission, Role as SharedRole } from '@crypto-exchange/shared';
import { AuthService } from '../services/auth.service';
import { PermissionService } from '../services/permission.service';
import { AdminUser } from '@crypto-exchange/shared';

/**
 * 인증 Use Case 구현체
 */
export class AuthUseCaseImpl implements AuthUseCase {
  constructor(private readonly authService: AuthService) {}

  async login(email: string, password: string) {
    // 비즈니스 로직: 로그인 검증
    this.validateEmailFormat(email);
    this.validatePasswordNotEmpty(password);
    
    return await this.authService.login({ email, password });
  }

  async register(userData: RegisterRequest) {
    // 비즈니스 로직: 회원가입 검증
    this.validateRegistrationData(userData);
    
    return await this.authService.register(userData);
  }

  async refreshToken(refreshToken: string) {
    // 비즈니스 로직: 리프레시 토큰 검증
    if (!refreshToken || refreshToken.trim() === '') {
      throw new Error('Refresh token is required');
    }
    
    return await this.authService.refreshToken(refreshToken);
  }

  async logout() {
    // 비즈니스 로직: 로그아웃 처리
    await this.authService.logout();
  }

  async getCurrentAdminUser(): Promise<AdminUser | null> {
    // 비즈니스 로직: 현재 사용자 조회
    try {
      // 실제로는 토큰에서 사용자 정보 추출
      return null; // 임시 구현
    } catch {
      return null;
    }
  }

  async updateProfile(userData: Partial<AdminUser>): Promise<AdminUser> {
    // 비즈니스 로직: 프로필 업데이트 검증
    this.validateProfileUpdateData(userData);
    
    // 실제 구현에서는 API 호출
    throw new Error('Not implemented');
  }

  async changePassword(currentPassword: string, newPassword: string) {
    // 비즈니스 로직: 비밀번호 변경 검증
    this.validatePasswordStrength(newPassword);
    this.validatePasswordNotEmpty(currentPassword);
    
    // 실제 구현에서는 API 호출
    throw new Error('Not implemented');
  }

  async validateToken(token: string): Promise<boolean> {
    // 비즈니스 로직: 토큰 유효성 검사
    if (!token || token.trim() === '') {
      return false;
    }
    
    // 실제 구현에서는 JWT 검증
    return true; // 임시 구현
  }

  async revokeToken(token: string) {
    // 비즈니스 로직: 토큰 무효화
    if (!token || token.trim() === '') {
      throw new Error('Token is required');
    }
    
    // 실제 구현에서는 토큰 블랙리스트에 추가
  }

  async revokeAllTokens() {
    // 비즈니스 로직: 모든 토큰 무효화
    // 실제 구현에서는 사용자의 모든 토큰을 블랙리스트에 추가
  }

  // Private helper methods
  private validateEmailFormat(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  private validatePasswordNotEmpty(password: string): void {
    if (!password || password.trim() === '') {
      throw new Error('Password is required');
    }
  }

  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      throw new Error('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }
  }

  private validateRegistrationData(userData: RegisterRequest): void {
    this.validateEmailFormat(userData.email);
    this.validatePasswordStrength(userData.password);
    
    if (!userData.firstName || userData.firstName.trim().length < 2) {
      throw new Error('First name must be at least 2 characters long');
    }
    
    if (!userData.lastName || userData.lastName.trim().length < 2) {
      throw new Error('Last name must be at least 2 characters long');
    }
  }

  private validateProfileUpdateData(userData: Partial<AdminUser>): void {
    if (userData.email) {
      this.validateEmailFormat(userData.email);
    }
    
    if (userData.firstName && userData.firstName.length < 2) {
      throw new Error('First name must be at least 2 characters long');
    }
    
    if (userData.lastName && userData.lastName.length < 2) {
      throw new Error('Last name must be at least 2 characters long');
    }
  }
}

/**
 * 권한 Use Case 구현체
 */
export class PermissionUseCaseImpl implements PermissionUseCase {
  constructor(private readonly permissionService: PermissionService) {}

  async getMyPermissions(): Promise<AdminUserPermissions> {
    const permissions = await this.permissionService.getMyPermissions();
    return permissions as any;
  }

  async getUserPermissions(userId: string): Promise<AdminUserPermissions> {
    if (!userId || userId.trim() === '') {
      throw new Error('AdminUser ID is required');
    }
    
    const permissions = await this.permissionService.getUserPermissions(userId);
    return permissions as any;
  }

  async checkPermission(resource: Resource, permission: Permission): Promise<boolean> {
    if (!resource || !permission) {
      throw new Error('Resource and permission are required');
    }
    
    const response = await this.permissionService.checkPermission({
      resource: resource as any,
      permission: permission as any,
      userId: '', // 실제로는 현재 사용자 ID
    });
    return response.hasPermission;
  }

  async checkMenuAccess(menuKey: string): Promise<boolean> {
    if (!menuKey || menuKey.trim() === '') {
      throw new Error('Menu key is required');
    }
    
    return await this.permissionService.checkMenuAccess(menuKey);
  }

  async getRoles(): Promise<Role[]> {
    const roles = await this.permissionService.getRoles();
    return roles as any;
  }

  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    this.validateRoleData(roleData);
    const role = await this.permissionService.createRole(roleData as any);
    return role as any;
  }

  async updateRole(roleId: string, roleData: UpdateRoleRequest): Promise<Role> {
    if (!roleId || roleId.trim() === '') {
      throw new Error('Role ID is required');
    }
    
    this.validateRoleUpdateData(roleData);
    const role = await this.permissionService.updateRole(roleId, roleData as any);
    return role as any;
  }

  async deleteRole(roleId: string): Promise<void> {
    if (!roleId || roleId.trim() === '') {
      throw new Error('Role ID is required');
    }
    
    await this.permissionService.deleteRole(roleId);
  }

  async assignRoleToUser(userId: string, roleId: string, expiresAt?: Date): Promise<void> {
    if (!userId || userId.trim() === '') {
      throw new Error('AdminUser ID is required');
    }
    
    if (!roleId || roleId.trim() === '') {
      throw new Error('Role ID is required');
    }
    
    await this.permissionService.assignRoleToUser(userId, roleId, expiresAt?.toISOString());
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    if (!userId || userId.trim() === '') {
      throw new Error('AdminUser ID is required');
    }
    
    if (!roleId || roleId.trim() === '') {
      throw new Error('Role ID is required');
    }
    
    await this.permissionService.removeRoleFromUser(userId, roleId);
  }

  async getUserRoles(userId: string): Promise<AdminUserRoleAssignment[]> {
    if (!userId || userId.trim() === '') {
      throw new Error('AdminUser ID is required');
    }
    
    const assignments = await this.permissionService.getUserRoles(userId);
    return assignments as any;
  }

  async getPermissionTemplates(): Promise<PermissionTemplate[]> {
    const templates = await this.permissionService.getPermissionTemplates();
    return templates as any;
  }

  async createPermissionTemplate(templateData: CreatePermissionTemplateRequest): Promise<PermissionTemplate> {
    this.validatePermissionTemplateData(templateData);
    const template = await this.permissionService.createPermissionTemplate(templateData as any);
    return template as any;
  }

  // Private helper methods
  private validateRoleData(roleData: CreateRoleRequest): void {
    if (!roleData.name || roleData.name.trim().length < 2) {
      throw new Error('Role name must be at least 2 characters long');
    }
    
    if (!roleData.description || roleData.description.trim().length < 5) {
      throw new Error('Role description must be at least 5 characters long');
    }
    
    if (!roleData.permissions || Object.keys(roleData.permissions).length === 0) {
      throw new Error('Role must have at least one permission');
    }
  }

  private validateRoleUpdateData(roleData: UpdateRoleRequest): void {
    if (roleData.name && roleData.name.trim().length < 2) {
      throw new Error('Role name must be at least 2 characters long');
    }
    
    if (roleData.description && roleData.description.trim().length < 5) {
      throw new Error('Role description must be at least 5 characters long');
    }
  }

  private validatePermissionTemplateData(templateData: CreatePermissionTemplateRequest): void {
    if (!templateData.name || templateData.name.trim().length < 2) {
      throw new Error('Template name must be at least 2 characters long');
    }
    
    if (!templateData.description || templateData.description.trim().length < 5) {
      throw new Error('Template description must be at least 5 characters long');
    }
    
    if (!templateData.permissions || Object.keys(templateData.permissions).length === 0) {
      throw new Error('Template must have at least one permission');
    }
  }
}

/**
 * 인증 검증 Use Case 구현체
 */
export class AuthValidationUseCaseImpl implements AuthValidationUseCase {
  async validateLoginCredentials(email: string, password: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    if (!email || email.trim() === '') {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format');
    }
    
    if (!password || password.trim() === '') {
      errors.push('Password is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async validateRegistrationData(userData: RegisterRequest): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    if (!userData.email || userData.email.trim() === '') {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Invalid email format');
    }
    
    if (!userData.password || userData.password.trim() === '') {
      errors.push('Password is required');
    } else if (userData.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!userData.firstName || userData.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long');
    }
    
    if (!userData.lastName || userData.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async validatePasswordStrength(password: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async validateEmailFormat(email: string): Promise<boolean> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async canAccessResource(resource: Resource, permission: Permission): Promise<boolean> {
    // 실제 구현에서는 현재 사용자의 권한을 확인
    return true; // 임시 구현
  }
}
