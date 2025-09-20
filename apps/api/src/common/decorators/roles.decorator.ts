import { SetMetadata } from '@nestjs/common';
import { AdminUserRole } from '@crypto-exchange/shared';

export const ROLES_KEY = 'roles';

/**
 * 역할 기반 접근 제어를 위한 데코레이터
 * @param roles - 허용된 역할 목록
 * 
 * @example
 * @Roles(AdminUserRole.ADMIN, AdminUserRole.SUPER_ADMIN)
 * @Get('admin-only')
 * adminOnlyEndpoint() {
 *   return 'This is admin only';
 * }
 */
export const Roles = (...roles: AdminUserRole[]) => SetMetadata(ROLES_KEY, roles);
