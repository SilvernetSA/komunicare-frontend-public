import { apiClient } from '@/store/apiClient';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
} from '@/types/subscription';

export const createSubscriptionCheckoutFactory =
  () =>
  async (
    payload: CreateSubscriptionRequest,
  ): Promise<CreateSubscriptionResponse> => {
    try {
      const { data } = await apiClient.post<CreateSubscriptionResponse>(
        '/subscription',
        payload,
      );
      const remoteError =
        (data as any)?.error?.message || (data as any)?.message;
      if (remoteError) throw new Error(remoteError);
      return data;
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unexpected subscription error',
      );
      console.error('Failed to create subscription checkout', message);
      throw new Error(message);
    }
  };
