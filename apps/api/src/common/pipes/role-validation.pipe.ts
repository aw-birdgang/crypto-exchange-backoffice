import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { RoleMapper } from '../../features/auth/domain/mappers/implementations/role.mapper';

/**
 * 역할 검증 파이프
 */
@Injectable()
export class RoleValidationPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value) {
      throw new BadRequestException('Role is required');
    }

    const roleMapper = new RoleMapper();
    
    // AdminUserRole 검증
    if (roleMapper.isValidAdminRole(value)) {
      return value;
    }

    // 역할 이름 검증
    if (roleMapper.isValidRoleName(value)) {
      return value;
    }

    throw new BadRequestException(
      `Invalid role: "${value}". Valid roles are: super_admin, admin, moderator, support, auditor`
    );
  }
}
