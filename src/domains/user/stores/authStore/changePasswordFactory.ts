import { apiClient } from '@/store/apiClient';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { StoreSet } from '@/store/_shared/createStoreActions';
import type { AuthStore } from '@/domains/user/stores/authStore';

export const changePasswordFactory =
  (set: StoreSet<AuthStore>) =>
  async (userId: string, password: string, url: string) => {
    set({ changePasswordStatus: 'loading', changePasswordError: undefined });

    try {
      const { data } = await apiClient.post('/user/storePassword', {
        userid: userId,
        password,
        url,
      });
      set({ changePasswordStatus: 'succeeded' });
      return data;
    } catch (error: any) {
      const message = getApiErrorMessage(
        error,
        'Unable to contact server. Try in a moment',
      );
      set({ changePasswordStatus: 'failed', changePasswordError: message });
      throw error?.response?.data || { message };
    }
  };
