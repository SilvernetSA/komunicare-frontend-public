import { NavigateFunction } from 'react-router-dom';

import { Board as BoardModel } from '@/types/board';
import { Communicator } from '@/types/communicator';
import { switchCommunicatorNavigation } from '@/utils/switchCommunicatorNavigation';
import { buildBoardPath } from '@/utils/buildBoardPath';

export const CANONICAL_ROOT_BOARD_IDS = new Set(['komunicare']);
export const DEFAULT_SYSTEM_ROOT_BOARD_ID = 'komunicare';

/**
 * Returns the communicator that contains the provided board id.
 */
export const getBoardOwnerCommunicator = (
  availableCommunicators: Communicator[],
  boardId: string,
) =>
  availableCommunicators.find((item) =>
    Array.isArray(item?.boards) ? item.boards.includes(boardId) : false,
  );

const collectCommunicatorScopedBoardIds = (
  communicator?: Communicator,
): Set<string> => {
  const boardIds = new Set<string>();

  const rootBoard = String(communicator?.rootBoard || '').trim();
  if (rootBoard) {
    boardIds.add(rootBoard);
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
    const homeBoard = String(entry?.homeBoard || '').trim();
    if (homeBoard) {
      boardIds.add(homeBoard);
    }
  });

  return boardIds;
};

export const findCommunicatorScopedBoardBySourceId = ({
  boards,
  communicator,
  sourceBoardId,
}: {
  boards: BoardModel[];
  communicator?: Communicator;
  sourceBoardId?: string | null;
}): BoardModel | undefined => {
  const normalizedSourceBoardId = String(sourceBoardId || '').trim();
  if (!normalizedSourceBoardId) {
    return undefined;
  }

  const scopedBoardIds = collectCommunicatorScopedBoardIds(communicator);

  return boards.find(
    (board) =>
      scopedBoardIds.has(String(board.id || '').trim()) &&
      String(board.sourceBoardId || '').trim() === normalizedSourceBoardId,
  );
};

export const resolveRouteCommunicator = ({
  communicators,
  urlCommunicatorId,
  activeCommunicatorId,
}: {
  communicators: Communicator[];
  urlCommunicatorId?: string;
  activeCommunicatorId?: string;
}) =>
  communicators.find((communicator) => communicator.id === urlCommunicatorId) ||
  communicators.find(
    (communicator) => communicator.id === activeCommunicatorId,
  );

export const resolveLocalUrlBoard = ({
  boards,
  communicator,
  urlId,
}: {
  boards: BoardModel[];
  communicator?: Communicator;
  urlId?: string | null;
}): BoardModel | undefined => {
  const normalizedUrlId = String(urlId || '').trim();
  if (!normalizedUrlId) {
    return undefined;
  }

  return (
    findCommunicatorScopedBoardBySourceId({
      boards,
      communicator,
      sourceBoardId: normalizedUrlId,
    }) ||
    boards.find((board) => String(board.id || '').trim() === normalizedUrlId)
  );
};

export const usesExactCommunicatorBoard = ({
  communicator,
  boardId,
}: {
  communicator?: Communicator;
  boardId?: string | null;
}): boolean => {
  const normalizedBoardId = String(boardId || '').trim();
  if (!normalizedBoardId || !communicator) {
    return false;
  }

  return (
    String(communicator.rootBoard || '').trim() === normalizedBoardId ||
    (Array.isArray(communicator.boards)
      ? communicator.boards.some(
          (candidateBoardId) =>
            String(candidateBoardId || '').trim() === normalizedBoardId,
        )
      : false)
  );
};

type SyncCommunicatorForBoardOwnerParams = {
  boardId: string;
  communicators: Communicator[];
  activeCommunicatorId?: string;
  navigate: NavigateFunction;
};

/**
 * Ensures the board owner's communicator is active before board activation.
 */
export const syncCommunicatorForBoardOwner = ({
  boardId,
  communicators,
  activeCommunicatorId,
  navigate,
}: SyncCommunicatorForBoardOwnerParams) => {
  const ownerCommunicator = getBoardOwnerCommunicator(communicators, boardId);
  if (ownerCommunicator?.id && ownerCommunicator.id !== activeCommunicatorId) {
    const activeCommunicator = communicators.find(
      (communicator) => communicator.id === activeCommunicatorId,
    );
    const isPersonalCopyOfOwner =
      (activeCommunicator as any)?.copySource === ownerCommunicator.id ||
      (activeCommunicator as any)?.copySourceCommunicatorId ===
        ownerCommunicator.id;
    if (isPersonalCopyOfOwner) {
      return;
    }

    switchCommunicatorNavigation({
      communicator: ownerCommunicator,
      navigate,
      skipBoardNavigation: true,
    });
  }
};

/**
 * Resolves a safe fallback board id from current communicator root,
 * then from Komunicare root, and finally from first available board.
 */
export const resolveSafeFallbackBoardId = ({
  availableBoards,
  availableCommunicators,
  currentCommunicatorId,
}: {
  availableBoards: BoardModel[];
  availableCommunicators: Communicator[];
  currentCommunicatorId?: string;
}) => {
  const boardExists = (boardId?: string) =>
    !!boardId && availableBoards.some((board) => board.id === boardId);

  const currentCommunicatorRoot = availableCommunicators.find(
    (item) => item.id === currentCommunicatorId,
  )?.rootBoard;
  if (boardExists(currentCommunicatorRoot)) {
    return String(currentCommunicatorRoot);
  }

  const komunicareCommunicator = availableCommunicators.find(
    (item) =>
      item.id === DEFAULT_SYSTEM_ROOT_BOARD_ID ||
      item.rootBoard === DEFAULT_SYSTEM_ROOT_BOARD_ID,
  );
  if (boardExists(komunicareCommunicator?.rootBoard)) {
    return String(komunicareCommunicator?.rootBoard);
  }

  if (boardExists(DEFAULT_SYSTEM_ROOT_BOARD_ID)) {
    return DEFAULT_SYSTEM_ROOT_BOARD_ID;
  }

  return availableBoards[0]?.id || '';
};

type BoardNavigationOptions =
  | {
      mode?: 'push';
      navigate: NavigateFunction;
    }
  | {
      mode: 'replace';
      navigate: NavigateFunction;
      pathname: string;
      urlId?: string;
      lastNavigateTargetRef: { current: string };
    };

type EnsureBoardLoadedAndActivateParams = {
  boardId?: string | null;
  resolvedBoard?: BoardModel;
  availableBoards: BoardModel[];
  fetchBoardById: (id: string) => Promise<BoardModel | undefined>;
  changeBoard: (id: string) => void;
  canActivate?: () => boolean;
  beforeActivate?: (board: BoardModel) => void;
  navigation?: BoardNavigationOptions;
};

/**
 * Loads a board from local state or API, activates it, and optionally updates the route.
 */
export const ensureBoardLoadedAndActivate = async ({
  boardId,
  resolvedBoard,
  availableBoards,
  fetchBoardById,
  changeBoard,
  canActivate,
  beforeActivate,
  navigation,
}: EnsureBoardLoadedAndActivateParams) => {
  const targetBoardId = String(boardId || resolvedBoard?.id || '').trim();
  if (!targetBoardId) {
    return undefined;
  }

  const board =
    (resolvedBoard?.id === targetBoardId ? resolvedBoard : undefined) ||
    availableBoards.find((candidate) => candidate.id === targetBoardId) ||
    (await fetchBoardById(targetBoardId));

  if (!board?.id) {
    return undefined;
  }

  if (canActivate && !canActivate()) {
    return board;
  }

  beforeActivate?.(board);
  changeBoard(board.id);

  if (navigation?.mode === 'replace') {
    navigateToBoardReplace({
      boardId: board.id,
      urlId: navigation.urlId,
      pathname: navigation.pathname,
      navigate: navigation.navigate,
      lastNavigateTargetRef: navigation.lastNavigateTargetRef,
    });
  } else if (navigation) {
    navigation.navigate(buildBoardPath(board.id));
  }

  return board;
};

type SyncBoardOwnerAndActivateParams = Omit<
  EnsureBoardLoadedAndActivateParams,
  'beforeActivate'
> &
  SyncCommunicatorForBoardOwnerParams;

/**
 * Synchronizes the owner communicator as part of board activation.
 */
export const syncBoardOwnerAndActivate = ({
  communicators,
  activeCommunicatorId,
  navigate,
  ...activationParams
}: SyncBoardOwnerAndActivateParams) =>
  ensureBoardLoadedAndActivate({
    ...activationParams,
    beforeActivate: (board) => {
      syncCommunicatorForBoardOwner({
        boardId: board.id,
        communicators,
        activeCommunicatorId,
        navigate,
      });
    },
  });

/**
 * Navigates to `/board/:id` using replace, while preventing redundant loops.
 */
export const navigateToBoardReplace = ({
  boardId,
  urlId,
  pathname,
  navigate,
  lastNavigateTargetRef,
}: {
  boardId: string;
  urlId?: string;
  pathname: string;
  navigate: NavigateFunction;
  lastNavigateTargetRef: { current: string };
}) => {
  const nextBoardId = String(boardId || '').trim();
  if (!nextBoardId) return;

  // On root route without board id in URL, avoid forced auto-navigation loops.
  if (!urlId && pathname === '/') {
    return;
  }

  const targetPath = buildBoardPath(nextBoardId);
  // Also match legacy /board/:id paths so we don't loop on old-format URLs.
  if (pathname === targetPath || pathname === `/board/${nextBoardId}`) return;
  if (lastNavigateTargetRef.current === targetPath) return;
  lastNavigateTargetRef.current = targetPath;
  navigate(targetPath, { replace: true });
  setTimeout(() => {
    if (lastNavigateTargetRef.current === targetPath) {
      lastNavigateTargetRef.current = '';
    }
  }, 0);
};
