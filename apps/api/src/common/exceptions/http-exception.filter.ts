import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '@crypto-exchange/shared';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.getHttpStatus(exception);
    const message = this.getErrorMessage(exception);
    const error = this.getErrorDetails(exception);

    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      message,
      error: typeof error === 'string' ? error : JSON.stringify(error),
      timestamp: new Date().toISOString(),
    };

    // 로그 레벨 결정
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${message}`,
      );
    }

    response.status(status).json(errorResponse);
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    // 데이터베이스 관련 에러
    if (exception instanceof Error) {
      if (exception.message.includes('duplicate key')) {
        return HttpStatus.CONFLICT;
      }
      if (exception.message.includes('foreign key')) {
        return HttpStatus.BAD_REQUEST;
      }
      if (exception.message.includes('not found')) {
        return HttpStatus.NOT_FOUND;
      }
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return response;
      }
      if (typeof response === 'object' && response !== null) {
        return (response as any).message || exception.message;
      }
      return exception.message;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }

  private getErrorDetails(exception: unknown): any {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        return (response as any).error || 'Bad Request';
      }
    }

    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: exception.stack,
        }),
      };
    }

    return 'Internal Server Error';
  }
}
