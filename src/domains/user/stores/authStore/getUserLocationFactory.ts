import { apiClient } from '@/store/apiClient';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { GetUserLocationResponse } from '@/types/auth/getUserLocation/GetUserLocation';

interface UserLocationCache {
  fetchedAt: number;
  inFlight: Promise<GetUserLocationResponse> | null;
  ttlMs: number;
  value: GetUserLocationResponse | null;
}

export const getUserLocationFactory =
  (cache: UserLocationCache) => async (): Promise<GetUserLocationResponse> => {
    const canUseCache =
      cache.value &&
      cache.fetchedAt > 0 &&
      Date.now() - cache.fetchedAt < cache.ttlMs;

    if (canUseCache) {
      return cache.value as GetUserLocationResponse;
    }

    if (cache.inFlight) {
      return await cache.inFlight;
    }

    const requestPromise = (async (): Promise<GetUserLocationResponse> => {
      try {
        const { data } =
          await apiClient.get<GetUserLocationResponse>('/location');
        cache.value = data;
        cache.fetchedAt = Date.now();
        return data;
      } finally {
        cache.inFlight = null;
      }
    })();

    cache.inFlight = requestPromise;

    try {
      return await requestPromise;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Unable to contact server. Try in a moment'),
      );
    }
  };
