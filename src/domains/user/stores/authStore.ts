import { create } from 'zustand';

import { setAuthTokenProvider, setUnauthorizedHandler } from '@/store/apiClient';
import { useAppStore } from '@/domains/app/stores/appStore';
import { changePasswordFactory } from './authStore/changePasswordFactory';
import { getUserDataFactory } from './authStore/getUserDataFactory';
import { getUserLocationFactory } from './authStore/getUserLocationFactory';
import { loginFactory } from './authStore/loginFactory';
import { logoutFactory } from './authStore/logoutFactory';
import { requestPasswordResetFactory } from './authStore/requestPasswordResetFactory';

import type { UserData } from '@/types/app';
import type { AuthState } from './authStore/types';
import type { LoginArgs, LoginPayload } from '@/types/auth';
import type { ChangePasswordResponse } from '@/types/auth/changePassword/ChangePassword';
import type { GetUserLocationResponse } from '@/types/auth/getUserLocation/GetUserLocation';
import type { RequestPasswordResetResponse } from '@/types/auth/requestPasswordReset/RequestPasswordReset';

const USER_LOCATION_CACHE_TTL_MS = 5 * 60 * 1000;
const AUTH_USER_DATA_CACHE_TTL_MS = 60 * 1000;

const initialAuthState: AuthState = {
  loginStatus: 'idle',
  resetStatus: 'idle',
  changePasswordStatus: 'idle',
};

export interface AuthStore extends AuthState {
  clearLoginError: () => void;
  clearResetStatus: () => void;
  clearChangePasswordStatus: () => void;
  login: (args: LoginArgs) => Promise<LoginPayload>;
  logout: () => Promise<void>;
  requestPasswordReset: (
    email: string,
  ) => Promise<RequestPasswordResetResponse>;
  changePassword: (
    userId: string,
    password: string,
    url: string,
  ) => Promise<ChangePasswordResponse>;
  getUserLocation: () => Promise<GetUserLocationResponse>;
  getUserData: (userId: string) => Promise<UserData>;
}

export const useAuthStore = create<AuthStore>()((set, get) => {
  const userLocationCache = {
    fetchedAt: 0,
    inFlight: null as Promise<GetUserLocationResponse> | null,
    ttlMs: USER_LOCATION_CACHE_TTL_MS,
    value: null as GetUserLocationResponse | null,
  };

  const authUserDataCache = {
    byId: new Map<string, { fetchedAt: number; user: UserData }>(),
    inFlight: new Map<string, Promise<UserData>>(),
    ttlMs: AUTH_USER_DATA_CACHE_TTL_MS,
  };

  const clearAuthUserDataCache = () => {
    authUserDataCache.byId.clear();
    authUserDataCache.inFlight.clear();
  };

  return {
    ...initialAuthState,

    clearLoginError: () => {
      set({ loginStatus: 'idle', loginError: undefined });
    },

    clearResetStatus: () => {
      set({ resetStatus: 'idle', resetError: undefined });
    },

    clearChangePasswordStatus: () => {
      set({
        changePasswordStatus: 'idle',
        changePasswordError: undefined,
      });
    },

    login: loginFactory(set),

    logout: logoutFactory(
      { clearAuthUserDataCache, initialAuthState },
      set,
      get,
    ),

    requestPasswordReset: requestPasswordResetFactory(set),

    changePassword: changePasswordFactory(set),

    getUserLocation: getUserLocationFactory(userLocationCache),

    getUserData: getUserDataFactory(authUserDataCache),
  };
});

setUnauthorizedHandler(() => {
  void useAuthStore.getState().logout();
});

setAuthTokenProvider(() => {
  const userData = useAppStore.getState().userData as any;
  return userData?.authToken || null;
});

export type { AuthError, AuthState, LoginPayload } from '@/types/auth';
