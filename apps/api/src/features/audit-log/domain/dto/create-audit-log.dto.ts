import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsObject, IsUUID } from 'class-validator';
import { LogAction, LogCategory, LogSeverity, LogStatus } from '../entities/audit-log.entity';
import { AdminUserRole } from '@crypto-exchange/shared';

export class CreateAuditLogDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 'cmfkr31v7000wcm9urdbekf4u'
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'admin@crypto-exchange.com'
  })
  @IsString()
  userEmail: string;

  @ApiProperty({
    description: '사용자명',
    example: 'admin'
  })
  @IsString()
  userName: string;

  @ApiProperty({
    description: '사용자 역할',
    enum: AdminUserRole,
    example: AdminUserRole.ADMIN
  })
  @IsEnum(AdminUserRole)
  userRole: AdminUserRole;

  @ApiProperty({
    description: '수행된 액션',
    enum: LogAction,
    example: LogAction.LOGIN
  })
  @IsEnum(LogAction)
  action: LogAction;

  @ApiProperty({
    description: '리소스',
    example: 'auth'
  })
  @IsString()
  resource: string;

  @ApiProperty({
    description: '상세 정보',
    example: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0...' }
  })
  @IsObject()
  @IsOptional()
  details?: Record<string, any>;

  @ApiProperty({
    description: 'IP 주소',
    example: '192.168.1.1'
  })
  @IsString()
  ipAddress: string;

  @ApiProperty({
    description: '사용자 에이전트',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  })
  @IsString()
  userAgent: string;

  @ApiProperty({
    description: '세션 ID',
    example: 'sess_1234567890'
  })
  @IsString()
  sessionId: string;

  @ApiProperty({
    description: '요청 ID',
    example: 'req_1234567890'
  })
  @IsString()
  requestId: string;

  @ApiProperty({
    description: '상태',
    enum: LogStatus,
    example: LogStatus.SUCCESS
  })
  @IsEnum(LogStatus)
  status: LogStatus;

  @ApiProperty({
    description: '심각도',
    enum: LogSeverity,
    example: LogSeverity.MEDIUM
  })
  @IsEnum(LogSeverity)
  severity: LogSeverity;

  @ApiProperty({
    description: '카테고리',
    enum: LogCategory,
    example: LogCategory.AUTHENTICATION
  })
  @IsEnum(LogCategory)
  category: LogCategory;

  @ApiProperty({
    description: '서브카테고리',
    example: 'login_attempt'
  })
  @IsString()
  @IsOptional()
  subcategory?: string;

  @ApiProperty({
    description: '메타데이터',
    example: { browser: 'Chrome', os: 'Windows 10' }
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
