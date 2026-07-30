import { initMercadoPago } from '@mercadopago/sdk-react';
import { create } from 'zustand';

import { MERCADOPAGO_PUBLIC_KEY } from '@/constants';
import { createMercadoPagoPreferenceFactory } from './paymentsStore/createMercadoPagoPreferenceFactory';
import { startPayPalCheckoutFactory } from './paymentsStore/startPayPalCheckoutFactory';
import { submitMercadoPagoCardPaymentFactory } from './paymentsStore/submitMercadoPagoCardPaymentFactory';

import type { CreateMercadoPagoPreferenceRequest } from '@/types/payments/createMercadoPagoPreference/CreateMercadoPagoPreference';
import type { CreateSubscriptionResponse } from '@/types/subscription';

interface PaymentsStoreState {
  mercadoPagoPreferenceId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialPaymentsState: PaymentsStoreState = {
  mercadoPagoPreferenceId: null,
  isLoading: false,
  error: null,
};

export interface PaymentsStore extends PaymentsStoreState {
  clearError: () => void;
  initMercadoPagoOnce: () => void;
  createMercadoPagoPreference: (
    payload: CreateMercadoPagoPreferenceRequest,
  ) => Promise<string>;
  startPayPalCheckout: (payload: {
    planId: string;
    email: string;
  }) => Promise<CreateSubscriptionResponse>;
  submitMercadoPagoCardPayment: (payload: {
    cardTokenId: string;
    planId: string;
    email: string;
  }) => Promise<CreateSubscriptionResponse>;
  applyLogout: () => void;
}

export const usePaymentsStore = create<PaymentsStore>()((set) => {
  const mercadoPagoRuntime = { initialized: false };

  return {
    ...initialPaymentsState,

    clearError: () => set({ error: null }),

    initMercadoPagoOnce: () => {
      if (mercadoPagoRuntime.initialized) {
        return;
      }

      initMercadoPago(MERCADOPAGO_PUBLIC_KEY);
      mercadoPagoRuntime.initialized = true;
    },

    createMercadoPagoPreference: createMercadoPagoPreferenceFactory(set),

    startPayPalCheckout: startPayPalCheckoutFactory(set),

    submitMercadoPagoCardPayment: submitMercadoPagoCardPaymentFactory(set),

    applyLogout: () => {
      set({ ...initialPaymentsState });
    },
  };
});
