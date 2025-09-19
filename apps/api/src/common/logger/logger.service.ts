import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LogContext {
  userId?: string;
  requestId?: string;
  operation?: string;
  duration?: number;
  [key: string]: any;
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly context: string;

  constructor(
    context: string,
    private configService: ConfigService,
  ) {
    this.context = context;
  }

  log(message: string, context?: LogContext): void {
    this.logMessage(LogLevel.INFO, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.logMessage(LogLevel.INFO, message, context);
  }

  error(message: string, trace?: string, context?: LogContext): void {
    this.logMessage(LogLevel.ERROR, message, { ...context, trace });
  }

  warn(message: string, context?: LogContext): void {
    this.logMessage(LogLevel.WARN, message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.logMessage(LogLevel.DEBUG, message, context);
  }

  verbose(message: string, context?: LogContext): void {
    this.logMessage(LogLevel.VERBOSE, message, context);
  }

  private logMessage(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const nodeEnv = this.configService.get<string>('app.nodeEnv', 'development');
    
    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...context,
    };

    // 개발 환경에서는 콘솔에 출력
    if (nodeEnv === 'development') {
      this.logToConsole(level, logEntry);
    }

    // 프로덕션 환경에서는 구조화된 로그 출력
    if (nodeEnv === 'production') {
      this.logToStructured(level, logEntry);
    }
  }

  private logToConsole(level: LogLevel, logEntry: any): void {
    const { timestamp, level: logLevel, context, message, ...meta } = logEntry;
    const emoji = this.getLevelEmoji(logLevel);
    
    console.log(
      `${emoji} [${timestamp}] ${logLevel.toUpperCase()} [${context}] ${message}`,
      Object.keys(meta).length > 0 ? meta : ''
    );
  }

  private logToStructured(level: LogLevel, logEntry: any): void {
    // 프로덕션에서는 JSON 형태로 로그 출력
    console.log(JSON.stringify(logEntry));
  }

  private getLevelEmoji(level: LogLevel): string {
    const emojis = {
      [LogLevel.ERROR]: '❌',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.DEBUG]: '🐛',
      [LogLevel.VERBOSE]: '📝',
    };
    return emojis[level] || '📝';
  }

  // 성능 로깅
  logPerformance(operation: string, duration: number, context?: LogContext): void {
    this.info(`Performance: ${operation} completed in ${duration}ms`, {
      ...context,
      operation,
      duration,
      type: 'performance',
    });
  }

  // 보안 이벤트 로깅
  logSecurityEvent(event: string, details: any, context?: LogContext): void {
    this.warn(`Security Event: ${event}`, {
      ...context,
      event,
      details,
      type: 'security',
    });
  }

  // 비즈니스 이벤트 로깅
  logBusinessEvent(event: string, details: any, context?: LogContext): void {
    this.info(`Business Event: ${event}`, {
      ...context,
      event,
      details,
      type: 'business',
    });
  }
}
