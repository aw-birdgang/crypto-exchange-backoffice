import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { API_VERSION_KEY } from '../decorators/api-version.decorator';

@Injectable()
export class ApiVersionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredVersion = this.reflector.getAllAndOverride<string>(API_VERSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredVersion) {
      return true; // 버전 요구사항이 없으면 통과
    }

    const request = context.switchToHttp().getRequest();
    const requestVersion = request.apiVersion;

    if (!requestVersion) {
      throw new BadRequestException('API version is required');
    }

    // 버전 형식 검증 (v1, v2, v3 등)
    const versionPattern = /^v\d+$/;
    if (!versionPattern.test(requestVersion)) {
      throw new BadRequestException(`Invalid API version format: ${requestVersion}`);
    }

    // 버전 호환성 검증
    if (!this.isVersionCompatible(requestVersion, requiredVersion)) {
      throw new BadRequestException(
        `API version ${requestVersion} is not compatible with required version ${requiredVersion}`
      );
    }

    return true;
  }

  private isVersionCompatible(requestVersion: string, requiredVersion: string): boolean {
    // 현재는 정확한 버전 매칭만 지원
    // 향후 하위 호환성 로직을 추가할 수 있음
    return requestVersion === requiredVersion;
  }
}
