import { apiClient } from '../apiClient';
import { useBoardsStore } from '../boardsStore';
import { useCommunicatorsStore } from '../communicatorsStore';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type { LoginPayload } from '../../types/auth';
import type { Board } from '../../types/board';

export const fetchRemoteBoardsAction = async (
  loginData: LoginPayload,
): Promise<Board[]> => {
  try {
    const communicatorState = useCommunicatorsStore.getState();
    const boardState = useBoardsStore.getState();
    const preferredCommunicatorId =
      (loginData as any)?.activeCommunicatorId ||
      (loginData as any)?.settings?.activeCommunicatorId ||
      (loginData as any)?.settings?.communicatorId;

    let currentCommunicator = communicatorState.communicators.find(
      (communicator) =>
        communicator.id ===
        (preferredCommunicatorId || communicatorState.activeCommunicatorId),
    );

    if (
      !currentCommunicator &&
      loginData.communicators &&
      loginData.communicators.length
    ) {
      currentCommunicator =
        loginData.communicators[loginData.communicators.length - 1];
    }

    if (!currentCommunicator || !Array.isArray(currentCommunicator.boards)) {
      return [];
    }

    const localBoardsIds = boardState.boards
      .filter((board) => currentCommunicator!.boards.includes(board.id))
      .map((board) => board.id);

    const apiBoardsIds = currentCommunicator.boards.filter(
      (boardId) => !localBoardsIds.includes(boardId),
    );

    if (!apiBoardsIds.length) {
      return [];
    }

    const boardResults = await Promise.all(
      apiBoardsIds.map(async (boardId) => {
        try {
          const { data } = await apiClient.get<Board>(`/board/${boardId}`);
          return data;
        } catch {
          return null;
        }
      }),
    );

    return boardResults.filter((board): board is Board => board !== null);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch remote boards'));
  }
};
