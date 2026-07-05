import { Dispatch, SetStateAction } from 'react';
import { NavigateFunction } from 'react-router-dom';

import { Communicator } from '../../../../types/communicator';
import { switchCommunicatorNavigation } from '../../../../utils/switchCommunicatorNavigation';

interface HandleGoToExistingCopyParams {
  communicators: Communicator[];
  existingCopyCommunicatorId: string;
  existingCopyBoardId: string;
  switchBoard: (boardId: string) => void;
  navigate: NavigateFunction;
  setExistingCopyFoundOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedTileIds: Dispatch<SetStateAction<string[]>>;
  setIsSelecting: Dispatch<SetStateAction<boolean>>;
}

/**
 * Navigates the user to an already-existing communicator copy and closes selection flow.
 */
export const handleGoToExistingCopy = ({
  communicators,
  existingCopyCommunicatorId,
  existingCopyBoardId,
  switchBoard,
  navigate,
  setExistingCopyFoundOpen,
  setSelectedTileIds,
  setIsSelecting,
}: HandleGoToExistingCopyParams) => {
  const targetCommunicator = communicators.find(
    (comm) => comm.id === existingCopyCommunicatorId,
  );
  const targetBoardId = existingCopyBoardId || targetCommunicator?.rootBoard;
  if (!targetCommunicator || !targetBoardId) {
    setExistingCopyFoundOpen(false);
    return;
  }
  switchBoard(targetBoardId);
  switchCommunicatorNavigation({
    communicator: targetCommunicator,
    navigate,
    skipBoardNavigation: true,
  });
  navigate(`/board/${targetBoardId}`, { replace: true });
  setExistingCopyFoundOpen(false);
  setSelectedTileIds([]);
  setIsSelecting(false);
};

