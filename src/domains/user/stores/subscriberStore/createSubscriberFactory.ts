import { apiClient } from '@/store/apiClient';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { Subscriber } from '@/types/subscription';

interface SubscriberCache {
  byUserId: Map<string, { fetchedAt: number; subscriber: Subscriber }>;
}

export const createSubscriberFactory =
  (cache: SubscriberCache) =>
  async (
    subscriber = { userId: '', status: 'active' } as Subscriber,
  ): Promise<Subscriber> => {
    try {
      const { data: createdSubscriber } = await apiClient.post<Subscriber>(
        '/subscriber',
        subscriber,
      );

      if (createdSubscriber?.userId) {
        cache.byUserId.set(createdSubscriber.userId, {
          subscriber: createdSubscriber,
          fetchedAt: Date.now(),
        });
      }

      return createdSubscriber;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create subscriber'));
    }
  };
