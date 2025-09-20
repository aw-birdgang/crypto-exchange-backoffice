import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const requestId = request.requestId || 'unknown';

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const { statusCode } = context.switchToHttp().getResponse();

        // 성능 임계값 설정 (1초)
        const threshold = 1000;
        const logLevel = duration > threshold ? 'warn' : 'info';

        if (logLevel === 'info') {
          this.logger.info(`${method} ${url}`, {
            method,
            url,
            statusCode,
            duration,
            ip,
            userAgent,
            requestId,
            type: 'performance',
          });
        } else {
          this.logger.warn(`${method} ${url}`, {
            method,
            url,
            statusCode,
            duration,
            ip,
            userAgent,
            requestId,
            type: 'performance',
          });
        }

        // 느린 요청에 대한 추가 로깅
        if (duration > threshold) {
          this.logger.warn(`Slow request detected: ${method} ${url}`, {
            method,
            url,
            duration,
            threshold,
            requestId,
            type: 'slow_request',
          });
        }
      }),
    );
  }
}
