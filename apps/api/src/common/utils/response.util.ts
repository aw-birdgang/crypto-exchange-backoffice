import { ApiResponse } from '@crypto-exchange/shared';

export class ResponseUtil {
  static success<T>(data: T, message: string = 'Success'): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string, error?: any): ApiResponse<null> {
    return {
      success: false,
      data: null,
      message,
      error,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Success',
  ): ApiResponse<{
    items: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const totalPages = Math.ceil(total / limit);
    
    return {
      success: true,
      data: {
        items: data,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
      message,
      timestamp: new Date().toISOString(),
    };
  }
}
