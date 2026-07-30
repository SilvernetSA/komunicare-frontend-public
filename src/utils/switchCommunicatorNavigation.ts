import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import { useCommunicatorsStore } from '@/domains/communicator/stores/communicatorsStore';

import type { Communicator } from '../types/communicator';

type NavigateFn = (path: string, options?: { replace?: boolean }) => void;

interface SwitchCommunicatorOptions {
  communicatorId?: string;
  communicator?: Communicator;
  navigate?: NavigateFn;
  preferActiveBoard?: boolean;
  skipBoardNavigation?: boolean;
}

export function switchCommunicatorNavigation(
  options: SwitchCommunicatorOptions,
): void {
  const {
    communicatorId,
    communicator,
    navigate,
    preferActiveBoard = true,
    skipBoardNavigation = false,
  } = options;

  const communicatorState = useCommunicatorsStore.getState();
  const boardsState = useBoardsStore.getState();

  const targetCommunicator =
    communicator ||
    communicatorState.communicators.find((c) => c.id === communicatorId);

  if (!targetCommunicator) {
    return;
  }

  communicatorState.changeCommunicator(targetCommunicator.id);

  if (skipBoardNavigation) {
    return;
  }

  const activeBoardId = boardsState.activeBoardId;
  const nextBoardId =
    (preferActiveBoard &&
      activeBoardId &&
      targetCommunicator.boards?.includes(activeBoardId) &&
      activeBoardId) ||
    targetCommunicator.rootBoard ||
    targetCommunicator.boards?.[0] ||
    activeBoardId ||
    boardsState.boards[0]?.id ||
    '';

  if (!nextBoardId) {
    return;
  }

  boardsState.switchBoard(nextBoardId);
  if (navigate) {
    navigate(`/board/${nextBoardId}`, { replace: true });
  }
}
