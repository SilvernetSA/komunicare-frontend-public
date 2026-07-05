import { apiClient } from '../apiClient';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type {
  RequestPasswordResetRequest,
  RequestPasswordResetResponse,
} from '../../types/auth/requestPasswordReset/RequestPasswordReset';
import type { StoreSet } from '../_shared/createStoreActions';
import type { AuthStore } from '../authStore';

export const requestPasswordResetFactory =
  (set: StoreSet<AuthStore>) => async (email: string) => {
    set({ resetStatus: 'loading', resetError: undefined });

    try {
      const payload: RequestPasswordResetRequest = { email };
      const { data } = await apiClient.post<RequestPasswordResetResponse>(
        '/user/forgot',
        payload,
      );
      set({ resetStatus: 'succeeded' });
      return data;
    } catch (error: any) {
      const message = getApiErrorMessage(
        error,
        'Unable to contact server. Try in a moment',
      );
      set({ resetStatus: 'failed', resetError: message });
      throw error?.response?.data || { message };
    }
  };
