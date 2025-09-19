import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, STORAGE_KEYS } from '@crypto-exchange/shared';
import { usePermissionStore } from './permission.store';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  refreshTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        set({ accessToken: token });
      },

      setRefreshToken: (token: string) => {
        set({ refreshToken: token });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      login: (user: User, accessToken: string, refreshToken: string) => {
        // 로그아웃 플래그 제거
        localStorage.removeItem(STORAGE_KEYS.AUTH_LOGGED_OUT);
        
        // localStorage에 토큰 저장
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
        
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });

        // 로그인 후 권한 초기화
        console.log('🔐 User logged in, initializing permissions...');
        usePermissionStore.getState().fetchMyPermissions();
      },

      refreshTokens: (accessToken: string, refreshToken: string) => {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        
        set({
          accessToken,
          refreshToken,
        });
      },

      logout: async () => {
        console.log('🚪 Logging out user...');
        
        try {
          // 서버에 로그아웃 요청
          await authService.logout();
        } catch (error) {
          console.warn('⚠️ Server logout failed, continuing with client logout:', error);
        }
        
        // 로그아웃 플래그 설정 (개발 환경에서 자동 로그인 방지)
        localStorage.setItem(STORAGE_KEYS.AUTH_LOGGED_OUT, 'true');
        
        // localStorage 완전 정리
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_INFO);
        
        // Zustand persist 스토어도 정리
        localStorage.removeItem(STORAGE_KEYS.AUTH_STORAGE);
        localStorage.removeItem(STORAGE_KEYS.PERMISSION_STORAGE);
        
        // 상태 초기화
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
        
        // 권한 store도 초기화
        usePermissionStore.getState().reset();
        
        console.log('✅ Logout completed, all data cleared');
        
        // 페이지 새로고침으로 완전한 상태 초기화
        window.location.href = '/login';
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
        
        // 권한 store도 초기화
        usePermissionStore.getState().reset();
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // 저장된 데이터가 복원된 후 로딩 상태를 false로 설정
        if (state) {
          state.isLoading = false;
          // 토큰이 있으면 인증 상태로 설정
          if (state.accessToken && state.user) {
            state.isAuthenticated = true;
            console.log('✅ Auth state restored from storage:', {
              user: state.user?.email,
              hasToken: !!state.accessToken,
              isAuthenticated: state.isAuthenticated
            });
          } else {
            console.log('⚠️ No auth data found in storage');
            // 운영 환경에서는 인증되지 않은 상태로 유지
            state.isAuthenticated = false;
            state.isLoading = false;
          }
        }
      },
    },
  ),
);
