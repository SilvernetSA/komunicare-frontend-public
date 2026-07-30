import { apiClient } from '@/store/apiClient';
import { useAppStore } from '@/domains/app/stores/appStore';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { Communicator } from '@/types/communicator';
import type { CommunicatorsStore } from '../communicatorsStore';

interface CreateRemoteCommunicatorCache {
  inFlight: Promise<Communicator> | null;
}

const toCreateCommunicatorError = (error: unknown) => {
  const apiError = new Error(getApiErrorMessage(error)) as Error & {
    response?: { status?: number; data?: Record<string, unknown> };
  };
  if (typeof error === 'object' && error && 'response' in error) {
    (apiError as any).response = (error as any).response;
  }
  return apiError;
};

const getExistingConflictId = (error: unknown): string | null => {
  if (typeof error !== 'object' || !error || !('response' in error))
    return null;
  const response = (error as any).response;
  if (response?.status !== 409) return null;
  return typeof response.data?.existingCommunicatorId === 'string'
    ? response.data.existingCommunicatorId
    : null;
};

export const createRemoteCommunicatorFactory =
  (cache: CreateRemoteCommunicatorCache, get: () => CommunicatorsStore) =>
  async ({
    communicator,
    tempId,
  }: {
    communicator: Communicator;
    tempId: string;
  }): Promise<Communicator> => {
    get().setApiStarted();

    const postCommunicator = async (): Promise<Communicator> => {
      if (cache.inFlight) return cache.inFlight;

      cache.inFlight = (async () => {
        try {
          const { name, email } = useAppStore.getState().userData as any;
          const body = {
            ...communicator,
            boards: communicator.boards || [],
            isPublic: false,
          } as any;
          delete body.id;
          body.email = email;
          body.author = name;
          const response = await apiClient.post<any>('/communicator', body);
          return (response.data?.communicator ?? response.data) as Communicator;
        } catch (error) {
          throw toCreateCommunicatorError(error);
        } finally {
          cache.inFlight = null;
        }
      })();

      return cache.inFlight;
    };

    try {
      const created = await postCommunicator();
      get().createApiCommunicatorSuccess({
        communicator: created,
        communicatorId: tempId,
      });
      return created;
    } catch (error) {
      const existingId = getExistingConflictId(error);

      if (existingId) {
        try {
          await get().fetchMyCommunicators({ force: true });
          const existing = get().communicators.find((c) => c.id === existingId);
          if (existing) {
            get().changeCommunicator(existingId);
            return existing;
          }
        } catch {
          // keep original error
        }
        get().setApiFailure();
        throw new Error(
          `Communicator copy conflict references missing communicator ${existingId}. Backend data may be inconsistent and may require DB cleanup.`,
        );
      }

      const message = getApiErrorMessage(
        error,
        'Unexpected communicator API error',
      );
      get().setApiFailure();
      throw new Error(message);
    }
  };
