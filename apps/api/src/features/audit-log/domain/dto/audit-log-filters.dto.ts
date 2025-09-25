import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsDateString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { LogAction, LogCategory, LogSeverity, LogStatus } from '../entities/audit-log.entity';
import { AdminUserRole } from '@crypto-exchange/shared';

export class AuditLogFiltersDto {
  @ApiProperty({
    description: '사용자 ID로 필터링',
    example: 'cmfkr31v7000wcm9urdbekf4u',
    required: false
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: '사용자 이메일로 필터링',
    example: 'admin@crypto-exchange.com',
    required: false
  })
  @IsOptional()
  @IsString()
  userEmail?: string;

  @ApiProperty({
    description: '사용자 역할로 필터링',
    enum: AdminUserRole,
    example: AdminUserRole.ADMIN,
    required: false
  })
  @IsOptional()
  @IsEnum(AdminUserRole)
  userRole?: AdminUserRole;

  @ApiProperty({
    description: '액션으로 필터링',
    enum: LogAction,
    example: LogAction.LOGIN,
    required: false
  })
  @IsOptional()
  @IsEnum(LogAction)
  action?: LogAction;

  @ApiProperty({
    description: '리소스로 필터링',
    example: 'auth',
    required: false
  })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiProperty({
    description: '상태로 필터링',
    enum: LogStatus,
    example: LogStatus.SUCCESS,
    required: false
  })
  @IsOptional()
  @IsEnum(LogStatus)
  status?: LogStatus;

  @ApiProperty({
    description: '심각도로 필터링',
    enum: LogSeverity,
    example: LogSeverity.MEDIUM,
    required: false
  })
  @IsOptional()
  @IsEnum(LogSeverity)
  severity?: LogSeverity;

  @ApiProperty({
    description: '카테고리로 필터링',
    enum: LogCategory,
    example: LogCategory.AUTHENTICATION,
    required: false
  })
  @IsOptional()
  @IsEnum(LogCategory)
  category?: LogCategory;

  @ApiProperty({
    description: '서브카테고리로 필터링',
    example: 'login_attempt',
    required: false
  })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiProperty({
    description: 'IP 주소로 필터링',
    example: '192.168.1.1',
    required: false
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    description: '시작 날짜',
    example: '2024-01-01T00:00:00Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: '종료 날짜',
    example: '2024-12-31T23:59:59Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: '검색 키워드 (사용자명, 이메일, 액션 등)',
    example: 'admin',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    required: false,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: '페이지 크기',
    example: 20,
    required: false,
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiProperty({
    description: '정렬 필드',
    example: 'createdAt',
    required: false,
    default: 'createdAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: '정렬 방향',
    example: 'DESC',
    required: false,
    default: 'DESC'
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
