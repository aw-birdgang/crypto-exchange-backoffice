import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

/**
 * 공통 Swagger 응답 데코레이터들
 */
export const ApiCommonResponses = () =>
  applyDecorators(
    ApiBadRequestResponse({
      description: '잘못된 요청 데이터',
      example: {
        statusCode: 400,
        message: 'Validation failed',
        error: 'Bad Request'
      }
    }),
    ApiUnauthorizedResponse({
      description: '인증되지 않은 사용자',
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized'
      }
    }),
    ApiForbiddenResponse({
      description: '권한이 없는 사용자',
      example: {
        statusCode: 403,
        message: 'Forbidden',
        error: 'Forbidden'
      }
    }),
    ApiInternalServerErrorResponse({
      description: '서버 내부 오류',
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error'
      }
    })
  );

/**
 * 인증이 필요한 엔드포인트용 데코레이터
 */
export const ApiAuthEndpoint = (summary: string, description?: string) =>
  applyDecorators(
    ApiOperation({ summary, description }),
    ApiBearerAuth('JWT-auth'),
    ApiCommonResponses()
  );

/**
 * 공개 엔드포인트용 데코레이터
 */
export const ApiPublicEndpoint = (summary: string, description?: string) =>
  applyDecorators(
    ApiOperation({ summary, description }),
    ApiCommonResponses()
  );

/**
 * 성공 응답 데코레이터
 */
export const ApiSuccessResponse = (status: number, description: string, example?: any) =>
  ApiResponse({
    status,
    description,
    example
  });

/**
 * 사용자 관련 공통 응답
 */
export const ApiUserResponses = () =>
  applyDecorators(
    ApiCommonResponses(),
    ApiNotFoundResponse({
      description: '사용자를 찾을 수 없음',
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found'
      }
    })
  );

/**
 * 역할 관련 공통 응답
 */
export const ApiRoleResponses = () =>
  applyDecorators(
    ApiCommonResponses(),
    ApiNotFoundResponse({
      description: '역할을 찾을 수 없음',
      example: {
        statusCode: 404,
        message: 'Role not found',
        error: 'Not Found'
      }
    })
  );
