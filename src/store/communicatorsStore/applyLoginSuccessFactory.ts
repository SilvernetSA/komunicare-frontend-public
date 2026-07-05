import { mergeCommunicators } from './mergeCommunicators';

import type { Communicator } from '../../types/communicator';

export const applyLoginSuccessFactory =
  (set: (patch: any) => void) =>
  (payload: unknown): void => {
    set((state: any) => {
      const userCommunicators = (payload as any)?.communicators || [];
      const preferredCommunicatorId =
        (payload as any)?.activeCommunicatorId ||
        (payload as any)?.settings?.activeCommunicatorId ||
        (payload as any)?.settings?.communicatorId;
      const communicators = mergeCommunicators(
        state.communicators,
        userCommunicators,
      );
      const preferredExists = communicators.some(
        (communicator: Communicator) =>
          communicator.id === preferredCommunicatorId,
      );
      const activeCommunicatorId = userCommunicators.length
        ? preferredExists
          ? preferredCommunicatorId
          : userCommunicators[0].id
        : state.activeCommunicatorId;
      return {
        activeCommunicatorId,
        communicators,
      };
    });
  };
