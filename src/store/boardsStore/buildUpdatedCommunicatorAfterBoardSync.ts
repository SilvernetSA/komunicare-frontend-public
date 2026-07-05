import type { Communicator } from '../../types/communicator';

export const buildUpdatedCommunicatorAfterBoardSync = (
  activeCommunicator: Communicator,
  previousBoardId: string,
  updatedBoardId: string,
): Communicator =>
  ({
    ...activeCommunicator,
    boards: (activeCommunicator.boards || []).map((boardId) =>
      boardId === previousBoardId ? updatedBoardId : boardId,
    ),
    rootBoard:
      (activeCommunicator as any).rootBoard === previousBoardId
        ? updatedBoardId
        : (activeCommunicator as any).rootBoard,
    activeBoardId:
      (activeCommunicator as any).activeBoardId === previousBoardId
        ? updatedBoardId
        : (activeCommunicator as any).activeBoardId,
  }) as Communicator;
