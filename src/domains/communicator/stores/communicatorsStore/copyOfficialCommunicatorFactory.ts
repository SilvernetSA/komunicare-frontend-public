import { resetCommunicatorsFetchCache } from './fetchMyCommunicatorsFactory';

import type { CommunicatorsStore } from '@/domains/communicator/stores/communicatorsStore';
import type { Communicator } from '@/types/communicator';

import { apiClient } from '@/store/apiClient';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';


const getExistingConflictId = (error: unknown): string | null => {
  if (typeof error !== 'object' || !error || !('response' in error)) {
    return null;
  }

  const response = (error as any).response;
  if (response?.status !== 409) {
    return null;
  }

  return typeof response.data?.existingCommunicatorId === 'string'
    ? response.data.existingCommunicatorId
    : null;
};

const getCommunicatorFromPayload = (payload: unknown): Communicator | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const responseData = payload as Record<string, unknown>;

  if (
    responseData.communicator &&
    typeof responseData.communicator === 'object' &&
    responseData.communicator
  ) {
    return responseData.communicator as Communicator;
  }

  if (
    responseData.data &&
    typeof responseData.data === 'object' &&
    responseData.data
  ) {
    return responseData.data as Communicator;
  }

  if ('id' in responseData && 'boards' in responseData) {
    return responseData as Communicator;
  }

  return null;
};

const findCopiedCommunicator = (
  communicators: Communicator[],
  sourceCommunicatorId: string,
  fallbackId?: string,
): Communicator | null => {
  if (fallbackId) {
    const byId = communicators.find(
      (communicator) => communicator.id === fallbackId,
    );
    if (byId) {
      return byId;
    }
  }

  for (let index = communicators.length - 1; index >= 0; index -= 1) {
    const communicator = communicators[index];
    if (
      String(communicator.copySourceCommunicatorId || '') ===
        sourceCommunicatorId ||
      String(communicator.copySource || '') === sourceCommunicatorId
    ) {
      return communicator;
    }
  }

  return null;
};

export const copyOfficialCommunicatorFactory =
  (get: () => CommunicatorsStore) =>
  async (sourceCommunicatorId: string): Promise<Communicator> => {
    get().setApiStarted();

    let createdCommunicator: Communicator | null = null;
    let existingCommunicatorId: string | null = null;

    try {
      const { data } = await apiClient.post(
        `/communicator/official/${sourceCommunicatorId}/copy`,
      );
      createdCommunicator = getCommunicatorFromPayload(data);
    } catch (error) {
      existingCommunicatorId = getExistingConflictId(error);
      if (!existingCommunicatorId) {
        const message = getApiErrorMessage(
          error,
          'Unexpected communicator API error',
        );
        get().setApiFailure();
        throw new Error(message);
      }
    }

    resetCommunicatorsFetchCache();

    try {
      const refreshedCommunicators = await get().fetchMyCommunicators({
        force: true,
      });
      const resolvedCommunicator =
        (existingCommunicatorId
          ? refreshedCommunicators.find(
              (communicator) => communicator.id === existingCommunicatorId,
            )
          : null) ||
        findCopiedCommunicator(
          refreshedCommunicators,
          sourceCommunicatorId,
          createdCommunicator?.id,
        );

      if (resolvedCommunicator?.id) {
        get().changeCommunicator(String(resolvedCommunicator.id));
        return resolvedCommunicator;
      }
    } catch {
      if (existingCommunicatorId) {
        get().setApiFailure();
        throw new Error(
          `Communicator official copy conflict references missing communicator ${existingCommunicatorId}. Backend data may be inconsistent and may require DB cleanup.`,
        );
      }
    }

    if (createdCommunicator?.id) {
      get().upsertCommunicator(createdCommunicator);
      get().changeCommunicator(String(createdCommunicator.id));
      get().setApiFetching(false);
      return createdCommunicator;
    }

    get().setApiFailure();
    throw new Error(
      `Copied official communicator ${sourceCommunicatorId} could not be resolved after refresh.`,
    );
  };
