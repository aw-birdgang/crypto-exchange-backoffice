import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminUser } from '../../domain/entities/admin-user.entity';
import { AdminUserRepositoryInterface } from '../../domain/repositories/admin-user.repository.interface';
import { PermissionService } from './permission.service';
import { 
  CreateAdminDto, 
  UpdateAdminDto, 
  AdminStatsDto, 
  AdminDashboardDto,
  AdminBulkActionDto 
} from '../dto/admin.dto';
import { AdminUserResponseDto } from '../dto/permission.dto';
import { AdminUserRole, Resource, Permission } from '@crypto-exchange/shared';
import { IAdminMapper, IUserMapper, MAPPER_TOKENS } from '../providers/mapper.providers';

@Injectable()
export class AdminService {
  constructor(
    @Inject('AdminUserRepositoryInterface')
    private readonly adminUserRepository: AdminUserRepositoryInterface,
    private readonly permissionService: PermissionService,
    @Inject(MAPPER_TOKENS.ADMIN_MAPPER)
    private readonly adminMapper: IAdminMapper,
    @Inject(MAPPER_TOKENS.USER_MAPPER)
    private readonly userMapper: IUserMapper,
  ) {}

  /**
   * 관리자 생성
   */
  async createAdmin(adminData: CreateAdminDto): Promise<AdminUser> {
    // 이메일 중복 확인
    const existingAdmin = await this.adminUserRepository.findByEmail(adminData.email);
    if (existingAdmin) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const adminWithHashedPassword = { 
      ...adminData, 
      password: hashedPassword,
      username: adminData.email.split('@')[0], // 이메일에서 사용자명 생성
      adminRole: adminData.role === AdminUserRole.SUPER_ADMIN ? AdminUserRole.SUPER_ADMIN : AdminUserRole.ADMIN,
      permissions: (this.adminMapper as any).getDefaultPermissions(adminData.role)
    };
    
    return this.adminUserRepository.create(adminWithHashedPassword);
  }

  /**
   * 관리자 정보 수정
   */
  async updateAdmin(id: string, adminData: UpdateAdminDto): Promise<AdminUserResponseDto> {
    const admin = await this.adminUserRepository.findById(id);
    if (!admin) {
      throw new NotFoundException('관리자를 찾을 수 없습니다.');
    }

    // 비밀번호가 제공된 경우 해싱
    if (adminData.password) {
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      adminData.password = hashedPassword;
    }

    const updatedAdmin = await this.adminUserRepository.update(id, adminData);
    return this.userMapper.toUserResponseDto(updatedAdmin);
  }

  /**
   * 관리자 삭제
   */
  async deleteAdmin(id: string): Promise<void> {
    await this.adminUserRepository.delete(id);
  }

  /**
   * 모든 관리자 조회
   */
  async getAllAdmins(): Promise<AdminUser[]> {
    return this.adminUserRepository.findAll();
  }

  /**
   * 관리자 통계 조회
   */
  async getAdminStats(): Promise<AdminStatsDto> {
    const allAdmins = await this.adminUserRepository.findAll();
    
    const adminCount = allAdmins.length;
    const activeAdmins = allAdmins.filter(admin => admin.isActive).length;
    
    // 날짜별 통계 계산
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayRegistrations = allAdmins.filter(admin => 
      new Date(admin.createdAt) >= today
    ).length;

    const weeklyRegistrations = allAdmins.filter(admin => 
      new Date(admin.createdAt) >= weekAgo
    ).length;

    const monthlyRegistrations = allAdmins.filter(admin => 
      new Date(admin.createdAt) >= monthAgo
    ).length;

    // 관리자 역할별 통계
    const roleStats: Record<string, number> = {};
    Object.values(AdminUserRole).forEach(role => {
      roleStats[role] = allAdmins.filter(admin => admin.adminRole === role).length;
    });

    return {
      totalUsers: 0,
      activeUsers: 0,
      adminCount,
      todayRegistrations,
      weeklyRegistrations,
      monthlyRegistrations,
      roleStats
    };
  }

  /**
   * 관리자 대시보드 데이터 조회
   */
  async getAdminDashboard(): Promise<AdminDashboardDto> {
    const stats = await this.getAdminStats();
    
    // 최근 활동 로그 (실제 구현에서는 별도의 로그 시스템 사용)
    const recentActivities = [
      {
        id: '1',
        action: 'USER_CREATED',
        user: 'admin@crypto-exchange.com',
        timestamp: new Date().toISOString(),
        details: 'Created new user'
      },
      {
        id: '2',
        action: 'PERMISSION_UPDATED',
        user: 'admin@crypto-exchange.com',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        details: 'Updated user permissions'
      }
    ];

    // 시스템 상태 확인 (실제 구현에서는 헬스체크 API 사용)
    const systemStatus = {
      database: 'healthy',
      redis: 'healthy',
      api: 'healthy'
    };

    return {
      stats,
      recentActivities,
      systemStatus
    };
  }

  /**
   * 관리자 권한 확인
   */
  async checkAdminPermission(adminId: string, resource: Resource, permission: Permission): Promise<boolean> {
    return this.permissionService.hasPermission(adminId, resource, permission);
  }

  /**
   * 대량 관리자 작업
   */
  async bulkAdminAction(actionData: AdminBulkActionDto): Promise<{ success: number; failed: number; errors: string[] }> {
    const { userIds, action, newRole } = actionData;
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const adminId of userIds) {
      try {
        const admin = await this.adminUserRepository.findById(adminId);
        if (!admin) {
          errors.push(`관리자 ID ${adminId}를 찾을 수 없습니다.`);
          failed++;
          continue;
        }

        switch (action) {
          case 'activate':
            await this.adminUserRepository.update(adminId, { isActive: true });
            break;
          case 'deactivate':
            await this.adminUserRepository.update(adminId, { isActive: false });
            break;
          case 'delete':
            await this.adminUserRepository.delete(adminId);
            break;
          case 'change_role':
            if (!newRole) {
              errors.push(`역할 변경 작업에는 newRole이 필요합니다.`);
              failed++;
              continue;
            }
            await this.adminUserRepository.update(adminId, { adminRole: newRole as AdminUserRole });
            break;
        }
        success++;
      } catch (error) {
        errors.push(`관리자 ID ${adminId} 처리 중 오류: ${(error as Error).message}`);
        failed++;
      }
    }

    return { success, failed, errors };
  }

  /**
   * 관리자 역할 확인
   */
  private isAdminRole(role: AdminUserRole): boolean {
    return role === AdminUserRole.SUPER_ADMIN || role === AdminUserRole.ADMIN;
  }

  /**
   * 대기 중인 사용자 목록 조회
   */
  async getPendingUsers(): Promise<AdminUser[]> {
    return this.adminUserRepository.findByStatus('PENDING');
  }

  /**
   * 사용자 승인
   */
  async approveUser(
    userId: string, 
    approvalData: { role: AdminUserRole; isActive: boolean }, 
    approvedBy: string
  ): Promise<AdminUser> {
    const user = await this.adminUserRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (user.status !== 'PENDING') {
      throw new BadRequestException('이미 처리된 사용자입니다.');
    }

    const updateData = {
      status: 'APPROVED' as const,
      adminRole: approvalData.role,
      isActive: approvalData.isActive,
      approvedBy,
      approvedAt: new Date(),
      permissions: (this.adminMapper as any).getDefaultPermissions(approvalData.role)
    };

    return this.adminUserRepository.update(userId, updateData);
  }

  /**
   * 사용자 거부
   */
  async rejectUser(userId: string, rejectedBy: string): Promise<AdminUser> {
    const user = await this.adminUserRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (user.status !== 'PENDING') {
      throw new BadRequestException('이미 처리된 사용자입니다.');
    }

    const updateData = {
      status: 'REJECTED' as const,
      approvedBy: rejectedBy,
      approvedAt: new Date()
    };

    return this.adminUserRepository.update(userId, updateData);
  }

  /**
   * 사용자 상태별 조회
   */
  async getUsersByStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'): Promise<AdminUser[]> {
    return this.adminUserRepository.findByStatus(status);
  }


}
