import { apiClient } from '../apiClient';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type {
  CreateMercadoPagoPreferenceRequest,
  CreateMercadoPagoPreferenceResponse,
} from '../../types/payments/createMercadoPagoPreference/CreateMercadoPagoPreference';
import type { StoreSet } from '../_shared/createStoreActions';
import type { PaymentsStore } from '../paymentsStore';

export const createMercadoPagoPreferenceFactory =
  (set: StoreSet<PaymentsStore>) =>
  async (payload: CreateMercadoPagoPreferenceRequest): Promise<string> => {
    set({ isLoading: true, error: null });

    try {
      const { data } =
        await apiClient.post<CreateMercadoPagoPreferenceResponse>(
          '/create-payment',
          payload,
        );
      set({ mercadoPagoPreferenceId: data.id, isLoading: false });
      return data.id;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unexpected payment error');
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  };
