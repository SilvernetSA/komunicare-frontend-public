import { getApiErrorMessage } from '../helpers/getApiErrorMessage';
import { useSubscriptionStore } from '../subscriptionStore';

import type { CreateSubscriptionResponse } from '../../types/subscription';
import type { StoreSet } from '../_shared/createStoreActions';
import type { PaymentsStore } from '../paymentsStore';

export const startPayPalCheckoutFactory =
  (set: StoreSet<PaymentsStore>) =>
  async ({
    planId,
    email,
  }: {
    planId: string;
    email: string;
  }): Promise<CreateSubscriptionResponse> => {
    set({ isLoading: true, error: null });

    try {
      const response = await useSubscriptionStore
        .getState()
        .createSubscriptionCheckout({
          planId,
          provider: 'paypal',
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
