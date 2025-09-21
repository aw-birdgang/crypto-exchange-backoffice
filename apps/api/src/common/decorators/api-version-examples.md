# API 버전 데코레이터 사용 가이드

## 1. 기본 사용법

### 컨트롤러 레벨에서 버전 지정
```typescript
@ApiTags('Authentication')
@Controller('auth')
@ApiVersion('v1')
export class AuthController {
  // 모든 엔드포인트가 v1 버전을 상속
}
```

### 메서드 레벨에서 버전 지정
```typescript
@Controller('auth')
export class AuthController {
  @Get('profile')
  @ApiVersion('v2')  // 이 메서드만 v2 버전
  async getProfile() {
    // v2 버전의 프로필 조회 로직
  }
}
```

## 2. 고급 사용법

### 버전과 태그를 함께 지정
```typescript
@ApiVersionWithTag('v1', 'Authentication')
@Controller('auth')
export class AuthController {
  // Swagger에서 "Authentication (v1)" 태그로 표시
}
```

### 다중 버전 지원
```typescript
@Controller('users')
export class UserController {
  @Get()
  @ApiVersion('v1')
  async getUsersV1() {
    // v1 버전의 사용자 목록 조회
  }

  @Get()
  @ApiVersion('v2')
  async getUsersV2() {
    // v2 버전의 사용자 목록 조회 (페이징, 필터링 등 추가)
  }
}
```

## 3. 버전 관리 전략

### URL 기반 버전 관리
```
/api/v1/auth/login
/api/v2/auth/login
```

### 헤더 기반 버전 관리
```
Headers:
  api-version: v1
  accept-version: v2
```

### 쿼리 파라미터 기반 버전 관리
```
/api/auth/login?version=v1
```

## 4. 버전 호환성 처리

### 하위 호환성 유지
```typescript
@Controller('auth')
export class AuthController {
  @Get('profile')
  @ApiVersion('v1')
  async getProfileV1() {
    // 기본 프로필 정보만 반환
  }

  @Get('profile')
  @ApiVersion('v2')
  async getProfileV2() {
    // 확장된 프로필 정보 반환
  }
}
```

### 버전별 DTO 분리
```typescript
// v1 DTO
export class UserProfileV1Dto {
  id: string;
  email: string;
  name: string;
}

// v2 DTO
export class UserProfileV2Dto extends UserProfileV1Dto {
  avatar?: string;
  preferences: UserPreferences;
  lastLoginAt: Date;
}
```

## 5. 실제 적용 예시

### AuthController에 적용
```typescript
@ApiTags('Authentication')
@Controller('auth')
@ApiVersion('v1')
export class AuthController {
  @Post('login')
  @Public()
  @ApiVersion('v1')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('login')
  @Public()
  @ApiVersion('v2')
  async loginV2(@Body() loginV2Dto: LoginV2Dto) {
    return this.authService.loginV2(loginV2Dto);
  }
}
```

### UserController에 적용
```typescript
@ApiVersionWithTag('v1', 'User Management')
@Controller('users')
export class UserController {
  @Get()
  @ApiVersion('v1')
  async getUsers(@Query() query: GetUsersV1Query) {
    return this.userService.getUsersV1(query);
  }

  @Get()
  @ApiVersion('v2')
  async getUsersV2(@Query() query: GetUsersV2Query) {
    return this.userService.getUsersV2(query);
  }
}
```

## 6. 모니터링 및 로깅

### 버전별 요청 로깅
```typescript
@Injectable()
export class ApiVersionLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const apiVersion = request.apiVersion;
    
    console.log(`API Request - Version: ${apiVersion}, Path: ${request.url}`);
    
    return next.handle();
  }
}
```

### 버전별 성능 모니터링
```typescript
@Injectable()
export class ApiVersionPerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const apiVersion = request.apiVersion;
    const startTime = Date.now();
    
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        console.log(`API Performance - Version: ${apiVersion}, Duration: ${duration}ms`);
      })
    );
  }
}
```
