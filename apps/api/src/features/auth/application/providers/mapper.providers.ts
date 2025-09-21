import { Provider } from '@nestjs/common';
import { 
  IUserMapper, 
  IAuthMapper, 
  IPermissionMapper, 
  IAdminMapper, 
  IRoleMapper 
} from '../../domain/mappers/interfaces';
import { 
  UserMapper, 
  AuthMapper, 
  PermissionMapper, 
  AdminMapper, 
  RoleMapper 
} from '../../domain/mappers/implementations';

// Export interfaces for external use
export type { 
  IUserMapper, 
  IAuthMapper, 
  IPermissionMapper, 
  IAdminMapper, 
  IRoleMapper 
} from '../../domain/mappers/interfaces';

/**
 * Mapper 관련 Provider 설정
 */
export const mapperProviders: Provider[] = [
  {
    provide: 'IUserMapper',
    useClass: UserMapper,
  },
  {
    provide: 'IAuthMapper',
    useClass: AuthMapper,
  },
  {
    provide: 'IPermissionMapper',
    useClass: PermissionMapper,
  },
  {
    provide: 'IAdminMapper',
    useClass: AdminMapper,
  },
  {
    provide: 'IRoleMapper',
    useClass: RoleMapper,
  },
];

/**
 * Mapper 토큰 상수
 */
export const MAPPER_TOKENS = {
  USER_MAPPER: 'IUserMapper',
  AUTH_MAPPER: 'IAuthMapper',
  PERMISSION_MAPPER: 'IPermissionMapper',
  ADMIN_MAPPER: 'IAdminMapper',
  ROLE_MAPPER: 'IRoleMapper',
} as const;
