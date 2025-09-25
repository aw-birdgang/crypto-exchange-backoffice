import { SetMetadata } from '@nestjs/common';
import { AdminUserRole } from '@crypto-exchange/shared';

export const Roles = (...roles: AdminUserRole[]) => SetMetadata('roles', roles);
