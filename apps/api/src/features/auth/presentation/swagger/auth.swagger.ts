import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ApiAuthEndpoint, ApiPublicEndpoint, ApiSuccessResponse } from '../../../../common/decorators/swagger.decorator';
import { SwaggerExamples } from '../../../../common/constants/swagger-examples.constants';

/**
 * Auth Controller용 Swagger 헬퍼
 */
export class AuthSwagger {
  // 로그인 관련
  static login() {
    return applyDecorators(
      ApiPublicEndpoint(
        '사용자 로그인',
        '이메일과 비밀번호로 사용자를 인증하고 JWT 토큰을 발급합니다.'
      ),
      ApiSuccessResponse(200, '로그인 성공', SwaggerExamples.USER.AUTH_RESPONSE)
    );
  }

  static register() {
    return applyDecorators(
      ApiPublicEndpoint(
        '사용자 회원가입',
        '새로운 관리자 계정을 생성합니다.'
      ),
      ApiSuccessResponse(201, '회원가입 성공', {
        message: 'User registered successfully',
        userId: '123e4567-e89b-12d3-a456-426614174000'
      })
    );
  }

  static refresh() {
    return applyDecorators(
      ApiPublicEndpoint(
        '토큰 갱신',
        '리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급합니다.'
      ),
      ApiSuccessResponse(200, '토큰 갱신 성공', {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      })
    );
  }

  static logout() {
    return applyDecorators(
      ApiAuthEndpoint(
        '사용자 로그아웃',
        '사용자를 로그아웃하고 토큰을 무효화합니다.'
      ),
      ApiSuccessResponse(200, '로그아웃 성공', {
        message: 'Logged out successfully'
      })
    );
  }

  // 프로필 관련
  static getProfile() {
    return applyDecorators(
      ApiAuthEndpoint(
        '현재 사용자 프로필 조회',
        '현재 로그인한 사용자의 프로필 정보를 조회합니다.'
      ),
      ApiSuccessResponse(200, '프로필 조회 성공', SwaggerExamples.USER.PROFILE)
    );
  }

  static getMyRole() {
    return applyDecorators(
      ApiAuthEndpoint(
        '현재 사용자 역할 조회',
        '현재 로그인한 사용자의 역할 상세 정보를 조회합니다.'
      ),
      ApiSuccessResponse(200, '역할 조회 성공', SwaggerExamples.ROLE.DETAIL)
    );
  }

  static getMyRoleId() {
    return applyDecorators(
      ApiAuthEndpoint(
        '현재 사용자 역할 ID 조회',
        '현재 로그인한 사용자의 역할 ID를 조회합니다.'
      ),
      ApiSuccessResponse(200, '역할 ID 조회 성공', SwaggerExamples.USER.ROLE_INFO)
    );
  }

  // 테스트 관련
  static testAuth() {
    return applyDecorators(
      ApiPublicEndpoint(
        '인증 테스트 (공개)',
        '인증 없이 호출할 수 있는 테스트 엔드포인트입니다. 헤더 정보를 확인할 수 있습니다.'
      ),
      ApiSuccessResponse(200, '테스트 성공', {
        message: 'Test endpoint working',
        requestId: 'req-123456789',
        headers: {
          authorization: 'Bearer token...',
          'user-agent': 'Mozilla/5.0...',
          'content-type': 'application/json',
          'referer': 'http://localhost:3000',
          allHeaders: ['authorization', 'user-agent', 'content-type']
        },
        timestamp: '2024-01-01T00:00:00.000Z'
      })
    );
  }

  static testPipes() {
    return applyDecorators(
      ApiPublicEndpoint(
        '파이프 테스트 엔드포인트',
        '커스텀 파이프들의 동작을 테스트할 수 있는 엔드포인트입니다.'
      ),
      ApiParam({
        name: 'id',
        description: '정수 ID',
        example: 123
      }),
      ApiQuery({
        name: 'uuid',
        description: 'UUID 문자열',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }),
      ApiQuery({
        name: 'boolean',
        description: '불린 값',
        example: true
      }),
      ApiQuery({
        name: 'text',
        description: '텍스트 (공백 제거됨)',
        example: 'Hello World'
      }),
      ApiSuccessResponse(200, '파이프 테스트 성공', {
        message: 'Pipes test successful',
        parsedId: 123,
        parsedUuid: '123e4567-e89b-12d3-a456-426614174000',
        parsedBoolean: true,
        trimmedText: 'Hello World',
        requestId: 'req-123',
        timestamp: '2024-01-01T00:00:00.000Z'
      })
    );
  }
}
