import { apiService } from '../../../../shared/services/api.service';
import { API_ROUTES, User } from '@crypto-exchange/shared';

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
  user: User;
}

export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, credentials);
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>(API_ROUTES.AUTH.REGISTER, userData);
  }

  async refreshToken(): Promise<AuthResponse> {
    return apiService.post<AuthResponse>(API_ROUTES.AUTH.REFRESH);
  }
}

export const authService = new AuthService();
