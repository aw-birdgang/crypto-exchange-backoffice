import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { RoleMappingUtil } from '../../features/auth/application/utils/role-mapping.util';

/**
 * 역할 검증 파이프
 */
@Injectable()
export class RoleValidationPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value) {
      throw new BadRequestException('Role is required');
    }

    // AdminUserRole 검증
    if (RoleMappingUtil.isValidAdminRole(value)) {
      return value;
    }

    // 역할 이름 검증
    if (RoleMappingUtil.isValidRoleName(value)) {
      return value;
    }

    throw new BadRequestException(
      `Invalid role: "${value}". Valid roles are: ${Object.values(RoleMappingUtil.mapAdminRoleToRoleName).join(', ')}`
    );
  }
}
