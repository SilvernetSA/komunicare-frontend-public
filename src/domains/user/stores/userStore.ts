import { create } from 'zustand';

import { useAppStore } from '@/domains/app/stores/appStore';
import { activateAccountFactory } from './userStore/activateAccountFactory';
import { deleteAccountFactory } from './userStore/deleteAccountFactory';
import { getUserDataByIdFactory } from './userStore/getUserDataByIdFactory';
import { resendVerificationFactory } from './userStore/resendVerificationFactory';
import { signUpFactory } from './userStore/signUpFactory';
import { updateUserFactory } from './userStore/updateUserFactory';

import type { UserData } from '@/types/app';
import type { ActivateAccountResponse } from '@/types/user/activateAccount/ActivateAccount';
import type { ResendVerificationResponse } from '@/types/user/resendVerification/ResendVerification';
import type {
  SignUpRequest,
  SignUpResponse,
} from '@/types/user/signUp/SignUp';

const USER_DATA_CACHE_TTL_MS = 60 * 1000;

export interface UserStore {
  getUserData: () => UserData;
  getUserDataById: (userId: string) => Promise<UserData>;
  updateUser: (user: Partial<UserData>) => Promise<UserData>;
  deleteAccount: () => Promise<void>;
  getAuthToken: () => string | null;
  signUp: (payload: SignUpRequest) => Promise<SignUpResponse>;
  activateAccount: (url: string) => Promise<ActivateAccountResponse>;
  resendVerification: (
    email: string,
    locale: string,
  ) => Promise<ResendVerificationResponse>;
}

export const useUserStore = create<UserStore>()(() => {
  const userDataCache = {
    byId: new Map<string, { fetchedAt: number; user: UserData }>(),
    inFlight: new Map<string, Promise<UserData>>(),
    ttlMs: USER_DATA_CACHE_TTL_MS,
  };

  return {
    getUserData: () => useAppStore.getState().userData as UserData,

    getUserDataById: getUserDataByIdFactory(userDataCache),

    updateUser: updateUserFactory(userDataCache),

    deleteAccount: deleteAccountFactory(userDataCache),

    getAuthToken: () => {
      const userData = useAppStore.getState().userData as any;
      return userData?.authToken || null;
    },

    signUp: signUpFactory(),

    activateAccount: activateAccountFactory(),

    resendVerification: resendVerificationFactory(),
  };
});
