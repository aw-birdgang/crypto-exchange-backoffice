import { ApiProperty } from '@nestjs/swagger';

/**
 * 표준 API 응답 DTO
 */
export class ApiResponseDto<T = any> {
  @ApiProperty({
    description: '응답 성공 여부',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Success'
  })
  message: string;

  @ApiProperty({
    description: '응답 데이터',
    example: {}
  })
  data?: T;

  @ApiProperty({
    description: '에러 코드',
    example: null,
    required: false
  })
  errorCode?: string;

  @ApiProperty({
    description: '타임스탬프',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: '요청 ID',
    example: 'req-123456789',
    required: false
  })
  requestId?: string;
}

/**
 * 페이지네이션 응답 DTO
 */
export class PaginatedResponseDto<T = any> extends ApiResponseDto<T[]> {
  @ApiProperty({
    description: '페이지 정보',
    example: {
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5
    }
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 에러 응답 DTO
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: '응답 성공 여부',
    example: false
  })
  success: boolean;

  @ApiProperty({
    description: '에러 메시지',
    example: 'Validation failed'
  })
  message: string;

  @ApiProperty({
    description: '에러 코드',
    example: 'VALIDATION_ERROR'
  })
  errorCode: string;

  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 400
  })
  statusCode: number;

  @ApiProperty({
    description: '타임스탬프',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: '요청 ID',
    example: 'req-123456789',
    required: false
  })
  requestId?: string;

  @ApiProperty({
    description: '상세 에러 정보',
    example: ['email must be an email'],
    required: false
  })
  details?: string[];
}
