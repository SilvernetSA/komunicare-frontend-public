import { NavigateFunction } from 'react-router-dom';

import {
  CANONICAL_ROOT_BOARD_IDS,
  findCommunicatorScopedBoardBySourceId,
  resolveLocalUrlBoard,
  resolveRouteCommunicator,
  resolveSafeFallbackBoardId,
  syncBoardOwnerAndActivate,
} from './navigationHelpers';
import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import { useCommunicatorsStore } from '@/domains/communicator/stores/communicatorsStore';
import { Board as BoardModel } from '@/types/board';
import { Communicator } from '@/types/communicator';
import { buildBoardPath } from '@/utils/buildBoardPath';

interface UrlSyncEffectParams {
  urlCommunicatorId?: string;
  urlId?: string;
  activeBoardId?: string | null;
  boards: BoardModel[];
  changeBoard: (id: string) => void;
  fetchBoardById: (id: string) => Promise<BoardModel | undefined>;
  userEmail?: string;
  setBlockedPrivateBoard: (value: boolean) => void;
  historyRemoveBoard: (boardId: string) => void;
  navigate: NavigateFunction;
  pathname: string;
  lastNavigateTargetRef: { current: string };
  loadingUrlBoardIdRef: { current: string };
}

const canActivateFetchedUrlBoard = ({
  board,
  userEmail,
}: {
  board: BoardModel;
  userEmail?: string;
}) => board.isFixed || board.isPublic || board.email === userEmail;

/**
 * Syncs URL board id with in-memory store board state, including fallback routing.
 */
export const handleUrlBoardSyncEffect = ({
  urlCommunicatorId,
  urlId,
  activeBoardId,
  boards,
  changeBoard,
  fetchBoardById,
  userEmail,
  setBlockedPrivateBoard,
  historyRemoveBoard,
  navigate,
  pathname,
  lastNavigateTargetRef,
  loadingUrlBoardIdRef,
}: UrlSyncEffectParams): void => {
  if (!urlId) return;

  const communicatorState = useCommunicatorsStore.getState();
  const routeCommunicator = resolveRouteCommunicator({
    communicators: communicatorState.communicators as Communicator[],
    urlCommunicatorId,
    activeCommunicatorId: communicatorState.activeCommunicatorId,
  });

  const activateUrlBoardWithOwnerSync = ({
    boardId,
    resolvedBoard,
  }: {
    boardId: string;
    resolvedBoard?: BoardModel;
  }) => {
    const communicatorState = useCommunicatorsStore.getState();

    return syncBoardOwnerAndActivate({
      boardId,
      resolvedBoard,
      availableBoards: boards,
      fetchBoardById,
      changeBoard,
      communicators: communicatorState.communicators as Communicator[],
      activeCommunicatorId: communicatorState.activeCommunicatorId,
      navigate,
    });
  };

  const localBoard = resolveLocalUrlBoard({
    boards,
    communicator: routeCommunicator,
    urlId,
  });
  if (localBoard?.id && activeBoardId === localBoard.id) {
    return;
  }

  if (localBoard) {
    void activateUrlBoardWithOwnerSync({
      boardId: localBoard.id,
      resolvedBoard: localBoard,
    }).catch(() => undefined);
    return;
  }

  if (loadingUrlBoardIdRef.current === urlId) {
    return;
  }
  loadingUrlBoardIdRef.current = urlId;

  fetchBoardById(urlId)
    .then((board) => {
      if (!board) return;

      const latestBoardState = useBoardsStore.getState();
      const latestCommunicatorState = useCommunicatorsStore.getState();
      const latestRouteCommunicator = resolveRouteCommunicator({
        communicators: latestCommunicatorState.communicators as Communicator[],
        urlCommunicatorId,
        activeCommunicatorId: latestCommunicatorState.activeCommunicatorId,
      });
      const resolvedRouteBoard =
        resolveLocalUrlBoard({
          boards: latestBoardState.boards as BoardModel[],
          communicator: latestRouteCommunicator,
          urlId,
        }) || board;

      if (!canActivateFetchedUrlBoard({ board: resolvedRouteBoard, userEmail })) {
        setBlockedPrivateBoard(true);
        return;
      }

      return activateUrlBoardWithOwnerSync({
        boardId: resolvedRouteBoard.id,
        resolvedBoard: resolvedRouteBoard,
      });
    })
    .catch(() => {
      historyRemoveBoard(urlId);

      const boardState = useBoardsStore.getState();
      const communicatorState = useCommunicatorsStore.getState();
      const fallbackBoardId = resolveSafeFallbackBoardId({
        availableBoards: boardState.boards as BoardModel[],
        availableCommunicators:
          communicatorState.communicators as Communicator[],
        currentCommunicatorId: communicatorState.activeCommunicatorId,
      });

      if (!fallbackBoardId) {
        return;
      }

      return syncBoardOwnerAndActivate({
        boardId: fallbackBoardId,
        availableBoards: boardState.boards as BoardModel[],
        fetchBoardById,
        changeBoard,
        communicators: communicatorState.communicators as Communicator[],
        activeCommunicatorId: communicatorState.activeCommunicatorId,
        navigate,
        navigation: {
          mode: 'replace',
          urlId,
          pathname,
          navigate,
          lastNavigateTargetRef,
        },
      }).catch(() => undefined);
    })
    .finally(() => {
      if (loadingUrlBoardIdRef.current === urlId) {
        loadingUrlBoardIdRef.current = '';
      }
    });
};

interface InitEffectParams {
  isInitialized: boolean;
  userEmail?: string;
  setSyncedUserEmail: (email: string) => void;
  getApiObjects: () => Promise<void>;
  urlId?: string;
  urlCommunicatorId?: string;
  fetchBoardById: (id: string) => Promise<BoardModel | undefined>;
  historyRemoveBoard: (id: string) => void;
  changeBoard: (id: string) => void;
  navigate: NavigateFunction;
  pathname: string;
  lastNavigateTargetRef: { current: string };
  setIsInitialized: (value: boolean) => void;
}

/**
 * Runs initial board bootstrap and ensures one valid active board is selected.
 */
export const runBoardInitializationEffect = async ({
  isInitialized,
  userEmail,
  setSyncedUserEmail,
  getApiObjects,
  urlId,
  urlCommunicatorId,
  fetchBoardById,
  historyRemoveBoard,
  changeBoard,
  navigate,
  pathname,
  lastNavigateTargetRef,
  setIsInitialized,
}: InitEffectParams): Promise<void> => {
  if (isInitialized) return;

  try {
    const initialUserEmail = String(userEmail || '');
    if (initialUserEmail) {
      setSyncedUserEmail(initialUserEmail);
    }

    if (window.navigator.onLine) {
      try {
        await getApiObjects();
      } catch (error) {
        console.error('Board init failed loading API objects', error);
      }
    }

    const boardState = useBoardsStore.getState();
    const communicatorState = useCommunicatorsStore.getState();
    const currentActiveBoardId = boardState.activeBoardId;
    const currentActiveBoardExists = Boolean(
      currentActiveBoardId &&
      boardState.boards.some((board) => board.id === currentActiveBoardId),
    );

    const routeCommunicatorAfterFetch = resolveRouteCommunicator({
      communicators: communicatorState.communicators as Communicator[],
      urlCommunicatorId,
      activeCommunicatorId: communicatorState.activeCommunicatorId,
    });
    const routeCommunicatorIdAfterFetch =
      routeCommunicatorAfterFetch?.id ||
      urlCommunicatorId ||
      communicatorState.activeCommunicatorId;
    const communicatorScopedActiveBoard = findCommunicatorScopedBoardBySourceId(
      {
        boards: boardState.boards as BoardModel[],
        communicator: routeCommunicatorAfterFetch,
        sourceBoardId: currentActiveBoardId,
      },
    );
    const fallbackBoardId =
      communicatorScopedActiveBoard?.id || routeCommunicatorAfterFetch?.rootBoard;
    if (
      fallbackBoardId &&
      ((routeCommunicatorAfterFetch as any)?.copySource ||
        (routeCommunicatorAfterFetch as any)?.copySourceCommunicatorId) &&
      CANONICAL_ROOT_BOARD_IDS.has(currentActiveBoardId || '') &&
      !routeCommunicatorAfterFetch?.boards?.includes(currentActiveBoardId || '')
    ) {
      changeBoard(fallbackBoardId);

      if (!(urlCommunicatorId && urlId && urlId !== fallbackBoardId)) {
        navigate(buildBoardPath(fallbackBoardId, routeCommunicatorIdAfterFetch), {
          replace: true,
        });
      }
      return;
    }

    if (!currentActiveBoardExists) {
      const communicatorRootBoard = routeCommunicatorAfterFetch?.rootBoard;

      let targetId = communicatorRootBoard || boardState.boards[0]?.id;
      let resolvedTargetBoard: BoardModel | undefined;
      let preserveUrlBoardSegment = false;

      if (urlId) {
        resolvedTargetBoard = resolveLocalUrlBoard({
          boards: boardState.boards as BoardModel[],
          communicator: routeCommunicatorAfterFetch,
          urlId,
        });
        if (resolvedTargetBoard?.id) {
          targetId = resolvedTargetBoard.id;
          preserveUrlBoardSegment = resolvedTargetBoard.id !== urlId;
        } else {
          try {
            const fetchedTargetBoard = await fetchBoardById(urlId);
            const latestBoardState = useBoardsStore.getState();
            const latestCommunicatorState = useCommunicatorsStore.getState();

            resolvedTargetBoard =
              resolveLocalUrlBoard({
                boards: latestBoardState.boards as BoardModel[],
                communicator: resolveRouteCommunicator({
                  communicators:
                    latestCommunicatorState.communicators as Communicator[],
                  urlCommunicatorId,
                  activeCommunicatorId:
                    latestCommunicatorState.activeCommunicatorId,
                }),
                urlId,
              }) || fetchedTargetBoard;

            if (resolvedTargetBoard?.id) {
              targetId = resolvedTargetBoard.id;
              preserveUrlBoardSegment = resolvedTargetBoard.id !== urlId;
            }
          } catch {
            historyRemoveBoard(urlId);
          }
        }
      }

      if (!targetId) {
        targetId = resolveSafeFallbackBoardId({
          availableBoards: boardState.boards as BoardModel[],
          availableCommunicators:
            communicatorState.communicators as Communicator[],
          currentCommunicatorId: communicatorState.activeCommunicatorId,
        });
      }

      if (targetId) {
        await syncBoardOwnerAndActivate({
          boardId: targetId,
          resolvedBoard: resolvedTargetBoard,
          availableBoards: boardState.boards as BoardModel[],
          fetchBoardById,
          changeBoard,
          communicators: communicatorState.communicators as Communicator[],
          activeCommunicatorId: communicatorState.activeCommunicatorId,
          navigate,
          navigation:
            !preserveUrlBoardSegment && urlId !== targetId
              ? {
                  mode: 'replace',
                  urlId,
                  pathname,
                  navigate,
                  lastNavigateTargetRef,
                }
              : undefined,
        }).catch(() => undefined);
      }
    }
  } finally {
    setIsInitialized(true);
  }
};

interface LateFallbackEffectParams {
  isInitialized: boolean;
  activeBoardId?: string | null;
  boards: BoardModel[];
  communicators: Communicator[];
  activeCommunicatorId?: string;
  urlId?: string;
  urlCommunicatorId?: string;
  historyRemoveBoard: (id: string) => void;
  changeBoard: (id: string) => void;
  fetchBoardById: (id: string) => Promise<BoardModel | undefined>;
  navigate: NavigateFunction;
  pathname: string;
  lastNavigateTargetRef: { current: string };
}

/**
 * Recovers from late board availability to avoid app deadlocks.
 */
export const handleLateBoardFallbackEffect = ({
  isInitialized,
  activeBoardId,
  boards,
  communicators,
  activeCommunicatorId,
  urlId,
  urlCommunicatorId,
  historyRemoveBoard,
  changeBoard,
  fetchBoardById,
  navigate,
  pathname,
  lastNavigateTargetRef,
}: LateFallbackEffectParams): (() => void) | void => {
  const activeBoardExists = Boolean(
    activeBoardId && boards.some((board) => board.id === activeBoardId),
  );

  if (!isInitialized || activeBoardExists) {
    return;
  }

  const routeCommunicator = resolveRouteCommunicator({
    communicators,
    urlCommunicatorId,
    activeCommunicatorId,
  });
  if (routeCommunicator?.rootBoard === activeBoardId) {
    return;
  }

  const fallbackId = resolveSafeFallbackBoardId({
    availableBoards: boards,
    availableCommunicators: communicators as Communicator[],
    currentCommunicatorId: activeCommunicatorId,
  });
  const localUrlBoard = resolveLocalUrlBoard({
    boards,
    communicator: routeCommunicator,
    urlId,
  });
  const targetId = localUrlBoard?.id || fallbackId;

  if (urlId && !localUrlBoard) {
    historyRemoveBoard(urlId);
  }

  if (!targetId) {
    return;
  }

  let isMounted = true;

  void syncBoardOwnerAndActivate({
    boardId: targetId,
    availableBoards: boards,
    fetchBoardById,
    changeBoard,
    canActivate: () => isMounted,
    communicators,
    activeCommunicatorId,
    navigate,
    navigation:
      !localUrlBoard && urlId !== targetId
        ? {
            mode: 'replace',
            urlId,
            pathname,
            navigate,
            lastNavigateTargetRef,
          }
        : undefined,
  }).catch(() => undefined);

  return () => {
    isMounted = false;
  };
};

interface UserObjectsSyncEffectParams {
  isInitialized: boolean;
  userEmail?: string;
  syncedUserEmailRef: { current: string };
  getApiObjects: () => Promise<void>;
}

/**
 * Syncs API objects once per authenticated user after initialization.
 */
export const runUserObjectsSyncEffect = ({
  isInitialized,
  userEmail,
  syncedUserEmailRef,
  getApiObjects,
}: UserObjectsSyncEffectParams): void => {
  const normalizedEmail = String(userEmail || '');
  if (!isInitialized || !normalizedEmail || !window.navigator.onLine) {
    return;
  }

  if (syncedUserEmailRef.current === normalizedEmail) {
    return;
  }

  syncedUserEmailRef.current = normalizedEmail;

  getApiObjects().catch((error) => {
    console.error('Board sync failed loading user API objects', error);
  });
};
