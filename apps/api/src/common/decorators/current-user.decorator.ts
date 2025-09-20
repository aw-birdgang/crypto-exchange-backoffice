import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminUser } from '../../features/auth/domain/entities/admin-user.entity';

/**
 * 현재 인증된 사용자 정보를 가져오는 데코레이터
 * @param data - 선택적으로 특정 필드만 추출할 수 있음
 * @param ctx - 실행 컨텍스트
 * @returns AdminUser 객체 또는 특정 필드
 * 
 * @example
 * // 전체 사용자 정보
 * @Get('profile')
 * getProfile(@CurrentUser() user: AdminUser) {
 *   return user;
 * }
 * 
 * // 특정 필드만
 * @Get('profile')
 * getProfile(@CurrentUser('email') email: string) {
 *   return { email };
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AdminUser | undefined, ctx: ExecutionContext): AdminUser | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new Error('User not found in request. Make sure JwtAuthGuard is applied.');
    }

    return data ? user[data] : user;
  },
);
