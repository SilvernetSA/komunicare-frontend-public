import { mergeCommunicators } from './mergeCommunicators';

import type { Communicator } from '@/types/communicator';

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
      // In the compliance version, always prefer a personal communicator.
      // If the stored preference points to a system communicator, find the
      // personal copy that was made from it (copySourceCommunicatorId match),
      // then fall back to isDefault or the first personal communicator.
      const preferredIsPersonal = userCommunicators.some(
        (c: Communicator) => c.id === preferredCommunicatorId,
      );
      const activeCommunicatorId = userCommunicators.length
        ? preferredIsPersonal && preferredExists
          ? preferredCommunicatorId
          : (preferredCommunicatorId &&
              userCommunicators.find(
                (c: Communicator) =>
                  (c as any).copySourceCommunicatorId === preferredCommunicatorId,
              )?.id) ||
            userCommunicators.find((c: Communicator) => (c as any).isDefault)?.id ||
            userCommunicators[0].id
        : state.activeCommunicatorId;
      return {
        activeCommunicatorId,
        communicators,
      };
    });
  };
