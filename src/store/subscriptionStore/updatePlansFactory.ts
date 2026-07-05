import { apiClient } from '../apiClient';
import { enhancePlans } from './enhancePlans';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type { Product } from '../../types/subscription';

export const PLANS_CACHE_TTL_MS = 60 * 1000;

interface PlansCache {
  inFlight: Promise<void> | null;
  updatedAt: number;
  plans: Product[];
}

export const updatePlansFactory =
  (
    cache: PlansCache,
    updateSubscription: (patch: { products: Product[] }) => void,
  ) =>
  async (options: { force?: boolean } = {}): Promise<void> => {
    const { force = false } = options;
    const cacheAge = Date.now() - cache.updatedAt;
    const canUseCache =
      !force && cache.updatedAt > 0 && cacheAge < PLANS_CACHE_TTL_MS;

    if (canUseCache) {
      if (cache.plans.length) updateSubscription({ products: cache.plans });
      return;
    }

    if (cache.inFlight) return await cache.inFlight;

    const requestPromise = (async (): Promise<void> => {
      try {
        const { data } = await apiClient.get<any>('/plans');
        const plans = enhancePlans(data?.plans || data);
        cache.plans = plans;
        cache.updatedAt = Date.now();
        updateSubscription({ products: plans });
      } catch (error) {
        console.error(
          'Failed to update subscription plans',
          getApiErrorMessage(error, 'Unexpected subscription error'),
        );
      }
    })();

    cache.inFlight = requestPromise;
    try {
      await requestPromise;
    } finally {
      if (cache.inFlight === requestPromise) cache.inFlight = null;
    }
  };
