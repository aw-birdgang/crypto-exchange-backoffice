import { apiService } from '../../../../shared/services/api.service';
import { API_ROUTES, AdminUser } from '@crypto-exchange/shared';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, credentials);
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>(API_ROUTES.AUTH.REGISTER, userData);
  }

  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    return apiService.post<RefreshResponse>(API_ROUTES.AUTH.REFRESH, { refreshToken });
  }

  async logout(): Promise<void> {
    try {
      await apiService.post(API_ROUTES.AUTH.LOGOUT);
      console.log('✅ Server logout successful');
    } catch (error) {
      console.warn('⚠️ Server logout failed, continuing with client logout:', error);
    }
  }
}

export const authService = new AuthService();
