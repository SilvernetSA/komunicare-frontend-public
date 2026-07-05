import { apiClient } from '../apiClient';
import { useAppStore } from '../appStore';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type { UserData } from '../../types/app';

interface UserDataCache {
  byId: Map<string, { fetchedAt: number; user: UserData }>;
  inFlight: Map<string, Promise<UserData>>;
}

export const deleteAccountFactory = (cache: UserDataCache) => async () => {
  try {
    const userData = useAppStore.getState().userData as any;
    const id = userData?.id;

    if (!id) {
      throw new Error('No user id supplied');
    }

    await apiClient.delete(`/account/${id}`);
    cache.byId.delete(id);
    cache.inFlight.delete(id);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete account'));
  }
};
