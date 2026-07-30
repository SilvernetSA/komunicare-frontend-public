import { apiClient } from '@/store/apiClient';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { UserData } from '@/types/app';
import type { GetUserDataByIdResponse } from '@/types/user/getUserDataById/GetUserDataById';

interface UserDataCache {
  byId: Map<string, { fetchedAt: number; user: UserData }>;
  inFlight: Map<string, Promise<UserData>>;
  ttlMs: number;
}

export const getUserDataByIdFactory =
  (cache: UserDataCache) =>
  async (userId: string): Promise<UserData> => {
    const cachedEntry = cache.byId.get(userId);
    const canUseCache =
      cachedEntry && Date.now() - cachedEntry.fetchedAt < cache.ttlMs;

    if (canUseCache) {
      return cachedEntry.user;
    }

    const inFlightRequest = cache.inFlight.get(userId);
    if (inFlightRequest) {
      return await inFlightRequest;
    }

    const requestPromise = (async (): Promise<UserData> => {
      try {
        const { data } = await apiClient.get<GetUserDataByIdResponse>(
          `/user/${userId}`,
        );
        cache.byId.set(userId, {
          user: data,
          fetchedAt: Date.now(),
        });
        return data;
      } finally {
        cache.inFlight.delete(userId);
      }
    })();

    cache.inFlight.set(userId, requestPromise);

    try {
      return await requestPromise;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch user data'));
    }
  };
