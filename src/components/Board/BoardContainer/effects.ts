import { NavigateFunction } from 'react-router-dom';

import {
  resolveSafeFallbackBoardId,
  syncBoardOwnerAndActivate,
} from './navigationHelpers';
import { useBoardsStore } from '../../../store/boardsStore';
import { useCommunicatorsStore } from '../../../store/communicatorsStore';
import { Board as BoardModel } from '../../../types/board';
import { Communicator } from '../../../types/communicator';

interface UrlSyncEffectParams {
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

  if (activeBoardId === urlId && boards.some((board) => board.id === urlId)) {
    return;
  }

  const localBoard = boards.find((b) => b.id === urlId);
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
      if (!canActivateFetchedUrlBoard({ board, userEmail })) {
        setBlockedPrivateBoard(true);
        return;
      }

      return activateUrlBoardWithOwnerSync({
        boardId: board.id,
        resolvedBoard: board,
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

    if (!currentActiveBoardExists) {
      const communicatorRootBoard = communicatorState.communicators.find(
        (c) => c.id === communicatorState.activeCommunicatorId,
      )?.rootBoard;

      let targetId = communicatorRootBoard || boardState.boards[0]?.id;
      let resolvedTargetBoard: BoardModel | undefined;

      if (urlId) {
        resolvedTargetBoard = boardState.boards.find((b) => b.id === urlId);
        if (resolvedTargetBoard?.id) {
          targetId = resolvedTargetBoard.id;
        } else {
          try {
            resolvedTargetBoard = await fetchBoardById(urlId);
            if (resolvedTargetBoard?.id) {
              targetId = resolvedTargetBoard.id;
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
            urlId !== targetId
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

  const fallbackId = resolveSafeFallbackBoardId({
    availableBoards: boards,
    availableCommunicators: communicators as Communicator[],
    currentCommunicatorId: activeCommunicatorId,
  });
  const localUrlBoard = urlId
    ? boards.find((board) => board.id === urlId)
    : undefined;
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
      urlId !== targetId
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
