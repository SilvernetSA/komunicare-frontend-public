import { apiClient } from '../apiClient';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

export const confirmPaypalSubscriptionFactory =
  () =>
  async (providerSubscriptionId: string): Promise<Record<string, unknown>> => {
    try {
      if (!providerSubscriptionId)
        throw new Error('Missing provider subscription id');
      const { data } = await apiClient.post<Record<string, unknown>>(
        `/subscription/paypal/confirm/${providerSubscriptionId}`,
      );
      return data;
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unexpected subscription error',
      );
      console.error('Failed to confirm PayPal subscription', message);
      throw new Error(message);
    }
  };
