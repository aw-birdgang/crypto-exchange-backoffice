# 에러코드 시스템 가이드

## 개요

이 프로젝트는 체계적이고 일관된 에러 처리를 위한 에러코드 시스템을 구현합니다. 모든 에러는 구조화된 코드와 메시지를 가지며, 심각도와 카테고리로 분류됩니다.

## 에러코드 구조

```
[DOMAIN]_[CATEGORY]_[SPECIFIC_ERROR]
```

### 도메인 (DOMAIN)
- `AUTH`: 인증/인가 관련
- `USER`: 사용자 관리 관련
- `PERMISSION`: 권한 관리 관련
- `WALLET`: 지갑/거래 관련
- `CUSTOMER`: 고객 지원 관련
- `SYSTEM`: 시스템 관련
- `VALIDATION`: 입력 검증 관련
- `NETWORK`: 네트워크 관련
- `RATE_LIMIT`: 요청 제한 관련

### 카테고리 (CATEGORY)
- `AUTH`: 인증
- `AUTHZ`: 인가/권한
- `NOT_FOUND`: 리소스 없음
- `CONFLICT`: 충돌
- `INVALID`: 유효하지 않음
- `EXPIRED`: 만료
- `LOCKED`: 잠김
- `RATE_LIMIT`: 요청 제한
- `MAINTENANCE`: 유지보수
- `INTERNAL`: 내부 오류

## 사용 방법

### 1. API 서버에서 에러 발생

```typescript
import { ExceptionFactory } from '@crypto-exchange/shared';

// 사용자 인증 실패
throw ExceptionFactory.invalidCredentials({ email: 'user@example.com' });

// 사용자 없음
throw ExceptionFactory.userNotFound({ userId: '123' });

// 권한 부족
throw ExceptionFactory.insufficientPermissions({ 
  requiredPermission: 'users:create',
  userRole: 'support' 
});

// 이메일 중복
throw ExceptionFactory.emailDuplicate({ email: 'user@example.com' });

// 입력 검증 실패
throw ExceptionFactory.requiredFieldMissing('email');

// 비밀번호 형식 오류
throw ExceptionFactory.invalidPasswordFormat({ 
  minLength: 8,
  providedLength: 5 
});
```

### 2. 커스텀 에러코드 사용

```typescript
import { EnhancedBusinessException, ERROR_CODES } from '@crypto-exchange/shared';

// 직접 에러코드 사용
throw new EnhancedBusinessException(
  ERROR_CODES.AUTH.AUTH_TOKEN_EXPIRED,
  { tokenId: 'abc123' },
  'req_12345'
);

// 사용자 정의 예외 클래스
class CustomUserException extends EnhancedBusinessException {
  constructor(details?: Record<string, unknown>, requestId?: string) {
    super(ERROR_CODES.USER.USER_CREATE_FAILED, details, requestId);
  }
}
```

### 3. 프론트엔드에서 에러 처리

```typescript
import { ErrorHandler } from '../utils/error-handler';

try {
  const response = await apiService.post('/auth/login', loginData);
  return response;
} catch (error) {
  const appError = ErrorHandler.handleApiError(error);
  
  // 에러코드별 처리
  switch (appError.code) {
    case 'AUTH_AUTH_INVALID_CREDENTIALS':
      showToast('이메일 또는 비밀번호가 올바르지 않습니다.');
      break;
    case 'AUTH_AUTH_ACCOUNT_PENDING':
      showToast('계정이 승인 대기 중입니다.');
      break;
    case 'AUTH_AUTH_TOKEN_EXPIRED':
      // 토큰 갱신 시도
      await refreshToken();
      break;
    default:
      showToast(appError.message);
  }
  
  // 심각도별 처리
  if (appError.severity === 'critical') {
    // 로그 전송, 관리자 알림 등
    reportCriticalError(appError);
  }
}
```

## 에러 응답 형식

### API 응답
```json
{
  "success": false,
  "error": {
    "code": "AUTH_AUTH_INVALID_CREDENTIALS",
    "message": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "status": 401,
    "severity": "high",
    "category": "auth",
    "details": {
      "email": "user@example.com",
      "attemptCount": 3
    },
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_12345"
  },
  "data": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 에러 심각도

- `low`: 일반적인 사용자 오류 (잘못된 입력 등)
- `medium`: 비즈니스 로직 오류 (중복 데이터 등)
- `high`: 보안 관련 오류 (인증 실패 등)
- `critical`: 시스템 오류 (데이터베이스 연결 실패 등)

## 에러 카테고리

- `auth`: 인증/인가
- `user`: 사용자 관리
- `permission`: 권한 관리
- `wallet`: 지갑/거래
- `customer`: 고객 지원
- `system`: 시스템
- `validation`: 입력 검증
- `network`: 네트워크
- `rate_limit`: 요청 제한

## 로깅 및 모니터링

에러는 심각도와 카테고리에 따라 자동으로 분류되어 로깅됩니다:

```typescript
// 심각도별 로그 레벨
if (error.severity === 'critical') {
  logger.error(message, stack, context);
} else if (error.severity === 'high') {
  logger.warn(message, context);
} else {
  logger.log(message, context);
}
```

## 에러코드 추가

새로운 에러코드를 추가할 때는 다음 단계를 따르세요:

1. `packages/shared/src/constants/error-codes.ts`에 에러코드 추가
2. `packages/shared/src/types/error.types.ts`에 메시지 추가
3. `apps/api/src/common/exceptions/enhanced-business.exception.ts`에 헬퍼 함수 추가 (필요시)
4. 문서 업데이트

## 마이그레이션 가이드

기존 에러 처리를 새로운 시스템으로 마이그레이션:

### Before
```typescript
throw new ConflictException('User with this email already exists');
```

### After
```typescript
throw ExceptionFactory.emailDuplicate({ email: 'user@example.com' });
```

### Before
```typescript
throw new UnauthorizedException('Invalid credentials');
```

### After
```typescript
throw ExceptionFactory.invalidCredentials({ email: 'user@example.com' });
```

## 모범 사례

1. **일관성**: 같은 종류의 에러는 항상 같은 에러코드 사용
2. **구체성**: 가능한 한 구체적인 에러코드 사용
3. **상세 정보**: `details` 필드에 디버깅에 필요한 정보 포함
4. **사용자 친화적**: 에러 메시지는 사용자가 이해하기 쉽게 작성
5. **로깅**: 모든 에러는 적절한 로그 레벨로 기록
6. **모니터링**: 심각한 에러는 모니터링 시스템에 알림
