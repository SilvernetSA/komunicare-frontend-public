import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import CommunicatorDialog from './CommunicatorDialog.component';
import {
  APP_DEFAULT_BOARD_IDS,
  TAB_INDEXES,
} from './CommunicatorDialog.constants';
import {
  copyBoard,
  publishBoard as publishBoardAction,
  deleteMyBoard as deleteMyBoardAction,
  updateMyBoard as updateMyBoardAction,
  boardReport as boardReportAction,
} from './Container/boardActions';
import {
  addOrRemoveBoard,
  setRootBoard,
} from './Container/communicatorActions';
import { findBoards, doSearch } from './Container/searchHandlers';
import { useAppStore } from '@/domains/app/stores/appStore';
import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import { useCommunicatorsStore } from '@/domains/communicator/stores/communicatorsStore';
import { switchCommunicatorNavigation } from '@/utils/switchCommunicatorNavigation';
import { useLanguageStore } from '@/domains/settings/stores/languageStore';
import { useNotificationStore } from '@/domains/notifications/stores/notificationStore';
import { UserData } from '@/types/app';
import { Board } from '@/types/board';
import { Communicator } from '@/types/communicator';

import type {
  BoardPageParams,
  BoardPageResponse,
} from '@/domains/board/stores/boardsStore';

const BOARDS_PAGE_LIMIT = 10;
const LOCAL_DEFAULT_COMMUNICATOR_ID = 'cboard_default';

const findLatestCommunicatorByBoard = (
  communicators: Communicator[],
  boardId?: string,
): Communicator | undefined => {
  if (!boardId) {
    return undefined;
  }

  for (let index = communicators.length - 1; index >= 0; index -= 1) {
    const communicator = communicators[index];
    if (communicator.rootBoard === boardId) {
      return communicator;
    }
  }

  for (let index = communicators.length - 1; index >= 0; index -= 1) {
    const communicator = communicators[index];
    if (communicator.boards?.includes(boardId)) {
      return communicator;
    }
  }

  return undefined;
};

const buildVisibleCommunicators = (
  communicators: Communicator[],
  userEmail?: string,
): Communicator[] => {
  const hasRemoteCommunicators = communicators.some(
    (comm) => comm.id !== LOCAL_DEFAULT_COMMUNICATOR_ID && !!comm.email,
  );

  const sourceCommunicators = hasRemoteCommunicators
    ? communicators.filter((comm) => comm.id !== LOCAL_DEFAULT_COMMUNICATOR_ID)
    : communicators;

  const byRootBoard = new Map<string, Communicator>();

  sourceCommunicators.forEach((comm) => {
    const ownershipKey =
      userEmail && comm.email === userEmail
        ? userEmail
        : comm.email || 'unknown';
    const rootKey = comm.rootBoard || comm.id;
    byRootBoard.set(`${ownershipKey}:${rootKey}`, comm);
  });

  return Array.from(byRootBoard.values());
};

const buildCommunicatorBoards = (availableBoards: Board[]): Board[] => {
  const boardMap = new Map<string, Board>();
  availableBoards.forEach((board) => {
    if (board?.id) {
      boardMap.set(board.id, board);
    }
  });

  return APP_DEFAULT_BOARD_IDS.map((boardId) => boardMap.get(boardId)).filter(
    Boolean,
  ) as Board[];
};

interface ContainerProps {
  communicatorBoards: Board[];
  currentCommunicator: Communicator;
  communicators: Communicator[];
  availableBoards: Board[];
  userData: UserData | Record<string, unknown>;
  language: unknown;
  activeBoardId: string;
  dark: boolean;
  communicatorTour: unknown;
  cboardBoards: Board[];
  intl?: unknown;
  communicatorRootBoardIds: Set<string>;
  createCommunicator: (communicator: Communicator) => void;
  editCommunicator: (communicator: Communicator) => void;
  deleteCommunicator: (communicatorId: string) => void;
  changeCommunicator: (communicatorId: string) => void;
  switchBoard: (boardId: string) => void;
  navigate?: (path: string, options?: { replace?: boolean }) => void;
  addBoards: (boards: Board[]) => void;
  replaceBoard: (prev: Board, current: Board) => void;
  showNotification: (message: string) => void;
  deleteBoard: (boardId: string) => void;
  deleteApiBoard: (boardId: string) => Promise<void>;
  deleteBoardCommunicator: (boardId: string) => void;
  createBoard: (board: Board) => void;
  createRemoteBoard: (payload: {
    board: Board;
    tempId: string;
  }) => Promise<Board>;
  updateBoard: (board: Board) => void;
  addBoardCommunicator: (boardId: string) => void;
  upsertCommunicator: (communicator: Communicator) => void;
  updateApiCommunicator: (communicator: Communicator) => Promise<Communicator>;
  deleteApiCommunicator: (communicatorId: string) => Promise<void>;
  syncBoardWithCommunicator: (
    board: Board,
    createCommunicator?: boolean,
    createParentBoard?: boolean,
  ) => Promise<string>;
  updateApiBoard: (board: Board) => Promise<Board>;
  fetchBoardById: (boardId: string) => Promise<Board>;
  fetchMyBoards: (params: BoardPageParams) => Promise<BoardPageResponse>;
  reportBoard: (data: Record<string, unknown>) => Promise<void>;
  disableTour: (tourType: unknown) => void;
}

interface CommunicatorDialogContainerProps {
  open?: boolean;
  onClose?: () => void;
}

const CommunicatorDialogContainer: React.FC<
  CommunicatorDialogContainerProps
> = ({ open = true, onClose }) => {
  const board = useBoardsStore((state) => state);
  const boardsStore = useBoardsStore.getState();
  const navigate = useNavigate();
  const intl = useIntl();
  const communicator = useCommunicatorsStore((state) => state);
  const language = useLanguageStore((state) => state);
  const app = useAppStore((state) => state);
  const disableTour = useAppStore((state) => state.disableTour);
  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );
  const createCommunicatorAction = useCommunicatorsStore(
    (state) => state.createCommunicator,
  );
  const editCommunicatorAction = useCommunicatorsStore(
    (state) => state.editCommunicator,
  );
  const deleteCommunicatorAction = useCommunicatorsStore(
    (state) => state.deleteCommunicator,
  );
  const changeCommunicatorAction = useCommunicatorsStore(
    (state) => state.changeCommunicator,
  );
  const addBoardCommunicatorAction = useCommunicatorsStore(
    (state) => state.addBoardCommunicator,
  );
  const deleteBoardCommunicatorAction = useCommunicatorsStore(
    (state) => state.deleteBoardCommunicator,
  );
  const updateRemoteCommunicatorAction = useCommunicatorsStore(
    (state) => state.updateRemoteCommunicator,
  );
  const deleteRemoteCommunicatorAction = useCommunicatorsStore(
    (state) => state.deleteRemoteCommunicator,
  );

  const activeCommunicatorId = communicator.activeCommunicatorId;
  const emptyCommunicator: Communicator = {
    id: '',
    name: '',
    author: '',
    email: '',
    rootBoard: '',
    boards: [],
  };

  const visibleCommunicators = useMemo(() => {
    return buildVisibleCommunicators(
      communicator.communicators,
      (app.userData as any)?.email,
    );
  }, [app.userData, communicator.communicators]);

  const communicatorRootBoardIds = useMemo(() => {
    return new Set(
      communicator.communicators
        .map((c) => c.rootBoard)
        .filter(Boolean) as string[],
    );
  }, [communicator.communicators]);

  const currentCommunicator =
    findLatestCommunicatorByBoard(visibleCommunicators, board.activeBoardId) ||
    visibleCommunicators.find(
      (comm: Communicator) => comm.id === activeCommunicatorId,
    ) ||
    communicator.communicators.find(
      (comm: Communicator) => comm.id === activeCommunicatorId,
    ) ||
    emptyCommunicator;

  // NOTE: CommunicatorContainer (always mounted) already syncs activeCommunicatorId
  // with the current board's communicator.  A duplicate effect here using a
  // different communicator list (visibleCommunicators vs raw communicators)
  // would produce a ping-pong that fires changeCommunicator in a tight loop
  // while the dialog is open, causing continuous re-renders and tile flickering.

  const communicatorBoards = useMemo(() => {
    return buildCommunicatorBoards(board.boards);
  }, [board.boards]);

  const cboardBoards = board.boards.filter(
    (b: any) => b.email === 'support@cboard.io',
  );

  const communicatorTour = useMemo(() => {
    return (
      (app.liveHelp as any)?.communicatorTour || {
        isCommBoardsEnabled: true,
        isPublicBoardsEnabled: true,
        isAllMyBoardsEnabled: true,
      }
    );
  }, [app.liveHelp]);

  const upsertCommunicator = useCallback(
    (comm: Communicator) => {
      const existing = communicator.communicators.find(
        (existingComm) => existingComm.id === comm.id,
      );
      if (existing) {
        editCommunicatorAction(comm);
      } else {
        createCommunicatorAction(comm);
      }
    },
    [
      communicator.communicators,
      createCommunicatorAction,
      editCommunicatorAction,
    ],
  );

  const containerProps: ContainerProps = useMemo(() => {
    return {
      communicatorBoards,
      currentCommunicator,
      communicators: visibleCommunicators,
      availableBoards: board.boards,
      userData: app.userData,
      language,
      activeBoardId: board.activeBoardId,
      dark: app.displaySettings.darkThemeActive,
      communicatorTour,
      cboardBoards,
      intl,
      communicatorRootBoardIds,
      createCommunicator: (comm: any) => createCommunicatorAction(comm),
      editCommunicator: (comm: any) => editCommunicatorAction(comm),
      deleteCommunicator: (communicatorId: string) =>
        deleteCommunicatorAction(communicatorId),
      changeCommunicator: (communicatorId: string) =>
        switchCommunicatorNavigation({ communicatorId, navigate }),
      switchBoard: (boardId: string) => boardsStore.switchBoard(boardId),
      navigate,
      addBoards: (boardsToAdd: Board[]) => boardsStore.addBoards(boardsToAdd),
      replaceBoard: (prev: Board, current: Board) =>
        boardsStore.replaceBoard({ prev, current }),
      showNotification,
      deleteBoard: (boardId: string) => boardsStore.deleteBoard(boardId),
      deleteApiBoard: async (boardId: string) => {
        await boardsStore.deleteRemoteBoard(boardId);
      },
      deleteBoardCommunicator: (boardId: string) =>
        deleteBoardCommunicatorAction(boardId),
      addBoardCommunicator: (boardId: string) =>
        addBoardCommunicatorAction(boardId),
      createBoard: (newBoard: Board) => boardsStore.createBoard(newBoard),
      createRemoteBoard: async ({
        board: boardToCreate,
        tempId,
      }: {
        board: Board;
        tempId: string;
      }) => boardsStore.createRemoteBoard({ board: boardToCreate, tempId }),
      updateBoard: (boardToUpdate: Board) =>
        boardsStore.updateBoard(boardToUpdate),
      upsertCommunicator,
      updateApiCommunicator: (comm: any) =>
        updateRemoteCommunicatorAction(comm),
      deleteApiCommunicator: async (communicatorId: string) => {
        await deleteRemoteCommunicatorAction(communicatorId);
      },
      syncBoardWithCommunicator: (
        parentBoard: Board,
        createCommunicatorFlag: boolean = false,
        createParentBoardFlag: boolean = false,
      ) =>
        boardsStore.syncBoardWithCommunicator({
          parentBoard,
          createCommunicator: createCommunicatorFlag,
          createParentBoard: createParentBoardFlag,
        }) as Promise<string>,
      updateApiBoard: async (boardToSync: Board) => {
        return boardsStore.updateRemoteBoard(boardToSync);
      },
      fetchBoardById: async (boardId: string) => {
        return boardsStore.fetchBoardById(boardId);
      },
      fetchMyBoards: async (params: BoardPageParams) => {
        return boardsStore.fetchUserBoardsPage(params);
      },
      reportBoard: async (reportData: Record<string, unknown>) => {
        await boardsStore.reportBoardToApi(reportData);
      },
      disableTour,
    };
  }, [
    app.displaySettings.darkThemeActive,
    app.userData,
    board.activeBoardId,
    board.boards,
    boardsStore,
    cboardBoards,
    createCommunicatorAction,
    deleteCommunicatorAction,
    changeCommunicatorAction,
    editCommunicatorAction,
    addBoardCommunicatorAction,
    deleteBoardCommunicatorAction,
    communicatorBoards,
    communicatorTour,
    currentCommunicator,
    disableTour,
    language,
    intl,
    navigate,
    showNotification,
    upsertCommunicator,
    updateRemoteCommunicatorAction,
    deleteRemoteCommunicatorAction,
    visibleCommunicators,
    communicatorRootBoardIds,
    communicator.communicators,
  ]);
  const [state, setState] = useState({
    loading: false,
    boards: containerProps.communicatorBoards,
    total: containerProps.communicatorBoards.length,
    selectedTab: TAB_INDEXES.COMMUNICATOR_BOARDS as number,
    totalPages: Math.ceil(
      containerProps.communicatorBoards.length / BOARDS_PAGE_LIMIT,
    ),
    page: 1,
    search: '',
    isSearchOpen: false,
    communicatorBoards: findBoards(containerProps.communicatorBoards, {}, 1),
    nextPageLoading: false,
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const onTabChange = useCallback(
    async (
      event: unknown,
      selectedTab: number = TAB_INDEXES.COMMUNICATOR_BOARDS,
    ) => {
      setState((prev) => ({ ...prev, selectedTab, loading: true }));
      const tabData = await doSearch('', 1, selectedTab, containerProps);
      setState((prev) => ({
        ...prev,
        ...tabData,
        selectedTab,
        page: 1,
        search: '',
        isSearchOpen: false,
        loading: false,
      }));
    },
    [containerProps],
  );

  const loadNextPage = useCallback(async () => {
    setState((prev) => ({ ...prev, nextPageLoading: true }));
    const page = state.page + 1;
    const { search, selectedTab, boards } = state;
    const tabData = await doSearch(search, page, selectedTab, containerProps);
    setState((prev) => ({
      ...prev,
      ...tabData,
      boards: boards.concat(tabData.boards),
      page: page,
      loading: false,
      nextPageLoading: false,
    }));
  }, [state, containerProps]);

  const onSearch = useCallback(
    async (search: string = state.search) => {
      setState((prev) => ({
        ...prev,
        search,
        boards: [],
        loading: true,
        page: 1,
        totalPages: 1,
      }));
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(async () => {
        const { boards, totalPages, total } = await doSearch(
          search,
          1,
          state.selectedTab,
          containerProps,
        );
        setState((prev) => ({
          ...prev,
          boards,
          page: 1,
          total,
          totalPages,
          loading: false,
        }));
      }, 500);
    },
    [state.search, state.selectedTab, containerProps],
  );

  const handleAddOrRemoveBoard = useCallback(
    async (board: Board) => {
      const result = await addOrRemoveBoard(
        board,
        state,
        containerProps as any,
      );
      if (result) {
        setState((prev) => ({ ...prev, ...result }));
      }
    },
    [state, containerProps],
  );

  const handleCopyBoard = useCallback(
    async (board: Board) => {
      setState((prev) => ({ ...prev, loading: true }));
      await copyBoard(board, containerProps as any);
      setState((prev) => ({ ...prev, loading: false }));
    },
    [containerProps],
  );

  const handlePublishBoard = useCallback(
    async (board: Board) => {
      await publishBoardAction(
        board,
        containerProps as any,
        ((updater: any) =>
          setState((prev: any) => ({ ...prev, ...updater(prev) }))) as any,
      );
    },
    [containerProps],
  );

  const handleBoardReport = useCallback(
    async (reportedBoardData: unknown) => {
      await boardReportAction(reportedBoardData as any, containerProps as any);
    },
    [containerProps],
  );

  const handleSetRootBoard = useCallback(
    async (board: Board) => {
      await setRootBoard(board, containerProps as any);
    },
    [containerProps],
  );

  const openSearchBar = useCallback(() => {
    setState((prev) => ({ ...prev, isSearchOpen: true }));
  }, []);

  const handleDeleteMyBoard = useCallback(
    async (board: Board) => {
      await deleteMyBoardAction(
        board,
        containerProps as any,
        ((updater: any) =>
          setState((prev: any) => ({ ...prev, ...updater(prev) }))) as any,
      );
    },
    [containerProps],
  );

  const handleUpdateMyBoard = useCallback(
    async (board: Board) => {
      await updateMyBoardAction(
        board,
        containerProps as any,
        ((updater: any) =>
          setState((prev: any) => ({ ...prev, ...updater(prev) }))) as any,
      );
    },
    [containerProps],
  );

  const limit = state.page * BOARDS_PAGE_LIMIT;
  const communicatorBoardsIds = containerProps.communicatorBoards.map(
    (b) => b.id,
  );
  const dialogProps = {
    ...containerProps,
    ...state,
    limit,
    communicator: containerProps.currentCommunicator,
    communicatorBoardsIds,
    addOrRemoveBoard: handleAddOrRemoveBoard,
    deleteMyBoard: handleDeleteMyBoard,
    updateMyBoard: handleUpdateMyBoard,
    publishBoard: handlePublishBoard,
    setRootBoard: handleSetRootBoard,
    copyBoard: handleCopyBoard,
    boardReport: handleBoardReport,
    loadNextPage,
    onTabChange,
    onSearch,
    openSearchBar,
    disableTour: containerProps.disableTour,
    open,
    onClose,
  };

  if (!open) {
    return null;
  }

  return <CommunicatorDialog {...(dialogProps as any)} />;
};

export default CommunicatorDialogContainer;
