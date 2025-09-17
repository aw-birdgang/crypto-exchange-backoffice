import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { STORAGE_KEYS, ApiResponse } from '@crypto-exchange/shared';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

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
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_INFO);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      },
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<ApiResponse<T>>(url, config);
    return (response.data as any).data || response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<ApiResponse<T>>(url, data, config);
    return (response.data as any).data || response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<ApiResponse<T>>(url, data, config);
    return (response.data as any).data || response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<ApiResponse<T>>(url, data, config);
    return (response.data as any).data || response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<ApiResponse<T>>(url, config);
    return (response.data as any).data || response.data;
  }
}

export const apiService = new ApiService();
