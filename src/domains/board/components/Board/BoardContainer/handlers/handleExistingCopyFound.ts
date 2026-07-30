import { Dispatch, SetStateAction } from 'react';

import { Board as BoardModel } from '@/types/board';
import { Communicator } from '@/types/communicator';
import {
  resolveBundleNameForBoard,
  resolveCommunicatorBundle,
} from '../../utils-simple/copyOnWrite';
import { CANONICAL_ROOT_BOARD_IDS } from '../navigationHelpers';

interface HandleExistingCopyFoundParams {
  targetCommunicator: Communicator;
  activeBoard: BoardModel | undefined;
  communicator: Communicator | undefined;
  setExistingCopyCommunicatorId: Dispatch<SetStateAction<string>>;
  setExistingCopyBoardId: Dispatch<SetStateAction<string>>;
  setExistingCopyFoundOpen: Dispatch<SetStateAction<boolean>>;
}

/**
 * Computes the best destination board when a communicator copy already exists.
 */
export const handleExistingCopyFound = ({
  targetCommunicator,
  activeBoard,
  communicator,
  setExistingCopyCommunicatorId,
  setExistingCopyBoardId,
  setExistingCopyFoundOpen,
}: HandleExistingCopyFoundParams) => {
  if (!targetCommunicator?.id) {
    return;
  }

  const activeId = String(activeBoard?.id || '');
  const targetBoards = Array.isArray(targetCommunicator.boards)
    ? targetCommunicator.boards
    : [];
  const isCanonicalRootBoard = CANONICAL_ROOT_BOARD_IDS.has(activeId);
  const activeBundle = resolveBundleNameForBoard(communicator as any, activeId);
  const targetBundle = resolveCommunicatorBundle(targetCommunicator as any);

  let nextBoardId = '';

  if (!isCanonicalRootBoard && targetBoards.includes(activeId)) {
    nextBoardId = activeId;
  }

  if (!nextBoardId && isCanonicalRootBoard) {
    const targetRootBoard = String(targetCommunicator.rootBoard || '');
    const canUseTargetRootBoard =
      targetRootBoard &&
      !CANONICAL_ROOT_BOARD_IDS.has(targetRootBoard) &&
      activeBundle &&
      targetBundle === activeBundle;
    if (canUseTargetRootBoard) {
      nextBoardId = targetRootBoard;
    } else if (targetBoards.includes(activeId)) {
      nextBoardId = activeId;
    }
  }

  if (!nextBoardId) {
    nextBoardId = String(targetCommunicator.rootBoard || '');
  }

  if (
    isCanonicalRootBoard &&
    CANONICAL_ROOT_BOARD_IDS.has(String(nextBoardId || ''))
  ) {
    const nonCanonicalFallback = targetBoards.find(
      (boardId: string) => !CANONICAL_ROOT_BOARD_IDS.has(String(boardId)),
    );
    if (nonCanonicalFallback) {
      nextBoardId = String(nonCanonicalFallback);
    }
  }

  setExistingCopyCommunicatorId(targetCommunicator.id);
  setExistingCopyBoardId(nextBoardId);
  setExistingCopyFoundOpen(true);
};
