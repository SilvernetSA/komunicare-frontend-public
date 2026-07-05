import { useCommunicatorsStore } from '../communicatorsStore';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type { Board } from '../../types/board';
import type { BoardsStore } from '../boardsStore';

export const syncBoardsWithCommunicatorFactory =
  (get: () => BoardsStore) =>
  async (args: {
    childBoard: Board;
    parentBoard: Board;
    createCommunicator?: boolean;
    createParentBoard?: boolean;
    previousParentBoardId?: string;
  }): Promise<string> => {
    const {
      childBoard,
      parentBoard,
      createCommunicator = false,
      createParentBoard = false,
      previousParentBoardId,
    } = args;

    try {
      const synchronisedChild = await get().createRemoteBoard({
        board: childBoard,
        tempId: childBoard.id || '',
      });

      const communicatorState = useCommunicatorsStore.getState();
      const activeCommunicator = communicatorState.communicators.find(
        (communicator) =>
          communicator.id === communicatorState.activeCommunicatorId,
      );
      const childWasAlreadyAssociated =
        activeCommunicator?.boards?.includes(childBoard.id) || false;

      if (childWasAlreadyAssociated) {
        communicatorState.replaceBoardCommunicator({
          prevBoardId: childBoard.id,
          nextBoardId: synchronisedChild.id,
        });
      } else {
        communicatorState.addBoardCommunicator(synchronisedChild.id);
      }

      return await get().syncBoardWithCommunicator({
        parentBoard,
        createCommunicator,
        createParentBoard,
        previousBoardId: previousParentBoardId,
      });
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Failed to sync parent and child boards'),
      );
    }
  };
