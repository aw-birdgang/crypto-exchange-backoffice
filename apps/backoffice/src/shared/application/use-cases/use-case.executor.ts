import { 
  UseCaseContext, 
  UseCaseResult, 
  UseCaseError,
  UseCaseMiddleware,
  LogLevel
} from '../../domain/use-cases/base.use-case.interface';

/**
 * Use Case 실행기 인터페이스
 */
export interface UseCaseExecutor {
  execute<T, R>(
    useCase: (context: UseCaseContext) => Promise<T>,
    context: UseCaseContext
  ): Promise<UseCaseResult<R>>;
}

/**
 * Use Case 실행기 구현체
 * 미들웨어, 로깅, 에러 처리, 성능 측정 등을 담당
 */
export class UseCaseExecutorImpl implements UseCaseExecutor {
  private middlewares: UseCaseMiddleware[] = [];

  constructor(middlewares: UseCaseMiddleware[] = []) {
    this.middlewares = middlewares;
  }

  /**
   * 미들웨어 추가
   */
  addMiddleware(middleware: UseCaseMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * Use Case 실행
   */
  async execute<T, R>(
    useCase: (context: UseCaseContext) => Promise<T>,
    context: UseCaseContext
  ): Promise<UseCaseResult<R>> {
    const startTime = Date.now();
    let processedContext = context;

    try {
      // Before 미들웨어 실행
      for (const middleware of this.middlewares) {
        processedContext = await middleware.before(processedContext);
      }

      // Use Case 실행
      const data = await useCase(processedContext) as R;
      const executionTime = Date.now() - startTime;

      const result: UseCaseResult<R> = {
        success: true,
        data,
        metadata: {
          executionTime,
          timestamp: new Date(),
          requestId: context.requestId,
        },
      };

      // After 미들웨어 실행
      let processedResult = result;
      for (const middleware of this.middlewares) {
        processedResult = await middleware.after(processedResult, processedContext);
      }

      return processedResult;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      // 에러 미들웨어 실행
      for (const middleware of this.middlewares) {
        await middleware.onError(error as Error, processedContext);
      }

      const useCaseError: UseCaseError = {
        code: this.getErrorCode(error as Error),
        message: (error as Error).message,
        details: this.getErrorDetails(error as Error),
        stack: (error as Error).stack,
      };

      return {
        success: false,
        error: useCaseError,
        metadata: {
          executionTime,
          timestamp: new Date(),
          requestId: context.requestId,
        },
      };
    }
  }

  /**
   * 에러 코드 추출
   */
  private getErrorCode(error: Error): string {
    if (error.name === 'ValidationError') return 'VALIDATION_ERROR';
    if (error.name === 'AuthenticationError') return 'AUTHENTICATION_ERROR';
    if (error.name === 'AuthorizationError') return 'AUTHORIZATION_ERROR';
    if (error.name === 'NotFoundError') return 'NOT_FOUND_ERROR';
    if (error.name === 'ConflictError') return 'CONFLICT_ERROR';
    if (error.name === 'RateLimitError') return 'RATE_LIMIT_ERROR';
    return 'UNKNOWN_ERROR';
  }

  /**
   * 에러 세부사항 추출
   */
  private getErrorDetails(error: Error): Record<string, any> {
    const details: Record<string, any> = {
      name: error.name,
      message: error.message,
    };

    // 특정 에러 타입에 대한 추가 정보
    if (error.name === 'ValidationError') {
      details.validationErrors = (error as any).validationErrors;
    }

    return details;
  }
}

/**
 * 로깅 미들웨어
 */
export class LoggingMiddleware implements UseCaseMiddleware {
  constructor(private logger: (level: LogLevel, message: string, context?: any) => void) {}

  async before(context: UseCaseContext): Promise<UseCaseContext> {
    this.logger(LogLevel.INFO, 'Use case execution started', {
      requestId: context.requestId,
      userId: context.userId,
      timestamp: context.timestamp,
    });
    return context;
  }

  async after<T>(result: UseCaseResult<T>, context: UseCaseContext): Promise<UseCaseResult<T>> {
    const level = result.success ? LogLevel.INFO : LogLevel.ERROR;
    this.logger(level, 'Use case execution completed', {
      requestId: context.requestId,
      success: result.success,
      executionTime: result.metadata.executionTime,
      error: result.error,
    });
    return result;
  }

  async onError(error: Error, context: UseCaseContext): Promise<void> {
    this.logger(LogLevel.ERROR, 'Use case execution failed', {
      requestId: context.requestId,
      error: error.message,
      stack: error.stack,
    });
  }
}

/**
 * 성능 측정 미들웨어
 */
export class PerformanceMiddleware implements UseCaseMiddleware {
  private performanceData: Map<string, number[]> = new Map();

  async before(context: UseCaseContext): Promise<UseCaseContext> {
    // 성능 측정 시작
    (context as any).performanceStart = Date.now();
    return context;
  }

  async after<T>(result: UseCaseResult<T>, context: UseCaseContext): Promise<UseCaseResult<T>> {
    const startTime = (context as any).performanceStart;
    if (startTime) {
      const duration = Date.now() - startTime;
      
      // 성능 데이터 수집
      const useCaseName = context.metadata.useCaseName || 'unknown';
      if (!this.performanceData.has(useCaseName)) {
        this.performanceData.set(useCaseName, []);
      }
      
      const durations = this.performanceData.get(useCaseName)!;
      durations.push(duration);
      
      // 최근 100개만 유지
      if (durations.length > 100) {
        durations.splice(0, durations.length - 100);
      }
    }
    
    return result;
  }

  async onError(error: Error, context: UseCaseContext): Promise<void> {
    // 에러 발생 시에도 성능 데이터 수집
    const startTime = (context as any).performanceStart;
    if (startTime) {
      const duration = Date.now() - startTime;
      console.warn(`Use case failed after ${duration}ms:`, error.message);
    }
  }

  /**
   * 성능 통계 조회
   */
  getPerformanceStats(useCaseName: string): {
    average: number;
    min: number;
    max: number;
    count: number;
  } | null {
    const durations = this.performanceData.get(useCaseName);
    if (!durations || durations.length === 0) {
      return null;
    }

    const sorted = [...durations].sort((a, b) => a - b);
    const average = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    
    return {
      average,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      count: durations.length,
    };
  }
}

/**
 * 캐싱 미들웨어
 */
export class CachingMiddleware implements UseCaseMiddleware {
  constructor(
    private cache: Map<string, { data: any; expires: number }>,
    private defaultTtl: number = 5 * 60 * 1000 // 5분
  ) {}

  async before(context: UseCaseContext): Promise<UseCaseContext> {
    // 캐시 키 생성
    const cacheKey = this.generateCacheKey(context);
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expires > Date.now()) {
      // 캐시 히트
      (context as any).cachedResult = cached.data;
      (context as any).cacheKey = cacheKey;
    }
    
    return context;
  }

  async after<T>(result: UseCaseResult<T>, context: UseCaseContext): Promise<UseCaseResult<T>> {
    const cacheKey = (context as any).cacheKey;
    const ttl = (context as any).cacheTtl || this.defaultTtl;
    
    if (cacheKey && result.success && result.data) {
      // 캐시 저장
      this.cache.set(cacheKey, {
        data: result.data,
        expires: Date.now() + ttl,
      });
    }
    
    return result;
  }

  async onError(error: Error, context: UseCaseContext): Promise<void> {
    // 에러 발생 시 캐시 무효화
    const cacheKey = (context as any).cacheKey;
    if (cacheKey) {
      this.cache.delete(cacheKey);
    }
  }

  private generateCacheKey(context: UseCaseContext): string {
    const useCaseName = context.metadata.useCaseName || 'unknown';
    const params = JSON.stringify(context.metadata.params || {});
    return `${useCaseName}:${Buffer.from(params).toString('base64')}`;
  }
}

/**
 * Use Case 실행기 팩토리
 */
export class UseCaseExecutorFactory {
  static createDefault(): UseCaseExecutorImpl {
    const middlewares: UseCaseMiddleware[] = [
      new LoggingMiddleware(console.log),
      new PerformanceMiddleware(),
      new CachingMiddleware(new Map()),
    ];

    return new UseCaseExecutorImpl(middlewares);
  }

  static createWithMiddlewares(middlewares: UseCaseMiddleware[]): UseCaseExecutorImpl {
    return new UseCaseExecutorImpl(middlewares);
  }
}
