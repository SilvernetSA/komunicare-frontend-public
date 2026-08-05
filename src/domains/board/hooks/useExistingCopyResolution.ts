import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { NavigateFunction } from 'react-router-dom';

import { findCommunicatorScopedBoardBySourceId } from './useBoardRouteLifecycle/communicatorScopedBoardResolution';
import { CANONICAL_ROOT_BOARD_ID_SET } from './useBoardSaveFlow/useBoardSaveFlow.copyOnWrite';

import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import { Board as BoardModel } from '@/types/board';
import { Communicator } from '@/types/communicator';
import { boardUrl } from '@/utils/boardUrl';
import { switchCommunicatorNavigation } from '@/utils/switchCommunicatorNavigation';

interface UseExistingCopyResolutionParams {
  activeBoard: BoardModel | undefined;
  communicator: Communicator | undefined;
  communicators: Communicator[];
  navigate: NavigateFunction;
  switchBoard: (boardId: string) => void;
  setSelectedTileIds: Dispatch<SetStateAction<string[]>>;
  setIsSelecting: Dispatch<SetStateAction<boolean>>;
}

interface UseExistingCopyResolutionResult {
  existingCopyFoundOpen: boolean;
  handleExistingCopyFound: (targetCommunicator: Communicator) => void;
  handleGoToExistingCopy: () => void;
  resetExistingCopyResolution: () => void;
}

export const useExistingCopyResolution = ({
  activeBoard,
  communicators,
  navigate,
  switchBoard,
  setSelectedTileIds,
  setIsSelecting,
}: UseExistingCopyResolutionParams): UseExistingCopyResolutionResult => {
  const [existingCopyFoundOpen, setExistingCopyFoundOpen] = useState(false);
  const [existingCopyCommunicatorId, setExistingCopyCommunicatorId] =
    useState('');
  const [existingCopyBoardId, setExistingCopyBoardId] = useState('');

  const resetExistingCopyResolution = useCallback(() => {
    setExistingCopyFoundOpen(false);
    setExistingCopyCommunicatorId('');
    setExistingCopyBoardId('');
  }, []);

  const handleExistingCopyFound = useCallback(
    (targetCommunicator: Communicator) => {
      if (!targetCommunicator?.id) {
        return;
      }

      const activeId = String(activeBoard?.id || '');
      const targetBoards = Array.isArray(targetCommunicator.boards)
        ? targetCommunicator.boards
        : [];
      const isCanonicalRootBoard = CANONICAL_ROOT_BOARD_ID_SET.has(activeId);

      let nextBoardId = '';

      if (isCanonicalRootBoard) {
        const communicatorScopedRootCopy =
          findCommunicatorScopedBoardBySourceId({
            boards: useBoardsStore.getState().boards as BoardModel[],
            communicator: targetCommunicator,
            sourceBoardId: activeId,
          });
        nextBoardId = String(communicatorScopedRootCopy?.id || activeId);
      } else if (targetBoards.includes(activeId)) {
        nextBoardId = activeId;
      }

      if (!nextBoardId) {
        nextBoardId = String(
          targetCommunicator.rootBoard || targetBoards[0] || '',
        );
      }

      setExistingCopyCommunicatorId(targetCommunicator.id);
      setExistingCopyBoardId(nextBoardId);
      setExistingCopyFoundOpen(true);
    },
    [activeBoard],
  );

  const handleGoToExistingCopy = useCallback(() => {
    const targetCommunicator = communicators.find(
      (item) => item.id === existingCopyCommunicatorId,
    );
    const targetBoardId = existingCopyBoardId || targetCommunicator?.rootBoard;
    if (!targetCommunicator || !targetBoardId) {
      resetExistingCopyResolution();
      return;
    }

    switchBoard(targetBoardId);
    switchCommunicatorNavigation({
      communicator: targetCommunicator,
      navigate,
      skipBoardNavigation: true,
    });
    navigate(boardUrl(targetBoardId, targetCommunicator.id), { replace: true });
    resetExistingCopyResolution();
    setSelectedTileIds([]);
    setIsSelecting(false);
  }, [
    communicators,
    existingCopyBoardId,
    existingCopyCommunicatorId,
    navigate,
    resetExistingCopyResolution,
    setIsSelecting,
    setSelectedTileIds,
    switchBoard,
  ]);

  return {
    existingCopyFoundOpen,
    handleExistingCopyFound,
    handleGoToExistingCopy,
    resetExistingCopyResolution,
  };
};
