import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@crypto-exchange/shared';
import { STORAGE_KEYS } from '@crypto-exchange/shared';
import { usePermissionStore } from './permission.store';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string) => void;
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
      isAuthenticated: false,
      isLoading: true,

      // Actions
      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        set({ accessToken: token });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      login: (user: User, token: string) => {
        // localStorage에 토큰 저장
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
        
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        });

        // 로그인 후 권한 초기화
        console.log('🔐 User logged in, initializing permissions...');
        usePermissionStore.getState().fetchMyPermissions();
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_INFO);
        
        // 권한 store도 초기화
        usePermissionStore.getState().reset();
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
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
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // 저장된 데이터가 복원된 후 로딩 상태를 false로 설정
        if (state) {
          state.isLoading = false;
          // 토큰이 있으면 인증 상태로 설정
          if (state.accessToken && state.user) {
            state.isAuthenticated = true;
          }
        }
      },
    },
  ),
);
