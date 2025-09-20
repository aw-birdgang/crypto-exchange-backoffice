import { SetMetadata } from '@nestjs/common';

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
