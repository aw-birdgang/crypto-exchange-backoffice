# API 버전 데코레이터 구동원리 가이드

## 📋 목차
1. [개요](#개요)
2. [아키텍처 구조](#아키텍처-구조)
3. [구동원리](#구동원리)
4. [핵심 컴포넌트](#핵심-컴포넌트)
5. [처리 플로우](#처리-플로우)
6. [사용 예시](#사용-예시)
7. [고급 기능](#고급-기능)

## 개요

API 버전 데코레이터는 NestJS 애플리케이션에서 API 버전을 체계적으로 관리하기 위한 메타데이터 기반 시스템입니다. 이 시스템은 데코레이터, 미들웨어, 가드, 인터셉터를 조합하여 버전별 API 라우팅과 검증을 자동화합니다.

### 주요 특징
- **메타데이터 기반**: NestJS의 `SetMetadata`를 활용한 선언적 버전 관리
- **다중 버전 지원**: URL, 헤더, 쿼리 파라미터를 통한 버전 지정
- **자동 검증**: 가드를 통한 버전 호환성 검증
- **Swagger 통합**: API 문서에서 버전별 그룹화
- **타입 안전성**: TypeScript를 활용한 컴파일 타임 검증

## 아키텍처 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    API Version System                       │
├─────────────────────────────────────────────────────────────┤
│  Client Request                                             │
│  ├─ URL: /api/v1/auth/login                                │
│  ├─ Header: api-version: v1                                │
│  └─ Query: ?version=v1                                     │
├─────────────────────────────────────────────────────────────┤
│  Middleware Layer                                           │
│  ├─ ApiVersionMiddleware                                    │
│  ├─ RequestIdMiddleware                                     │
│  └─ SecurityMiddleware                                      │
├─────────────────────────────────────────────────────────────┤
│  Guard Layer                                                │
│  ├─ ApiVersionGuard                                         │
│  ├─ JwtAuthGuard                                           │
│  └─ RateLimitGuard                                         │
├─────────────────────────────────────────────────────────────┤
│  Controller Layer                                           │
│  ├─ @ApiVersion('v1')                                      │
│  ├─ @Controller('auth')                                    │
│  └─ @Get('login')                                          │
├─────────────────────────────────────────────────────────────┤
│  Service Layer                                              │
│  ├─ AuthService                                            │
│  └─ Business Logic                                         │
└─────────────────────────────────────────────────────────────┘
```

## 구동원리

### 1. 메타데이터 시스템

API 버전 데코레이터는 NestJS의 메타데이터 시스템을 기반으로 동작합니다.

```typescript
// 1. 데코레이터 정의
export const ApiVersion = (version: string) => SetMetadata(API_VERSION_KEY, version);

// 2. 메타데이터 적용
@ApiVersion('v1')
@Controller('auth')
export class AuthController {
  @ApiVersion('v2')
  @Get('profile')
  async getProfile() {}
}

// 3. 메타데이터 조회
const version = this.reflector.getAllAndOverride<string>(API_VERSION_KEY, [
  context.getHandler(),
  context.getClass(),
]);
```

### 2. 미들웨어 처리

`ApiVersionMiddleware`는 요청의 다양한 소스에서 버전 정보를 추출합니다.

```typescript
export class ApiVersionMiddleware implements NestMiddleware {
  use(req: RequestWithApiVersion, res: Response, next: NextFunction) {
    // 1. 헤더에서 버전 추출
    const apiVersion = req.headers['api-version'] as string;
    const acceptVersion = req.headers['accept-version'] as string;
    
    // 2. URL에서 버전 추출
    const urlVersion = this.extractVersionFromUrl(req.url);
    
    // 3. 버전 정보를 request 객체에 저장
    req.apiVersion = apiVersion || acceptVersion || urlVersion || 'v1';
    
    // 4. 응답 헤더에 버전 정보 추가
    res.setHeader('X-API-Version', req.apiVersion);
    
    next();
  }
}
```

### 3. 가드 검증

`ApiVersionGuard`는 요청된 버전과 컨트롤러/메서드의 요구 버전을 비교합니다.

```typescript
export class ApiVersionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // 1. 메타데이터에서 요구 버전 조회
    const requiredVersion = this.reflector.getAllAndOverride<string>(API_VERSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. 요청에서 실제 버전 조회
    const request = context.switchToHttp().getRequest();
    const requestVersion = request.apiVersion;

    // 3. 버전 호환성 검증
    if (!this.isVersionCompatible(requestVersion, requiredVersion)) {
      throw new BadRequestException(
        `API version ${requestVersion} is not compatible with required version ${requiredVersion}`
      );
    }

    return true;
  }
}
```

## 핵심 컴포넌트

### 1. ApiVersion 데코레이터

```typescript
// 기본 버전 데코레이터
export const ApiVersion = (version: string) => SetMetadata(API_VERSION_KEY, version);

// 버전과 태그를 함께 지정하는 데코레이터
export const ApiVersionWithTag = (version: string, tag: string) => 
  applyDecorators(
    ApiVersion(version),
    ApiTags(`${tag} (${version})`)
  );
```

**특징:**
- `SetMetadata`를 사용하여 메타데이터 저장
- 컨트롤러와 메서드 레벨에서 적용 가능
- Swagger 태그와 자동 연동

### 2. ApiVersionMiddleware

```typescript
export class ApiVersionMiddleware implements NestMiddleware {
  use(req: RequestWithApiVersion, res: Response, next: NextFunction) {
    // 버전 추출 로직
    const apiVersion = req.headers['api-version'] as string;
    const acceptVersion = req.headers['accept-version'] as string;
    const urlVersion = this.extractVersionFromUrl(req.url);
    
    // 우선순위: 헤더 > URL > 기본값
    req.apiVersion = apiVersion || acceptVersion || urlVersion || 'v1';
    
    // 응답 헤더 설정
    res.setHeader('X-API-Version', req.apiVersion);
    
    next();
  }
}
```

**특징:**
- 다중 소스에서 버전 정보 추출
- 우선순위 기반 버전 선택
- 응답 헤더에 버전 정보 포함

### 3. ApiVersionGuard

```typescript
export class ApiVersionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredVersion = this.reflector.getAllAndOverride<string>(API_VERSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const requestVersion = request.apiVersion;

    // 버전 검증 로직
    return this.isVersionCompatible(requestVersion, requiredVersion);
  }
}
```

**특징:**
- 메타데이터 기반 버전 검증
- 호환성 검사 로직
- 에러 처리 및 예외 발생

## 처리 플로우

### 1. 요청 수신 단계

```
Client Request
    ↓
┌─────────────────┐
│   HTTP Request  │
│   - URL: /api/v1/auth/login
│   - Headers: api-version: v1
│   - Body: { email, password }
└─────────────────┘
    ↓
┌─────────────────┐
│  NestJS Router  │
│  - Route Matching
│  - Middleware Chain
└─────────────────┘
```

### 2. 미들웨어 처리 단계

```
┌─────────────────┐
│ ApiVersion      │
│ Middleware      │
│                 │
│ 1. Extract      │
│    - api-version header
│    - accept-version header
│    - URL pattern
│                 │
│ 2. Determine    │
│    - Priority: header > URL > default
│    - Set req.apiVersion
│                 │
│ 3. Set Response │
│    - X-API-Version header
└─────────────────┘
    ↓
┌─────────────────┐
│ Other           │
│ Middlewares     │
│ - RequestId     │
│ - Security      │
│ - CORS          │
│ - Logging       │
└─────────────────┘
```

### 3. 가드 검증 단계

```
┌─────────────────┐
│ ApiVersion      │
│ Guard           │
│                 │
│ 1. Get Required │
│    - From @ApiVersion decorator
│    - Method level > Class level
│                 │
│ 2. Get Request  │
│    - From req.apiVersion
│    - Set by middleware
│                 │
│ 3. Validate     │
│    - Version format check
│    - Compatibility check
│    - Throw exception if invalid
└─────────────────┘
    ↓
┌─────────────────┐
│ Other Guards    │
│ - JwtAuthGuard  │
│ - RateLimitGuard│
│ - RolesGuard    │
└─────────────────┘
```

### 4. 컨트롤러 실행 단계

```
┌─────────────────┐
│ Controller      │
│ Method          │
│                 │
│ 1. Execute      │
│    - Business logic
│    - Service calls
│    - Data processing
│                 │
│ 2. Return       │
│    - Response data
│    - Status code
│    - Headers
└─────────────────┘
    ↓
┌─────────────────┐
│ Interceptors    │
│ - Response      │
│ - Performance   │
│ - Logging       │
└─────────────────┘
```

## 사용 예시

### 1. 기본 컨트롤러 설정

```typescript
@ApiTags('Authentication')
@Controller('auth')
@ApiVersion('v1')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

### 2. 메서드별 버전 지정

```typescript
@Controller('users')
export class UserController {
  @Get()
  @ApiVersion('v1')
  async getUsersV1() {
    // v1 버전의 사용자 목록
  }

  @Get()
  @ApiVersion('v2')
  async getUsersV2() {
    // v2 버전의 사용자 목록 (페이징, 필터링 등)
  }
}
```

### 3. 버전별 DTO 사용

```typescript
@Controller('profile')
export class ProfileController {
  @Get()
  @ApiVersion('v1')
  async getProfileV1(): Promise<UserProfileV1Dto> {
    return this.profileService.getProfileV1();
  }

  @Get()
  @ApiVersion('v2')
  async getProfileV2(): Promise<UserProfileV2Dto> {
    return this.profileService.getProfileV2();
  }
}
```

## 고급 기능

### 1. 버전 호환성 관리

```typescript
export class ApiVersionGuard implements CanActivate {
  private isVersionCompatible(requestVersion: string, requiredVersion: string): boolean {
    // 정확한 버전 매칭
    if (requestVersion === requiredVersion) {
      return true;
    }

    // 하위 호환성 검사 (예: v2가 v1을 지원)
    const compatibilityMatrix = {
      'v2': ['v1'],
      'v3': ['v2', 'v1'],
    };

    return compatibilityMatrix[requestVersion]?.includes(requiredVersion) || false;
  }
}
```

### 2. 버전별 로깅

```typescript
@Injectable()
export class ApiVersionLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const apiVersion = request.apiVersion;
    
    console.log(`API Request - Version: ${apiVersion}, Path: ${request.url}`);
    
    return next.handle().pipe(
      tap(() => {
        console.log(`API Response - Version: ${apiVersion}, Status: Success`);
      })
    );
  }
}
```

### 3. 버전별 성능 모니터링

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
        this.metricsService.recordApiVersionPerformance(apiVersion, duration);
      })
    );
  }
}
```
