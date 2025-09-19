import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { STORAGE_KEYS, ApiResponse } from '@crypto-exchange/shared';
import { appConfig } from '../../config/app.config';
import { ErrorHandler } from '../utils/error-handler';

const API_BASE_URL = appConfig.apiBaseUrl;

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        let token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        console.log('🔍 Checking token for request:', config.url);
        console.log('🔍 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
        
        // 운영 환경에서는 토큰이 없으면 인증되지 않은 상태로 처리
        if (!token) {
          console.warn('⚠️ No authentication token found');
        }
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ API Request with token:', config.url);
          console.log('🔑 Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
        } else {
          console.warn('⚠️ API Request without token:', config.url);
          console.warn('⚠️ This will likely result in 401 Unauthorized');
        }
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // 리프레시 토큰으로 새로운 액세스 토큰 요청
            const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (refreshToken) {
              const { authService } = await import('../../features/auth/application/services/auth.service');
              const response = await authService.refreshToken(refreshToken);
              
              // 새로운 토큰 저장
              localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
              localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
              
              // Zustand store 업데이트
              const { useAuthStore } = await import('../../features/auth/application/stores/auth.store');
              useAuthStore.getState().refreshTokens(response.accessToken, response.refreshToken);
              
              // 원래 요청 재시도
              originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // 리프레시 실패 시 로그아웃
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_INFO);
            
            const { useAuthStore } = await import('../../features/auth/application/stores/auth.store');
            useAuthStore.getState().clearAuth();
          }
        }
        
        // 에러를 구조화된 형태로 변환
        const appError = ErrorHandler.handleApiError(error);
        return Promise.reject(appError);
      },
    );
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<ApiResponse<T>>(url, config);
    return this.extractData<T>(response.data);
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<ApiResponse<T>>(url, data, config);
    return this.extractData<T>(response.data);
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<ApiResponse<T>>(url, data, config);
    return this.extractData<T>(response.data);
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<ApiResponse<T>>(url, data, config);
    return this.extractData<T>(response.data);
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<ApiResponse<T>>(url, config);
    return this.extractData<T>(response.data);
  }

  private extractData<T>(responseData: ApiResponse<T>): T {
    if (responseData.data !== undefined) {
      return responseData.data;
    }
    return responseData as unknown as T;
  }
}

export const apiService = new ApiService();
