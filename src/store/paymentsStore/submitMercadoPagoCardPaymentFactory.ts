import { getApiErrorMessage } from '../helpers/getApiErrorMessage';
import { useSubscriptionStore } from '../subscriptionStore';

import type { CreateSubscriptionResponse } from '../../types/subscription';
import type { StoreSet } from '../_shared/createStoreActions';
import type { PaymentsStore } from '../paymentsStore';

export const submitMercadoPagoCardPaymentFactory =
  (set: StoreSet<PaymentsStore>) =>
  async ({
    cardTokenId,
    planId,
    email,
  }: {
    cardTokenId: string;
    planId: string;
    email: string;
  }): Promise<CreateSubscriptionResponse> => {
    set({ isLoading: true, error: null });

    try {
      const response = await useSubscriptionStore
        .getState()
        .createSubscriptionCheckout({
          cardTokenId,
          planId,
          provider: 'mercadopago',
          email,
        });
      set({ isLoading: false });
      return response;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unexpected payment error');
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  };
