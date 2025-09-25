# 🔍 Audit Log System - 사용자 활동 로그 시스템

## 📋 목차
- [시스템 개요](#시스템-개요)
- [아키텍처 설계](#아키텍처-설계)
- [로그 타입 및 분류](#로그-타입-및-분류)
- [데이터베이스 스키마](#데이터베이스-스키마)
- [API 구현](#api-구현)
- [프론트엔드 구현](#프론트엔드-구현)
- [보안 고려사항](#보안-고려사항)
- [모니터링 및 알림](#모니터링-및-알림)

## 🎯 시스템 개요

### 목적
암호화폐 거래소 백오피스에서 어드민 사용자의 모든 활동을 추적하고 기록하여:
- **보안 감사**: 의심스러운 활동 탐지 및 분석
- **컴플라이언스**: 규제 요구사항 충족
- **운영 투명성**: 사용자 활동의 투명한 추적
- **문제 해결**: 이슈 발생 시 원인 분석 및 복구

### 주요 기능
- **실시간 로깅**: 모든 사용자 활동 실시간 기록
- **다층 로깅**: API, 프론트엔드, 데이터베이스 레벨 로깅
- **검색 및 필터링**: 다양한 조건으로 로그 검색
- **보고서 생성**: 활동 통계 및 분석 보고서
- **알림 시스템**: 중요 활동에 대한 실시간 알림

## 🏗️ 아키텍처 설계

### 전체 아키텍처
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Logging   │ │   Tracking  │ │   Analytics  │          │
│  │   Service   │ │   Service    │ │   Service   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (NestJS)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Audit     │ │   Log       │ │   Analytics  │          │
│  │   Service   │ │   Service   │ │   Service    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Audit     │ │   Log       │ │   Analytics  │          │
│  │   Logs      │ │   Archive   │ │   Reports    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 로깅 계층
1. **Frontend Logging**: 사용자 인터랙션, 페이지 방문, 버튼 클릭
2. **API Logging**: API 요청/응답, 인증, 권한 검증
3. **Database Logging**: 데이터 변경, 트랜잭션 추적
4. **System Logging**: 시스템 이벤트, 에러, 성능 메트릭

## 📊 로그 타입 및 분류

### 1. 인증 및 권한 로그 (Authentication & Authorization)
```typescript
enum AuthLogType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  TOKEN_REFRESH = 'token_refresh',
  PERMISSION_DENIED = 'permission_denied',
  ROLE_CHANGE = 'role_change',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked'
}
```

### 2. 사용자 관리 로그 (User Management)
```typescript
enum UserManagementLogType {
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_APPROVED = 'user_approved',
  USER_REJECTED = 'user_rejected',
  USER_SUSPENDED = 'user_suspended',
  USER_ACTIVATED = 'user_activated',
  BULK_ACTION = 'bulk_action'
}
```

### 3. 지갑 관리 로그 (Wallet Management)
```typescript
enum WalletLogType {
  TRANSACTION_VIEWED = 'transaction_viewed',
  TRANSACTION_FILTERED = 'transaction_filtered',
  WALLET_BALANCE_VIEWED = 'wallet_balance_viewed',
  TRANSACTION_EXPORTED = 'transaction_exported',
  WALLET_ANALYSIS = 'wallet_analysis'
}
```

### 4. 고객 지원 로그 (Customer Support)
```typescript
enum CustomerSupportLogType {
  TICKET_CREATED = 'ticket_created',
  TICKET_UPDATED = 'ticket_updated',
  TICKET_RESOLVED = 'ticket_resolved',
  TICKET_CLOSED = 'ticket_closed',
  CUSTOMER_CONTACTED = 'customer_contacted'
}
```

### 5. 시스템 관리 로그 (System Administration)
```typescript
enum SystemLogType {
  CONFIGURATION_CHANGED = 'configuration_changed',
  SYSTEM_BACKUP = 'system_backup',
  SYSTEM_RESTORE = 'system_restore',
  DATABASE_MAINTENANCE = 'database_maintenance',
  SECURITY_SCAN = 'security_scan'
}
```

## 🗄️ 데이터베이스 스키마

### AuditLog 엔티티
```typescript
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  userEmail: string;

  @Column()
  userName: string;

  @Column()
  userRole: string;

  @Column()
  action: string;

  @Column()
  resource: string;

  @Column('json')
  details: Record<string, any>;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @Column()
  sessionId: string;

  @Column()
  requestId: string;

  @Column()
  status: 'success' | 'failure' | 'warning';

  @Column()
  severity: 'low' | 'medium' | 'high' | 'critical';

  @Column()
  category: string;

  @Column()
  subcategory: string;

  @Column('json')
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @Index()
  @Column()
  timestamp: Date;
}
```

### LogCategory 엔티티
```typescript
@Entity('log_categories')
export class LogCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  severity: string;

  @Column()
  retentionDays: number;

  @Column()
  isActive: boolean;
}
```

## 🔧 API 구현

### AuditLogService
```typescript
@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private logger: LoggerService
  ) {}

  async logActivity(logData: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(logData);
    return await this.auditLogRepository.save(auditLog);
  }

  async getLogs(filters: AuditLogFiltersDto): Promise<PaginatedAuditLogs> {
    // 로그 조회 로직
  }

  async getLogStatistics(period: string): Promise<LogStatistics> {
    // 통계 조회 로직
  }
}
```

### AuditLogController
```typescript
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.ADMIN)
export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  @Get()
  async getLogs(@Query() filters: AuditLogFiltersDto) {
    return await this.auditLogService.getLogs(filters);
  }

  @Get('statistics')
  async getStatistics(@Query('period') period: string) {
    return await this.auditLogService.getLogStatistics(period);
  }
}
```

## 🎨 프론트엔드 구현

### AuditLogStore (Zustand)
```typescript
interface AuditLogStore {
  logs: AuditLog[];
  filters: AuditLogFilters;
  statistics: LogStatistics;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchLogs: (filters: AuditLogFilters) => Promise<void>;
  fetchStatistics: (period: string) => Promise<void>;
  clearFilters: () => void;
  exportLogs: (format: 'csv' | 'excel') => Promise<void>;
}
```

### AuditLogPage 컴포넌트
```typescript
export const AuditLogPage: React.FC = () => {
  const { logs, filters, statistics, loading } = useAuditLogStore();
  
  return (
    <div>
      <AuditLogFilters />
      <AuditLogTable />
      <AuditLogStatistics />
    </div>
  );
};
```

## 🔒 보안 고려사항

### 1. 데이터 보호
- **민감 정보 마스킹**: 비밀번호, 토큰 등 민감 정보 마스킹
- **암호화**: 중요 로그 데이터 암호화 저장
- **접근 제어**: 로그 조회 권한 엄격한 관리

### 2. 로그 무결성
- **디지털 서명**: 로그 데이터 무결성 검증
- **체인 해시**: 로그 체인 무결성 보장
- **백업 및 아카이브**: 안전한 로그 보관

### 3. 개인정보 보호
- **GDPR 준수**: 개인정보 처리 원칙 준수
- **데이터 보존**: 법정 보존 기간 관리
- **익명화**: 필요시 개인정보 익명화

## 📈 모니터링 및 알림

### 1. 실시간 모니터링
- **대시보드**: 실시간 로그 모니터링
- **알림**: 중요 이벤트 실시간 알림
- **경고**: 의심스러운 활동 자동 감지

### 2. 분석 및 보고서
- **사용자 활동 분석**: 사용자별 활동 패턴 분석
- **보안 이벤트 분석**: 보안 관련 이벤트 분석
- **성능 분석**: 시스템 성능 영향 분석

### 3. 컴플라이언스
- **감사 보고서**: 정기 감사 보고서 생성
- **규제 준수**: 관련 규제 요구사항 충족
- **증적 보관**: 법적 증적 보관 및 관리

## 🚀 구현 완료

### ✅ Phase 1: 기본 로깅 시스템
- [x] 데이터베이스 스키마 설계 및 구현
- [x] 기본 AuditLogService 구현
- [x] API 엔드포인트 구현
- [x] 기본 프론트엔드 컴포넌트 구현

### ✅ Phase 2: 고급 기능
- [x] 실시간 로깅 및 모니터링
- [x] 고급 검색 및 필터링
- [x] 통계 및 분석 기능
- [x] 내보내기 기능

### 🔄 Phase 3: 보안 및 컴플라이언스 (향후 구현)
- [ ] 로그 암호화 및 무결성 검증
- [ ] 개인정보 보호 기능
- [ ] 컴플라이언스 보고서
- [ ] 아카이브 및 백업 시스템

## 📁 구현된 파일 구조

### API 서버 (apps/api/src/features/audit-log/)
```
audit-log/
├── domain/
│   ├── entities/
│   │   ├── audit-log.entity.ts
│   │   └── log-category.entity.ts
│   ├── dto/
│   │   ├── create-audit-log.dto.ts
│   │   ├── audit-log-filters.dto.ts
│   │   └── audit-log-response.dto.ts
│   └── repositories/
│       └── audit-log.repository.interface.ts
├── infrastructure/
│   └── repositories/
│       └── audit-log.repository.ts
├── application/
│   ├── services/
│   │   └── audit-log.service.ts
│   └── interceptors/
│       └── audit-log.interceptor.ts
└── presentation/
    ├── audit-log.controller.ts
    └── audit-log.module.ts
```

### 프론트엔드 (apps/backoffice/src/features/audit-log/)
```
audit-log/
├── domain/
│   └── entities/
│       └── audit-log.entity.ts
├── application/
│   ├── services/
│   │   └── audit-log.service.ts
│   ├── stores/
│   │   └── audit-log.store.ts
│   └── hooks/
│       └── use-audit-logs.ts
└── presentation/
    ├── components/
    │   ├── AuditLogFilters.tsx
    │   ├── AuditLogTable.tsx
    │   └── AuditLogStatistics.tsx
    └── pages/
        └── AuditLogPage.tsx
```

## 🔧 사용 방법

### 1. API 서버 설정
```typescript
// app.module.ts에 AuditLogModule 추가
import { AuditLogModule } from './features/audit-log/presentation/audit-log.module';

@Module({
  imports: [
    // ... other modules
    AuditLogModule,
  ],
})
export class AppModule {}
```

### 2. 프론트엔드 라우팅
```typescript
// App.tsx에 라우트 추가
<Route 
  path={ROUTES.AUDIT.LOGS} 
  element={
    <LazyPage>
      <AuditLogPage />
    </LazyPage>
  } 
/>
```

### 3. 로그 기록 예시
```typescript
// AuthController에서 로그인 로깅
await this.auditLogService.logLogin(
  user,
  req.ip,
  req.headers['user-agent'],
  req.sessionID,
  req.headers['x-request-id'],
  true
);
```

## 📊 주요 기능

### 1. 실시간 로깅
- 모든 API 호출 자동 로깅
- 사용자 활동 추적
- 시스템 이벤트 기록

### 2. 고급 검색 및 필터링
- 다중 조건 검색
- 날짜 범위 필터링
- 사용자별 필터링
- 액션별 필터링

### 3. 통계 및 분석
- 실시간 통계 대시보드
- 사용자별 활동 분석
- 시간대별 활동 패턴
- 카테고리별 분포

### 4. 데이터 내보내기
- CSV/JSON 형식 내보내기
- 필터링된 데이터 내보내기
- 자동 파일 다운로드

## 🔒 보안 고려사항

### 1. 접근 권한
- SUPER_ADMIN: 모든 로그 조회 및 관리
- ADMIN: 기본 로그 조회 및 내보내기
- 일반 사용자: 접근 불가

### 2. 데이터 보호
- 민감 정보 마스킹
- IP 주소 기록
- 사용자 에이전트 추적

### 3. 로그 무결성
- 타임스탬프 검증
- 사용자 식별 정보 보존
- 액션 추적성

## 📚 참고 자료

- [NestJS Logging Documentation](https://docs.nestjs.com/techniques/logger)
- [React Logging Best Practices](https://reactjs.org/docs/error-boundaries.html)
- [Database Audit Logging](https://docs.microsoft.com/en-us/sql/relational-databases/security/auditing/)
- [GDPR Compliance Guide](https://gdpr.eu/)
