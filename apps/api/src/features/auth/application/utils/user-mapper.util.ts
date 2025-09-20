import { AdminUser } from '../../domain/entities/admin-user.entity';
import { UserResponseDto } from '../dto/permission.dto';

/**
 * AdminUser 엔티티를 UserResponseDto로 변환하는 유틸리티 함수
 */
export class UserMapper {
  /**
   * AdminUser를 UserResponseDto로 변환
   */
  static toUserResponseDto(adminUser: AdminUser): UserResponseDto {
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
   * AdminUser 배열을 UserResponseDto 배열로 변환
   */
  static toUserResponseDtoList(adminUsers: AdminUser[]): UserResponseDto[] {
    return adminUsers.map(user => this.toUserResponseDto(user));
  }
}
