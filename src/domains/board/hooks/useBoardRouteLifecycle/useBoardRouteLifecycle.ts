import { useEffect, useRef, useState } from 'react';
import { NavigateFunction } from 'react-router-dom';

import { findCommunicatorScopedBoardBySourceId } from './communicatorScopedBoardResolution';
import {
  resolveSafeFallbackBoardId,
  syncBoardOwnerAndActivate,
} from './useBoardRouteLifecycle.activation';
import { CANONICAL_ROOT_BOARD_ID_SET } from '../useBoardSaveFlow/useBoardSaveFlow.copyOnWrite';

import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import { useCommunicatorsStore } from '@/domains/communicator/stores/communicatorsStore';
import { Board as BoardModel } from '@/types/board';
import { Communicator } from '@/types/communicator';
import { boardUrl } from '@/utils/boardUrl';

interface UseBoardRouteLifecycleParams {
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
  communicators: Communicator[];
  activeCommunicatorId?: string;
  getApiObjects: () => Promise<void>;
}

export const useBoardRouteLifecycle = ({
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
  communicators,
  activeCommunicatorId,
  getApiObjects,
}: UseBoardRouteLifecycleParams): void => {
  const [isInitialized, setIsInitialized] = useState(false);
  const syncedUserEmailRef = useRef('');
  const loadingUrlBoardIdRef = useRef('');
  const lastNavigateTargetRef = useRef('');
  const routeCommunicator = resolveRouteCommunicator({
    communicators,
    urlCommunicatorId,
    activeCommunicatorId,
  });
  const localUrlBoardId = resolveLocalUrlBoard({
    boards,
    communicator: routeCommunicator,
    urlId,
  })?.id;
  const routeUsesExactCommunicatorBoard = usesExactCommunicatorBoard({
    communicator: routeCommunicator,
    boardId: urlId,
  });

  useEffect(() => {
    if (!urlCommunicatorId || urlCommunicatorId === activeCommunicatorId) {
      return;
    }

    const activeCommunicator = communicators.find(
      (communicator) => communicator.id === activeCommunicatorId,
    );
    if (activeCommunicator) {
      const copySource = (activeCommunicator as any).copySource;
      const copySourceId = (activeCommunicator as any).copySourceCommunicatorId;
      if (
        copySource === urlCommunicatorId ||
        copySourceId === urlCommunicatorId
      ) {
        const communicatorScopedUrlBoard =
          findCommunicatorScopedBoardBySourceId({
            boards,
            communicator: activeCommunicator,
            sourceBoardId: urlId,
          });
        const targetBoardId =
          communicatorScopedUrlBoard?.id ||
          (CANONICAL_ROOT_BOARD_ID_SET.has(String(urlId || ''))
            ? String(urlId || '')
            : '') ||
          activeCommunicator.rootBoard ||
          activeCommunicator.boards?.[0];
        if (targetBoardId) {
          navigate(boardUrl(targetBoardId, activeCommunicatorId), {
            replace: true,
          });
        }
        return;
      }
    }

    const communicatorFromUrl = communicators.find(
      (communicator) => communicator.id === urlCommunicatorId,
    );
    if (communicatorFromUrl) {
      useCommunicatorsStore.getState().changeCommunicator(urlCommunicatorId);
    }
  }, [
    urlCommunicatorId,
    urlId,
    activeCommunicatorId,
    boards,
    communicators,
    navigate,
  ]);

  useEffect(() => {
    if (!urlCommunicatorId || !urlId || !routeCommunicator?.id) {
      return;
    }

    if (!routeUsesExactCommunicatorBoard) {
      return;
    }

    const normalizedUrlId = String(urlId || '').trim();
    if (
      normalizedUrlId &&
      activeBoardId === normalizedUrlId &&
      activeCommunicatorId === routeCommunicator.id
    ) {
      return;
    }

    void syncBoardOwnerAndActivate({
      boardId: normalizedUrlId,
      availableBoards: boards,
      fetchBoardById,
      changeBoard,
      communicators,
      activeCommunicatorId,
      navigate,
    }).catch(() => undefined);
  }, [
    urlCommunicatorId,
    urlId,
    routeCommunicator,
    routeUsesExactCommunicatorBoard,
    activeBoardId,
    activeCommunicatorId,
    boards,
    fetchBoardById,
    changeBoard,
    communicators,
    navigate,
  ]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!routeCommunicator) {
      return;
    }

    const isPersonalCopy = Boolean(
      (routeCommunicator as any)?.copySource ||
      (routeCommunicator as any)?.copySourceCommunicatorId,
    );
    const rootBoard = routeCommunicator.rootBoard;
    const communicatorScopedActiveBoard = findCommunicatorScopedBoardBySourceId(
      {
        boards,
        communicator: routeCommunicator,
        sourceBoardId: activeBoardId,
      },
    );
    const fallbackBoardId = communicatorScopedActiveBoard?.id || rootBoard;
    if (
      isPersonalCopy &&
      CANONICAL_ROOT_BOARD_ID_SET.has(activeBoardId || '') &&
      !routeCommunicator.boards?.includes(activeBoardId || '') &&
      fallbackBoardId &&
      fallbackBoardId !== activeBoardId
    ) {
      changeBoard(fallbackBoardId);
      navigate(boardUrl(fallbackBoardId, routeCommunicator.id), {
        replace: true,
      });
    }
  }, [
    isInitialized,
    communicators,
    routeCommunicator,
    activeCommunicatorId,
    activeBoardId,
    changeBoard,
    navigate,
    boards,
  ]);

  useEffect(() => {
    handleUrlBoardSyncEffect({
      urlId,
      urlCommunicatorId,
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
    });
  }, [urlId, urlCommunicatorId, activeCommunicatorId, localUrlBoardId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void runBoardInitializationEffect({
      isInitialized,
      userEmail,
      setSyncedUserEmail: (email) => {
        syncedUserEmailRef.current = email;
      },
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
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    runUserObjectsSyncEffect({
      isInitialized,
      userEmail,
      syncedUserEmailRef,
      getApiObjects,
    });
  }, [isInitialized, userEmail, getApiObjects]);

  useEffect(() => {
    return handleLateBoardFallbackEffect({
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
    });
  }, [
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
  ]);
};

interface UrlSyncEffectParams {
  urlId?: string;
  urlCommunicatorId?: string;
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

const resolveRouteCommunicator = ({
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

const resolveLocalUrlBoard = ({
  boards,
  communicator,
  urlId,
}: {
  boards: BoardModel[];
  communicator?: Communicator;
  urlId?: string | null;
}) => {
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

const resolveRouteLocalUrlBoard = ({
  boards,
  communicators,
  urlCommunicatorId,
  activeCommunicatorId,
  urlId,
}: {
  boards: BoardModel[];
  communicators: Communicator[];
  urlCommunicatorId?: string;
  activeCommunicatorId?: string;
  urlId?: string | null;
}) =>
  resolveLocalUrlBoard({
    boards,
    communicator: resolveRouteCommunicator({
      communicators,
      urlCommunicatorId,
      activeCommunicatorId,
    }),
    urlId,
  });

const usesExactCommunicatorBoard = ({
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

/**
 * Syncs URL board id with in-memory store board state, including fallback routing.
 */
export const handleUrlBoardSyncEffect = ({
  urlId,
  urlCommunicatorId,
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
    const latestCommunicatorState = useCommunicatorsStore.getState();

    return syncBoardOwnerAndActivate({
      boardId,
      resolvedBoard,
      availableBoards: boards,
      fetchBoardById,
      changeBoard,
      communicators: latestCommunicatorState.communicators as Communicator[],
      activeCommunicatorId: latestCommunicatorState.activeCommunicatorId,
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
      const latestLocalBoard = resolveRouteLocalUrlBoard({
        boards: latestBoardState.boards as BoardModel[],
        communicators: latestCommunicatorState.communicators as Communicator[],
        urlCommunicatorId,
        activeCommunicatorId: latestCommunicatorState.activeCommunicatorId,
        urlId,
      });
      const resolvedRouteBoard = latestLocalBoard || board;

      if (
        !canActivateFetchedUrlBoard({ board: resolvedRouteBoard, userEmail })
      ) {
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
const runBoardInitializationEffect = async ({
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
    const personalCopyRootBoard = routeCommunicatorAfterFetch?.rootBoard;
    const communicatorScopedActiveBoard = findCommunicatorScopedBoardBySourceId(
      {
        boards: boardState.boards as BoardModel[],
        communicator: routeCommunicatorAfterFetch,
        sourceBoardId: currentActiveBoardId,
      },
    );
    const fallbackBoardId =
      communicatorScopedActiveBoard?.id || personalCopyRootBoard;
    if (
      fallbackBoardId &&
      ((routeCommunicatorAfterFetch as any)?.copySource ||
        (routeCommunicatorAfterFetch as any)?.copySourceCommunicatorId) &&
      CANONICAL_ROOT_BOARD_ID_SET.has(currentActiveBoardId || '') &&
      !routeCommunicatorAfterFetch?.boards?.includes(currentActiveBoardId || '')
    ) {
      changeBoard(fallbackBoardId);

      if (!(urlCommunicatorId && urlId && urlId !== fallbackBoardId)) {
        navigate(boardUrl(fallbackBoardId, routeCommunicatorIdAfterFetch), {
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
        resolvedTargetBoard = resolveRouteLocalUrlBoard({
          boards: boardState.boards as BoardModel[],
          communicators: communicatorState.communicators as Communicator[],
          urlCommunicatorId,
          activeCommunicatorId: communicatorState.activeCommunicatorId,
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
              resolveRouteLocalUrlBoard({
                boards: latestBoardState.boards as BoardModel[],
                communicators:
                  latestCommunicatorState.communicators as Communicator[],
                urlCommunicatorId,
                activeCommunicatorId:
                  latestCommunicatorState.activeCommunicatorId,
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
    availableCommunicators: communicators,
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
const runUserObjectsSyncEffect = ({
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
