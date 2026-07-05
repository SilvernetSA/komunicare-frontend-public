import { apiClient } from '../apiClient';
import { useAppStore } from '../appStore';

import type { UserData } from '../../types/app';
import type { LoginPayload } from '../../types/auth';

interface LoginPayloadForFirstLogin extends Record<string, unknown> {
  id: string;
  isFirstLogin?: boolean;
}

export const handleFirstLoginAction = async (
  loginData: LoginPayload,
): Promise<void> => {
  try {
    if (loginData.id) {
      await apiClient.put<UserData>(
        `/user/${(loginData as LoginPayloadForFirstLogin).id}`,
        {
          ...(loginData as LoginPayloadForFirstLogin),
          isFirstLogin: false,
        },
      );
    }
  } catch (_error) {
    console.error(_error);
  }
  useAppStore.getState().enableAllTours();
};
