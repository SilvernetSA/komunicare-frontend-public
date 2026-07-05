import { apiClient } from '../apiClient';
import { useAppStore } from '../appStore';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';
import { useUserStore } from '../userStore';

import type { Subscriber } from '../../types/subscription';

interface SubscriberCache {
  byUserId: Map<string, { fetchedAt: number; subscriber: Subscriber }>;
  inFlight: Map<string, Promise<Subscriber>>;
  ttlMs: number;
}

export const getSubscriberFactory =
  (cache: SubscriberCache) =>
  async (userId?: string, requestOrigin = 'unknown'): Promise<Subscriber> => {
    const id = userId || useUserStore.getState().getUserData()?.id;
    const cachedEntry = id ? cache.byUserId.get(id) : null;
    const canUseCache =
      cachedEntry && Date.now() - cachedEntry.fetchedAt < cache.ttlMs;

    if (cachedEntry && canUseCache) {
      return cachedEntry.subscriber;
    }

    const inFlightRequest = id ? cache.inFlight.get(id) : null;
    if (inFlightRequest) {
      return await inFlightRequest;
    }

    const requestPromise = (async (): Promise<Subscriber> => {
      if (!id) {
        throw new Error('No user id supplied');
      }

      try {
        const userData = useAppStore.getState().userData as any;
        let subscriber: Subscriber;
        if (userData?.isByBackOffice) {
          subscriber = {
            userId: id,
            status: 'active',
            isByBackOffice: true,
          } as any;
        } else {
          const { data } = await apiClient.get<Subscriber>(
            `/subscriber/${id}`,
            {
              headers: { requestOrigin },
            },
          );
          subscriber = data;
        }
        cache.byUserId.set(id, {
          subscriber,
          fetchedAt: Date.now(),
        });
        return subscriber;
      } finally {
        cache.inFlight.delete(id);
      }
    })();

    if (id) {
      cache.inFlight.set(id, requestPromise);
    }

    try {
      return await requestPromise;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch subscriber'));
    }
  };
