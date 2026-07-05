import { apiClient } from '../apiClient';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type { UserData } from '../../types/app';
import type { UpdateUserResponse } from '../../types/user/updateUser/UpdateUser';

interface UserDataCache {
  byId: Map<string, { fetchedAt: number; user: UserData }>;
}

export const updateUserFactory =
  (cache: UserDataCache) =>
  async (user: Partial<UserData>): Promise<UserData> => {
    try {
      if (!user.id) {
        throw new Error('Missing user id');
      }

      const { data: updatedUser } = await apiClient.put<UpdateUserResponse>(
        `/user/${user.id}`,
        user,
      );
      cache.byId.set(user.id, {
        user: updatedUser,
        fetchedAt: Date.now(),
      });

      return updatedUser;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update user'));
    }
  };
