/**
 * 기본 Use Case 인터페이스
 * 모든 Use Case가 구현해야 하는 공통 메서드
 */
export interface BaseUseCase {
  // Use Case 초기화
  initialize(): Promise<void>;
  
  // Use Case 정리
  cleanup(): Promise<void>;
  
  // Use Case 상태 확인
  isInitialized(): boolean;
  
  // Use Case 메타데이터
  getMetadata(): UseCaseMetadata;
}

/**
 * 검증 Use Case 인터페이스
 * 데이터 검증이 필요한 Use Case들이 구현
 */
export interface ValidationUseCase {
  validate<T>(data: T, rules: ValidationRule<T>[]): Promise<ValidationResult>;
  validateAsync<T>(data: T, rules: AsyncValidationRule<T>[]): Promise<ValidationResult>;
}

/**
 * 캐싱 Use Case 인터페이스
 * 캐싱이 필요한 Use Case들이 구현
 */
export interface CachingUseCase {
  getCacheKey(...args: any[]): string;
  getFromCache<T>(key: string): Promise<T | null>;
  setCache<T>(key: string, data: T, ttl?: number): Promise<void>;
  invalidateCache(pattern: string): Promise<void>;
  clearCache(): Promise<void>;
}

/**
 * 로깅 Use Case 인터페이스
 * 로깅이 필요한 Use Case들이 구현
 */
export interface LoggingUseCase {
  log(level: LogLevel, message: string, context?: Record<string, any>): void;
  logError(error: Error, context?: Record<string, any>): void;
  logPerformance(operation: string, duration: number, context?: Record<string, any>): void;
}

/**
 * 이벤트 Use Case 인터페이스
 * 이벤트 발행이 필요한 Use Case들이 구현
 */
export interface EventUseCase {
  publishEvent<T>(event: DomainEvent<T>): Promise<void>;
  subscribeToEvent<T>(eventType: string, handler: EventHandler<T>): void;
  unsubscribeFromEvent(eventType: string, handler: EventHandler<any>): void;
}

// 타입 정의
export interface UseCaseMetadata {
  name: string;
  version: string;
  description: string;
  dependencies: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ValidationRule<T> {
  field: keyof T;
  validator: (value: any) => boolean;
  message: string;
  required?: boolean;
}

export interface AsyncValidationRule<T> {
  field: keyof T;
  validator: (value: any) => Promise<boolean>;
  message: string;
  required?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export interface DomainEvent<T> {
  id: string;
  type: string;
  data: T;
  timestamp: Date;
  version: number;
  source: string;
}

export type EventHandler<T> = (event: DomainEvent<T>) => Promise<void> | void;

/**
 * Use Case 실행 컨텍스트
 */
export interface UseCaseContext {
  userId?: string;
  requestId: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

/**
 * Use Case 실행 결과
 */
export interface UseCaseResult<T> {
  success: boolean;
  data?: T;
  error?: UseCaseError;
  metadata: {
    executionTime: number;
    timestamp: Date;
    requestId: string;
  };
}

export interface UseCaseError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

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
 * Use Case 미들웨어 인터페이스
 */
export interface UseCaseMiddleware {
  before(context: UseCaseContext): Promise<UseCaseContext>;
  after<T>(result: UseCaseResult<T>, context: UseCaseContext): Promise<UseCaseResult<T>>;
  onError(error: Error, context: UseCaseContext): Promise<void>;
}
