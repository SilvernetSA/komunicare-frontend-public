import { apiClient } from '@/store/apiClient';
import { resetCommunicatorsFetchCache } from './fetchMyCommunicatorsFactory';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { CommunicatorsStore } from '../communicatorsStore';

const defaultCommunicatorID = 'komunicare_default';

export const deleteRemoteCommunicatorFactory =
  (get: () => CommunicatorsStore, set: (patch: any) => void) =>
  async (communicatorId: string): Promise<void> => {
    get().setApiStarted();
    try {
      await apiClient.delete(`/communicator/${communicatorId}`);
      resetCommunicatorsFetchCache();
      set((state: CommunicatorsStore) => ({
        isFetching: false,
        communicators: state.communicators.filter(
          (c) => c.id !== communicatorId,
        ),
        activeCommunicatorId:
          state.activeCommunicatorId === communicatorId
            ? state.communicators.find((c) => c.id !== communicatorId)?.id ||
              defaultCommunicatorID
            : state.activeCommunicatorId,
      }));
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unexpected communicator API error',
      );
      get().setApiFailure();
      throw new Error(message);
    }
  };
