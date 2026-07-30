import { useAppStore } from '@/domains/app/stores/appStore';
import { updateIsSubscribedAction } from './updateIsSubscribed';

import type { SubscriptionState } from './types';

export const SUBSCRIPTION_CACHE_TTL_MS = 60 * 1000;

interface UpdateIsSubscribedCache {
  inFlight: Promise<boolean> | null;
  inFlightUserId: string;
}

export const updateIsSubscribedFactory =
  (
    cache: UpdateIsSubscribedCache,
    getState: () => {
      lastSubscriptionUserId: string;
      lastUpdated: number;
      isSubscribed: boolean;
    },
    updateSubscription: (patch: Partial<SubscriptionState>) => void,
  ) =>
  async (
    requestOrigin = 'unknown',
    options: { force?: boolean; silent?: boolean } = {},
  ): Promise<boolean> => {
    const { force = false, silent = false } = options;
    const state = getState();
    const userData = useAppStore.getState().userData as any;
    const userId = userData?.id || '';

    if (userData?.isByBackOffice) {
      updateSubscription({
        status: 'active',
        isSubscribed: true,
        tryPeriode: false,
        isOnTrialPeriod: false,
        premiumRequiredModalState: {
          open: false,
          showTryPeriodFinishedMessages: false,
        },
      } as any);
      return true;
    }

    const now = Date.now();
    const isSameUser =
      !state.lastSubscriptionUserId ||
      state.lastSubscriptionUserId === String(userId);
    const cacheAge = now - state.lastUpdated;

    const canUseCache =
      !force &&
      Boolean(userId) &&
      isSameUser &&
      state.lastUpdated > 0 &&
      cacheAge < SUBSCRIPTION_CACHE_TTL_MS;

    if (canUseCache) return Boolean(state.isSubscribed);

    if (cache.inFlight && cache.inFlightUserId === String(userId || '')) {
      return cache.inFlight;
    }

    const requestPromise = (async (): Promise<boolean> => {
      const result = await updateIsSubscribedAction({
        requestOrigin,
        state: getState() as any,
        updateSubscription: (patch) =>
          updateSubscription(patch as Partial<SubscriptionState>),
        silent,
      });

      updateSubscription({
        lastUpdated: Date.now(),
        lastSubscriptionUserId: String(userId || ''),
      } as Partial<SubscriptionState>);

      return result;
    })();

    cache.inFlight = requestPromise;
    cache.inFlightUserId = String(userId || '');
    try {
      return await requestPromise;
    } finally {
      if (cache.inFlight === requestPromise) {
        cache.inFlight = null;
        cache.inFlightUserId = '';
      }
    }
  };
