import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    error?: string,
  ) {
    super(
      {
        message,
        error: error || 'Business Logic Error',
        statusCode: status,
      },
      status,
    );
  }
}

export class ValidationException extends BusinessException {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.BAD_REQUEST, 'Validation Error');
    this.details = details;
  }

  details?: any;
}

export class NotFoundException extends BusinessException {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, HttpStatus.NOT_FOUND, 'Resource Not Found');
  }
}

export class ConflictException extends BusinessException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT, 'Resource Conflict');
  }
}

export class UnauthorizedException extends BusinessException {
  constructor(message: string = 'Unauthorized access') {
    super(message, HttpStatus.UNAUTHORIZED, 'Unauthorized');
  }
}

export class ForbiddenException extends BusinessException {
  constructor(message: string = 'Insufficient permissions') {
    super(message, HttpStatus.FORBIDDEN, 'Forbidden');
  }
}
