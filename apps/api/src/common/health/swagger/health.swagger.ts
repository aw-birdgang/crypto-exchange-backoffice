import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ApiPublicEndpoint } from '../../decorators/swagger.decorator';
import { SwaggerExamples } from '../../constants/swagger-examples.constants';

/**
 * Health Controller용 Swagger 헬퍼
 */
export class HealthSwagger {
  static basicCheck() {
    return applyDecorators(
      ApiPublicEndpoint(
        '기본 헬스체크',
        '서비스의 기본 상태를 확인합니다.'
      ),
      ApiResponse({
        status: 200,
        description: '서비스가 정상 작동 중',
        example: SwaggerExamples.HEALTH.BASIC
      })
    );
  }

  static detailedCheck() {
    return applyDecorators(
      ApiPublicEndpoint(
        '상세 헬스체크',
        '서비스의 상세 상태와 의존성을 확인합니다.'
      ),
      ApiResponse({
        status: 200,
        description: '상세 헬스체크 결과',
        example: SwaggerExamples.HEALTH.DETAILED
      })
    );
  }

  static readinessProbe() {
    return applyDecorators(
      ApiPublicEndpoint(
        'Kubernetes Readiness Probe',
        'Kubernetes에서 사용하는 readiness probe 엔드포인트'
      ),
      ApiResponse({
        status: 200,
        description: '서비스가 준비됨',
        example: { status: 'ok' }
      }),
      ApiResponse({
        status: 503,
        description: '서비스가 준비되지 않음',
        example: { status: 'error' }
      })
    );
  }

  static livenessProbe() {
    return applyDecorators(
      ApiPublicEndpoint(
        'Kubernetes Liveness Probe',
        'Kubernetes에서 사용하는 liveness probe 엔드포인트'
      ),
      ApiResponse({
        status: 200,
        description: '서비스가 살아있음',
        example: { status: 'ok' }
      }),
      ApiResponse({
        status: 503,
        description: '서비스가 살아있지 않음',
        example: { status: 'error' }
      })
    );
  }

  static legacyHealth() {
    return applyDecorators(
      ApiPublicEndpoint(
        '레거시 헬스체크',
        '기존 커스텀 헬스체크 서비스를 사용합니다.'
      ),
      ApiResponse({
        status: 200,
        description: '레거시 헬스체크 결과',
        example: SwaggerExamples.HEALTH.LEGACY
      })
    );
  }

  static legacyDetailedHealth() {
    return applyDecorators(
      ApiPublicEndpoint(
        '레거시 상세 헬스체크',
        '기존 커스텀 상세 헬스체크 서비스를 사용합니다.'
      ),
      ApiResponse({
        status: 200,
        description: '레거시 상세 헬스체크 결과',
        example: SwaggerExamples.HEALTH.LEGACY_DETAILED
      })
    );
  }
}
