import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AdminUserRole } from '@crypto-exchange/shared';

export enum LogSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum LogStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  WARNING = 'warning'
}

export enum LogCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  USER_MANAGEMENT = 'user_management',
  WALLET_MANAGEMENT = 'wallet_management',
  CUSTOMER_SUPPORT = 'customer_support',
  SYSTEM_ADMINISTRATION = 'system_administration',
  SECURITY = 'security',
  DATA_ACCESS = 'data_access'
}

export enum LogAction {
  // Authentication & Authorization
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  TOKEN_REFRESH = 'token_refresh',
  PERMISSION_DENIED = 'permission_denied',
  ROLE_CHANGE = 'role_change',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',

  // User Management
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_APPROVED = 'user_approved',
  USER_REJECTED = 'user_rejected',
  USER_SUSPENDED = 'user_suspended',
  USER_ACTIVATED = 'user_activated',
  BULK_ACTION = 'bulk_action',

  // Wallet Management
  TRANSACTION_VIEWED = 'transaction_viewed',
  TRANSACTION_FILTERED = 'transaction_filtered',
  WALLET_BALANCE_VIEWED = 'wallet_balance_viewed',
  TRANSACTION_EXPORTED = 'transaction_exported',
  WALLET_ANALYSIS = 'wallet_analysis',

  // Customer Support
  TICKET_CREATED = 'ticket_created',
  TICKET_UPDATED = 'ticket_updated',
  TICKET_RESOLVED = 'ticket_resolved',
  TICKET_CLOSED = 'ticket_closed',
  CUSTOMER_CONTACTED = 'customer_contacted',

  // System Administration
  CONFIGURATION_CHANGED = 'configuration_changed',
  SYSTEM_BACKUP = 'system_backup',
  SYSTEM_RESTORE = 'system_restore',
  DATABASE_MAINTENANCE = 'database_maintenance',
  SECURITY_SCAN = 'security_scan',

  // Data Access
  DATA_VIEWED = 'data_viewed',
  DATA_EXPORTED = 'data_exported',
  DATA_MODIFIED = 'data_modified',
  DATA_DELETED = 'data_deleted'
}

@Entity('audit_logs')
export class AuditLog {
  @ApiProperty({
    description: '로그 고유 ID',
    example: 'cmfkr31v7000wcm9urdbekf4u'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: '사용자 ID',
    example: 'cmfkr31v7000wcm9urdbekf4u'
  })
  @Column()
  @Index()
  userId: string;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'admin@crypto-exchange.com'
  })
  @Column()
  @Index()
  userEmail: string;

  @ApiProperty({
    description: '사용자명',
    example: 'admin'
  })
  @Column()
  userName: string;

  @ApiProperty({
    description: '사용자 역할',
    enum: AdminUserRole,
    example: AdminUserRole.ADMIN
  })
  @Column({ type: 'enum', enum: AdminUserRole })
  @Index()
  userRole: AdminUserRole;

  @ApiProperty({
    description: '수행된 액션',
    enum: LogAction,
    example: LogAction.LOGIN
  })
  @Column({ type: 'enum', enum: LogAction })
  @Index()
  action: LogAction;

  @ApiProperty({
    description: '리소스',
    example: 'auth'
  })
  @Column()
  @Index()
  resource: string;

  @ApiProperty({
    description: '상세 정보 (JSON)',
    example: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0...' }
  })
  @Column('json')
  details: Record<string, any>;

  @ApiProperty({
    description: 'IP 주소',
    example: '192.168.1.1'
  })
  @Column()
  @Index()
  ipAddress: string;

  @ApiProperty({
    description: '사용자 에이전트',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  })
  @Column({ type: 'text' })
  userAgent: string;

  @ApiProperty({
    description: '세션 ID',
    example: 'sess_1234567890'
  })
  @Column()
  @Index()
  sessionId: string;

  @ApiProperty({
    description: '요청 ID',
    example: 'req_1234567890'
  })
  @Column()
  @Index()
  requestId: string;

  @ApiProperty({
    description: '상태',
    enum: LogStatus,
    example: LogStatus.SUCCESS
  })
  @Column({ type: 'enum', enum: LogStatus })
  @Index()
  status: LogStatus;

  @ApiProperty({
    description: '심각도',
    enum: LogSeverity,
    example: LogSeverity.MEDIUM
  })
  @Column({ type: 'enum', enum: LogSeverity })
  @Index()
  severity: LogSeverity;

  @ApiProperty({
    description: '카테고리',
    enum: LogCategory,
    example: LogCategory.AUTHENTICATION
  })
  @Column({ type: 'enum', enum: LogCategory })
  @Index()
  category: LogCategory;

  @ApiProperty({
    description: '서브카테고리',
    example: 'login_attempt'
  })
  @Column()
  subcategory: string;

  @ApiProperty({
    description: '메타데이터 (JSON)',
    example: { browser: 'Chrome', os: 'Windows 10' }
  })
  @Column('json')
  metadata: Record<string, any>;

  @ApiProperty({
    description: '생성일시'
  })
  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @ApiProperty({
    description: '로그 타임스탬프'
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  timestamp: Date;
}
