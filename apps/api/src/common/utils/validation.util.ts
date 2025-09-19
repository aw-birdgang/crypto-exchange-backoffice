import { ValidationException } from '../exceptions/business.exception';

export class ValidationUtil {
  static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationException('Invalid email format');
    }
  }

  static validatePassword(password: string): void {
    if (password.length < 8) {
      throw new ValidationException('Password must be at least 8 characters long');
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      throw new ValidationException(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
    }
  }

  static validateUuid(id: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new ValidationException('Invalid UUID format');
    }
  }

  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static validatePaginationParams(page?: number, limit?: number): { page: number; limit: number } {
    const validatedPage = Math.max(1, page || 1);
    const validatedLimit = Math.min(100, Math.max(1, limit || 20));
    
    return {
      page: validatedPage,
      limit: validatedLimit,
    };
  }
}
