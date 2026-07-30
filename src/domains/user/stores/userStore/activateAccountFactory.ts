import { apiClient } from '@/store/apiClient';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { ActivateAccountResponse } from '@/types/user/activateAccount/ActivateAccount';

export const activateAccountFactory =
  () =>
  async (url: string): Promise<ActivateAccountResponse> => {
    try {
      const { data } = await apiClient.post<ActivateAccountResponse>(
        `/user/activate/${url}`,
      );
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to activate account'));
    }
  };
