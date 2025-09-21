import { AdminUser } from '../../entities/admin-user.entity';
import { AdminUserResponseDto } from '../../../application/dto/permission.dto';
import { AdminUserRole } from '@crypto-exchange/shared';
import { 
  IUserMapper, 
  UserContext, 
  DetailedUserDto, 
  PermissionDto 
} from '../interfaces/user.mapper.interface';

/**
 * 사용자 관련 매핑 구현체
 */
export class UserMapper implements IUserMapper {
  /**
   * AdminUser를 AdminUserResponseDto로 변환
   */
  toUserResponseDto(adminUser: AdminUser): AdminUserResponseDto {
    return {
      id: adminUser.id,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: adminUser.adminRole, // adminRole을 role로 매핑
      isActive: adminUser.isActive,
      lastLoginAt: adminUser.lastLoginAt?.toISOString() || '',
      createdAt: adminUser.createdAt.toISOString(),
      updatedAt: adminUser.updatedAt.toISOString()
    };
  }

  /**
   * AdminUser 배열을 AdminUserResponseDto 배열로 변환
   */
  toUserResponseDtoList(adminUsers: AdminUser[]): AdminUserResponseDto[] {
    return adminUsers.map(user => this.toUserResponseDto(user));
  }

  /**
   * 상세 사용자 정보로 변환 (권한 정보 포함)
   */
  toDetailedUserDto(adminUser: AdminUser, context?: UserContext): DetailedUserDto {
    const baseDto = this.toUserResponseDto(adminUser);
    
    return {
      ...baseDto,
      permissions: context?.permissions ? this.mapPermissions(context.permissions) : [],
      roleHierarchy: this.calculateRoleHierarchy(adminUser.adminRole),
      accessLevel: this.determineAccessLevel(adminUser, context),
      riskScore: this.calculateRiskScore(adminUser, context),
      lastLoginIp: context?.lastLoginIp
    };
  }

  /**
   * 권한 정보 매핑
   */
  private mapPermissions(permissions: any[]): PermissionDto[] {
    return permissions.map(p => ({
      resource: p.resource || p.resourceName,
      actions: p.permissions || p.actions || [],
      grantedAt: p.createdAt?.toISOString() || new Date().toISOString()
    }));
  }

  /**
   * 역할 계층 계산
   */
  private calculateRoleHierarchy(role: AdminUserRole): number {
    const hierarchy: Record<AdminUserRole, number> = {
      [AdminUserRole.SUPER_ADMIN]: 5,
      [AdminUserRole.ADMIN]: 4,
      [AdminUserRole.MODERATOR]: 3,
      [AdminUserRole.SUPPORT]: 2,
      [AdminUserRole.AUDITOR]: 1
    };
    return hierarchy[role] || 0;
  }

  /**
   * 접근 레벨 결정
   */
  private determineAccessLevel(adminUser: AdminUser, context?: UserContext): 'SYSTEM' | 'ADMIN' | 'USER' {
    if (adminUser.adminRole === AdminUserRole.SUPER_ADMIN) {
      return 'SYSTEM';
    }
    
    if (context?.permissions?.some(p => p.resource === 'SYSTEM' || p.resource === 'ADMIN')) {
      return 'ADMIN';
    }
    
    return 'USER';
  }

  /**
   * 위험도 점수 계산
   */
  private calculateRiskScore(adminUser: AdminUser, context?: UserContext): number {
    let score = 0;
    
    // 역할 기반 점수
    const roleScore = this.calculateRoleHierarchy(adminUser.adminRole) * 10;
    score += roleScore;
    
    // 권한 수 기반 점수
    if (context?.permissions && context.permissions.length > 10) {
      score += 20;
    }
    
    // 최근 로그인 기반 점수
    if (adminUser.lastLoginAt && this.isRecentLogin(adminUser.lastLoginAt)) {
      score += 10;
    }
    
    // IP 변경 기반 점수
    if (context?.lastLoginIp && context.sessionInfo?.ipAddress !== context.lastLoginIp) {
      score += 15;
    }
    
    return Math.min(score, 100);
  }

  /**
   * 최근 로그인 여부 확인 (24시간 이내)
   */
  private isRecentLogin(lastLoginAt: Date): boolean {
    const now = new Date();
    const diffInHours = (now.getTime() - lastLoginAt.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 24;
  }
}
