import { apiClient } from '@/store/apiClient';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';
import { useSubscriptionStore } from '@/domains/subscription/stores/subscriptionStore';
import { useUserStore } from '@/domains/user/stores/userStore';

import type { Subscriber } from '@/types/subscription';

interface SubscriberCache {
  byUserId: Map<string, { fetchedAt: number; subscriber: Subscriber }>;
}

export const updateSubscriberFactory =
  (cache: SubscriberCache) =>
  async (subscriber: Partial<Subscriber> = {}): Promise<Subscriber> => {
    try {
      const subscriberId = useSubscriptionStore.getState().subscriberId;

      if (!subscriberId) {
        throw new Error('No subscriber id supplied');
      }

      const { data: updatedSubscriber } = await apiClient.patch<Subscriber>(
        `/subscriber/${subscriberId}`,
        subscriber,
      );
      const userId =
        updatedSubscriber?.userId || useUserStore.getState().getUserData()?.id;

      if (userId) {
        cache.byUserId.set(userId, {
          subscriber: updatedSubscriber,
          fetchedAt: Date.now(),
        });
      }

      return updatedSubscriber;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update subscriber'));
    }
  };
