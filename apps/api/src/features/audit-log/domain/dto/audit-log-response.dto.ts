import { ApiProperty } from '@nestjs/swagger';
import { AuditLog } from '../entities/audit-log.entity';

export class AuditLogResponseDto {
  @ApiProperty({
    description: '로그 고유 ID',
    example: 'cmfkr31v7000wcm9urdbekf4u'
  })
  id: string;

  @ApiProperty({
    description: '사용자 ID',
    example: 'cmfkr31v7000wcm9urdbekf4u'
  })
  userId: string;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'admin@crypto-exchange.com'
  })
  userEmail: string;

  @ApiProperty({
    description: '사용자명',
    example: 'admin'
  })
  userName: string;

  @ApiProperty({
    description: '사용자 역할',
    example: 'ADMIN'
  })
  userRole: string;

  @ApiProperty({
    description: '수행된 액션',
    example: 'login'
  })
  action: string;

  @ApiProperty({
    description: '리소스',
    example: 'auth'
  })
  resource: string;

  @ApiProperty({
    description: '상세 정보',
    example: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0...' }
  })
  details: Record<string, any>;

  @ApiProperty({
    description: 'IP 주소',
    example: '192.168.1.1'
  })
  ipAddress: string;

  @ApiProperty({
    description: '사용자 에이전트',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  })
  userAgent: string;

  @ApiProperty({
    description: '세션 ID',
    example: 'sess_1234567890'
  })
  sessionId: string;

  @ApiProperty({
    description: '요청 ID',
    example: 'req_1234567890'
  })
  requestId: string;

  @ApiProperty({
    description: '상태',
    example: 'success'
  })
  status: string;

  @ApiProperty({
    description: '심각도',
    example: 'medium'
  })
  severity: string;

  @ApiProperty({
    description: '카테고리',
    example: 'authentication'
  })
  category: string;

  @ApiProperty({
    description: '서브카테고리',
    example: 'login_attempt'
  })
  subcategory: string;

  @ApiProperty({
    description: '메타데이터',
    example: { browser: 'Chrome', os: 'Windows 10' }
  })
  metadata: Record<string, any>;

  @ApiProperty({
    description: '생성일시',
    example: '2024-01-01T00:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: '로그 타임스탬프',
    example: '2024-01-01T00:00:00Z'
  })
  timestamp: Date;
}

export class PaginatedAuditLogsDto {
  @ApiProperty({
    description: '로그 목록',
    type: [AuditLogResponseDto]
  })
  data: AuditLogResponseDto[];

  @ApiProperty({
    description: '총 개수',
    example: 100
  })
  total: number;

  @ApiProperty({
    description: '페이지 번호',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: '페이지 크기',
    example: 20
  })
  limit: number;

  @ApiProperty({
    description: '총 페이지 수',
    example: 5
  })
  totalPages: number;

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: true
  })
  hasNext: boolean;

  @ApiProperty({
    description: '이전 페이지 존재 여부',
    example: false
  })
  hasPrev: boolean;
}

export class LogStatisticsDto {
  @ApiProperty({
    description: '총 로그 수',
    example: 1000
  })
  totalLogs: number;

  @ApiProperty({
    description: '성공 로그 수',
    example: 950
  })
  successLogs: number;

  @ApiProperty({
    description: '실패 로그 수',
    example: 50
  })
  failureLogs: number;

  @ApiProperty({
    description: '경고 로그 수',
    example: 0
  })
  warningLogs: number;

  @ApiProperty({
    description: '카테고리별 통계',
    example: {
      authentication: 500,
      user_management: 300,
      wallet_management: 200
    }
  })
  categoryStats: Record<string, number>;

  @ApiProperty({
    description: '심각도별 통계',
    example: {
      low: 800,
      medium: 150,
      high: 40,
      critical: 10
    }
  })
  severityStats: Record<string, number>;

  @ApiProperty({
    description: '사용자별 통계',
    example: {
      'admin@crypto-exchange.com': 500,
      'user@crypto-exchange.com': 300
    }
  })
  userStats: Record<string, number>;

  @ApiProperty({
    description: '시간대별 통계',
    example: {
      '00:00': 10,
      '01:00': 5,
      '02:00': 3
    }
  })
  hourlyStats: Record<string, number>;
}
