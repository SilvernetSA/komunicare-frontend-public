import { apiClient } from '@/store/apiClient';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

export const confirmMercadoPagoSubscriptionFactory =
  () =>
  async (providerSubscriptionId: string): Promise<Record<string, unknown>> => {
    try {
      if (!providerSubscriptionId)
        throw new Error('Missing provider subscription id');
      const { data } = await apiClient.post<Record<string, unknown>>(
        `/subscription/mercadopago/confirm/${providerSubscriptionId}`,
      );
      return data;
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unexpected subscription error',
      );
      console.error('Failed to confirm Mercado Pago subscription', message);
      throw new Error(message);
    }
  };
