import { create } from 'zustand';

import { applyLoginSuccess } from './subscriptionStore/applyLoginSuccess';
import { cancelSubscriptionPlanFactory } from './subscriptionStore/cancelSubscriptionPlanFactory';
import { confirmMercadoPagoSubscriptionFactory } from './subscriptionStore/confirmMercadoPagoSubscriptionFactory';
import { confirmPaypalSubscriptionFactory } from './subscriptionStore/confirmPaypalSubscriptionFactory';
import { createSubscriptionCheckoutFactory } from './subscriptionStore/createSubscriptionCheckoutFactory';
import { fetchSubscriptionsListFactory } from './subscriptionStore/fetchSubscriptionsListFactory';
import { postTransactionFactory } from './subscriptionStore/postTransactionFactory';
import { updateIsSubscribedFactory } from './subscriptionStore/updateIsSubscribedFactory';
import { updatePlansFactory } from './subscriptionStore/updatePlansFactory';
import { NOT_SUBSCRIBED } from '@/providers/SubscriptionProvider/SubscriptionProvider.constants';

import type { SubscriptionState } from './subscriptionStore/types';
import type {
  Product,
  Subscription,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  Transaction,
  TransactionResponse,
} from '@/types/subscription';

interface SubscriptionStoreState {
  subscriberId: string;
  androidSubscriptionState: string;
  status: string;
  isSubscribed: boolean;
  expiryDate: string | null;
  lastUpdated: number;
  lastSubscriptionUserId: string;
  error: {
    isError: boolean;
    showError: boolean;
    code: string;
    message: string;
  };
  isInFreeCountry: boolean;
  isOnTrialPeriod: boolean;
  premiumRequiredModalState: {
    open: boolean;
    showTryPeriodFinishedMessages: boolean;
  };
  ownedProduct: unknown;
  products: Product[];
  tryPeriode: boolean;
  trialRemainingModalOpen: boolean;
}

const initialSubscriptionState: SubscriptionStoreState = {
  subscriberId: '',
  androidSubscriptionState: NOT_SUBSCRIBED,
  status: NOT_SUBSCRIBED,
  isSubscribed: false,
  expiryDate: null,
  lastUpdated: 0,
  lastSubscriptionUserId: '',
  error: {
    isError: false,
    showError: false,
    code: '',
    message: '',
  },
  isInFreeCountry: false,
  isOnTrialPeriod: false,
  premiumRequiredModalState: {
    open: false,
    showTryPeriodFinishedMessages: false,
  },
  ownedProduct: '',
  products: [
    {
      id: '',
      name: '',
      currency: '',
      price: 0,
      provider: '',
    },
  ],
  tryPeriode: false,
  trialRemainingModalOpen: false,
};

export interface SubscriptionStore extends SubscriptionStoreState {
  updateSubscriberId: (id: string) => void;
  updateSubscription: (patch: Partial<SubscriptionState>) => void;
  updateSubscriptionError: (payload: {
    showError?: boolean;
    code?: string;
    message?: string;
  }) => void;
  showPremiumRequired: (payload: {
    showTryPeriodFinishedMessages?: boolean;
  }) => void;
  hidePremiumRequired: () => void;
  closeTrialRemainingModal: () => void;
  updateIsSubscribed: (
    requestOrigin?: string,
    options?: { force?: boolean; silent?: boolean },
  ) => Promise<boolean>;
  fetchSubscriptionsList: () => Promise<Subscription[]>;
  cancelSubscriptionPlan: () => Promise<void>;
  createSubscriptionCheckout: (
    payload: CreateSubscriptionRequest,
  ) => Promise<CreateSubscriptionResponse>;
  confirmPaypalSubscription: (
    providerSubscriptionId: string,
  ) => Promise<Record<string, unknown>>;
  confirmMercadoPagoSubscription: (
    providerSubscriptionId: string,
  ) => Promise<Record<string, unknown>>;
  postTransaction: (transaction: Transaction) => Promise<TransactionResponse>;
  updatePlans: (options?: { force?: boolean }) => Promise<void>;
  applyLoginSuccess: (payload: unknown) => void;
  applyLogout: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>()((set, get) => {
  const subscriptionCache = {
    inFlight: null as Promise<boolean> | null,
    inFlightUserId: '',
  };

  const plansCache = {
    inFlight: null as Promise<void> | null,
    updatedAt: 0,
    plans: [] as Product[],
  };

  return {
    ...initialSubscriptionState,

    // ── Simple inline actions ──────────────────────────────────────────────────

    updateSubscriberId: (id) => set({ subscriberId: id }),

    updateSubscription: (patch) => set(patch as Partial<SubscriptionStore>),

    updateSubscriptionError: (payload) => {
      set((state: SubscriptionStore) => ({
        error: {
          ...state.error,
          showError: payload.showError ?? state.error.showError,
          code: payload.code ?? state.error.code,
          message: payload.message ?? state.error.message,
        },
      }));
    },

    showPremiumRequired: (payload) => {
      set({
        premiumRequiredModalState: {
          open: true,
          showTryPeriodFinishedMessages:
            payload.showTryPeriodFinishedMessages || false,
        },
      });
    },

    hidePremiumRequired: () => {
      set((state: SubscriptionStore) => ({
        premiumRequiredModalState: {
          open: false,
          showTryPeriodFinishedMessages:
            state.premiumRequiredModalState.showTryPeriodFinishedMessages,
        },
      }));
    },

    closeTrialRemainingModal: () => set({ trialRemainingModalOpen: false }),

    // ── Delegated async actions ────────────────────────────────────────────────

    updateIsSubscribed: updateIsSubscribedFactory(
      subscriptionCache,
      () => get(),
      (patch) => get().updateSubscription(patch),
    ),

    fetchSubscriptionsList: fetchSubscriptionsListFactory(),

    cancelSubscriptionPlan: cancelSubscriptionPlanFactory(),

    createSubscriptionCheckout: createSubscriptionCheckoutFactory(),

    confirmPaypalSubscription: confirmPaypalSubscriptionFactory(),

    confirmMercadoPagoSubscription: confirmMercadoPagoSubscriptionFactory(),

    postTransaction: postTransactionFactory(() => get().subscriberId),

    updatePlans: updatePlansFactory(plansCache, (patch) =>
      get().updateSubscription(patch as any),
    ),

    applyLoginSuccess: (payload) => set(applyLoginSuccess(payload) as any),

    applyLogout: () => {
      subscriptionCache.inFlight = null;
      subscriptionCache.inFlightUserId = '';
      plansCache.inFlight = null;
      plansCache.updatedAt = 0;
      plansCache.plans = [];
      set({ ...initialSubscriptionState });
    },
  };
});
