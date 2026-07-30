import { apiClient } from '@/store/apiClient';
import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import { useCommunicatorsStore } from '@/domains/communicator/stores/communicatorsStore';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { LoginPayload } from '@/types/auth';
import type { Board } from '@/types/board';
import type { Communicator } from '@/types/communicator';

const COMMUNICATOR_BOARD_ROUTE_PATTERN =
  /^\/communicator\/([^/]+)\/board\/([^/]+)\/?$/;

const getCurrentCommunicatorBoardRoute = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const match = window.location.pathname.match(
    COMMUNICATOR_BOARD_ROUTE_PATTERN,
  );
  if (!match) {
    return undefined;
  }

  return {
    communicatorId: decodeURIComponent(match[1]),
    boardId: decodeURIComponent(match[2]),
  };
};

const collectCommunicatorBoardIds = (
  communicator?: Communicator,
): Set<string> => {
  const boardIds = new Set<string>();

  const rootBoardId = String(communicator?.rootBoard || '').trim();
  if (rootBoardId) {
    boardIds.add(rootBoardId);
  }

  (Array.isArray(communicator?.boards) ? communicator.boards : []).forEach(
    (boardId) => {
      const normalizedBoardId = String(boardId || '').trim();
      if (normalizedBoardId) {
        boardIds.add(normalizedBoardId);
      }
    },
  );

  (Array.isArray(communicator?.defaultBoardsIncluded)
    ? communicator.defaultBoardsIncluded
    : []
  ).forEach((entry) => {
    const homeBoardId = String(entry?.homeBoard || '').trim();
    if (homeBoardId) {
      boardIds.add(homeBoardId);
    }
  });

  return boardIds;
};

const findCommunicatorById = ({
  communicatorId,
  storeCommunicators,
  loginCommunicators,
}: {
  communicatorId?: string;
  storeCommunicators: Communicator[];
  loginCommunicators?: Communicator[];
}): Communicator | undefined => {
  const normalizedCommunicatorId = String(communicatorId || '').trim();
  if (!normalizedCommunicatorId) {
    return undefined;
  }

  return (
    storeCommunicators.find(
      (communicator) => communicator.id === normalizedCommunicatorId,
    ) ||
    loginCommunicators?.find(
      (communicator) => communicator.id === normalizedCommunicatorId,
    )
  );
};

export const fetchRemoteBoardsAction = async (
  loginData: LoginPayload,
): Promise<Board[]> => {
  try {
    const communicatorState = useCommunicatorsStore.getState();
    const boardState = useBoardsStore.getState();
    const routeMatch = getCurrentCommunicatorBoardRoute();
    const preferredCommunicatorId =
      (loginData as any)?.activeCommunicatorId ||
      (loginData as any)?.settings?.activeCommunicatorId ||
      (loginData as any)?.settings?.communicatorId;

    let currentCommunicator = findCommunicatorById({
      communicatorId: routeMatch?.communicatorId,
      storeCommunicators: communicatorState.communicators,
      loginCommunicators: loginData.communicators as Communicator[] | undefined,
    });

    if (!currentCommunicator) {
      currentCommunicator = communicatorState.communicators.find(
        (communicator) => communicator.id === communicatorState.activeCommunicatorId,
      );
    }

    if (!currentCommunicator && preferredCommunicatorId) {
      currentCommunicator = findCommunicatorById({
        communicatorId: preferredCommunicatorId,
        storeCommunicators: communicatorState.communicators,
        loginCommunicators: loginData.communicators as Communicator[] | undefined,
      });
    }

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

    const rootBoardId = String(currentCommunicator.rootBoard || '').trim();
    if (!rootBoardId) {
      return [];
    }

    const routeBoardId = String(routeMatch?.boardId || '').trim();
    const communicatorBoardIds = collectCommunicatorBoardIds(currentCommunicator);
    const preloadBoardId =
      routeBoardId && communicatorBoardIds.has(routeBoardId)
        ? routeBoardId
        : rootBoardId;

    const hasLocalPreloadBoard = boardState.boards.some(
      (board) => String(board.id || '').trim() === preloadBoardId,
    );
    if (hasLocalPreloadBoard) {
      return [];
    }

    try {
      const { data } = await apiClient.get<Board>(`/board/${preloadBoardId}`);
      return [data];
    } catch {
      return [];
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch remote boards'));
  }
};
