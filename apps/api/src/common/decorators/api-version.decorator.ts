import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export const API_VERSION_KEY = 'apiVersion';

/**
 * API 버전을 지정하는 데코레이터
 * @param version - API 버전 (예: 'v1', 'v2')
 * 
 * @example
 * @ApiVersion('v1')
 * @Get('users')
 * getUsers() {
 *   return this.userService.findAll();
 * }
 */
export const ApiVersion = (version: string) => SetMetadata(API_VERSION_KEY, version);

/**
 * API 버전과 태그를 함께 지정하는 데코레이터
 * @param version - API 버전 (예: 'v1', 'v2')
 * @param tag - Swagger 태그
 * 
 * @example
 * @ApiVersionWithTag('v1', 'Authentication')
 * @Get('login')
 * login() {
 *   return this.authService.login();
 * }
 */
export const ApiVersionWithTag = (version: string, tag: string) => 
  applyDecorators(
    ApiVersion(version),
    ApiTags(`${tag} (${version})`)
  );
