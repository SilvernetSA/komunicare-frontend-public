import { replaceDefaultHomeBoardIfIsNecessary } from '../../utils/replaceDefaultHomeBoard';
import { useCommunicatorsStore } from '../communicatorsStore';
import { buildUpdatedCommunicatorAfterBoardSync } from './buildUpdatedCommunicatorAfterBoardSync';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type { Board } from '../../types/board';
import type { BoardsStore } from '../boardsStore';

export const syncBoardWithCommunicatorFactory =
  (get: () => BoardsStore) =>
  async (args: {
    parentBoard: Board;
    createCommunicator?: boolean;
    createParentBoard?: boolean;
    previousBoardId?: string;
  }): Promise<string> => {
    const {
      parentBoard,
      createCommunicator = false,
      createParentBoard = false,
      previousBoardId,
    } = args;

    try {
      const communicatorState = useCommunicatorsStore.getState();
      const activeCommunicator = communicatorState.communicators.find(
        (communicator) =>
          communicator.id === communicatorState.activeCommunicatorId,
      );
      if (!activeCommunicator) {
        throw new Error('Active communicator not found');
      }

      const synchronisedParent = createParentBoard
        ? await get().createRemoteBoard({
            board: parentBoard,
            tempId: parentBoard.id || '',
          })
        : await get().updateRemoteBoard(parentBoard);

      const updatedParentBoardId = synchronisedParent.id;
      const previousParentBoardId = previousBoardId || parentBoard.id;

      if (previousParentBoardId !== updatedParentBoardId) {
        useCommunicatorsStore.getState().replaceBoardCommunicator({
          prevBoardId: previousParentBoardId,
          nextBoardId: updatedParentBoardId,
        });
      }

      replaceDefaultHomeBoardIfIsNecessary(
        previousParentBoardId,
        updatedParentBoardId,
      );

      const updatedCommunicator = buildUpdatedCommunicatorAfterBoardSync(
        activeCommunicator,
        previousParentBoardId,
        updatedParentBoardId,
      );

      useCommunicatorsStore.getState().upsertCommunicator(updatedCommunicator);

      const persistedCommunicator = createCommunicator
        ? await useCommunicatorsStore.getState().createRemoteCommunicator({
            communicator: updatedCommunicator,
            tempId: updatedCommunicator.id,
          })
        : await useCommunicatorsStore
            .getState()
            .updateRemoteCommunicator(updatedCommunicator);

      useCommunicatorsStore
        .getState()
        .upsertCommunicator(persistedCommunicator);

      await get().updateApiMarkedBoards();
      return updatedParentBoardId;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Failed to sync board and communicator'),
      );
    }
  };
