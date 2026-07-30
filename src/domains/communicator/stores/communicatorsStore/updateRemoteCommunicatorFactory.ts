import { apiClient } from '@/store/apiClient';
import { useAppStore } from '@/domains/app/stores/appStore';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { Communicator } from '@/types/communicator';
import type { CommunicatorsStore } from '../communicatorsStore';

const LOCAL_COMMUNICATOR_ID = 'komunicare_default';

export const updateRemoteCommunicatorFactory =
  (get: () => CommunicatorsStore) =>
  async (communicator: Communicator): Promise<Communicator> => {
    get().setApiStarted();
    try {
      const payload = {
        ...communicator,
        boards: communicator.boards || [],
      } as Communicator;
      const needsCreate =
        !communicator.id ||
        communicator.id === LOCAL_COMMUNICATOR_ID ||
        communicator.id.length < 14;

      if (needsCreate) {
        const { name, email } = useAppStore.getState().userData as any;
        const body = { ...payload } as any;
        delete body.id;
        body.email = email;
        body.author = name;
        const response = await apiClient.post<any>('/communicator', body);
        const created = (response.data?.communicator ??
          response.data) as Communicator;
        get().updateApiCommunicatorSuccess();
        return created;
      }

      const { data } = await apiClient.put<Communicator>(
        `/communicator/${communicator.id}`,
        payload,
      );
      get().updateApiCommunicatorSuccess();
      return data;
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unexpected communicator API error',
      );
      get().setApiFailure();
      throw new Error(message);
    }
  };
