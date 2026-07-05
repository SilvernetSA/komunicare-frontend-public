import { create } from 'zustand';

import { createSubscriberFactory } from './subscriberStore/createSubscriberFactory';
import { getSubscriberFactory } from './subscriberStore/getSubscriberFactory';
import { updateSubscriberFactory } from './subscriberStore/updateSubscriberFactory';

import type { Subscriber } from '../types/subscription';

const SUBSCRIBER_CACHE_TTL_MS = 60 * 1000;

export interface SubscriberStore {
  getSubscriber: (
    userId?: string,
    requestOrigin?: string,
  ) => Promise<Subscriber>;
  createSubscriber: (subscriber?: Subscriber) => Promise<Subscriber>;
  updateSubscriber: (subscriber?: Partial<Subscriber>) => Promise<Subscriber>;
}

export const useSubscriberStore = create<SubscriberStore>()(() => {
  const subscriberCache = {
    byUserId: new Map<string, { fetchedAt: number; subscriber: Subscriber }>(),
    inFlight: new Map<string, Promise<Subscriber>>(),
    ttlMs: SUBSCRIBER_CACHE_TTL_MS,
  };

  return {
    getSubscriber: getSubscriberFactory(subscriberCache),

    createSubscriber: createSubscriberFactory(subscriberCache),

    updateSubscriber: updateSubscriberFactory(subscriberCache),
  };
});
