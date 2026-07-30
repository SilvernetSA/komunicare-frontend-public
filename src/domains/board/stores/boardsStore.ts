import moment from 'moment';
import { create } from 'zustand';

import {
  mergeRemoteBoards,
  reconcileActiveBoardState,
} from './boardsStore/boardStateHelpers';
import { cloneInitialState } from './boardsStore/createInitialState';
import { createRemoteBoardFactory } from './boardsStore/createRemoteBoardFactory';
import { deleteRemoteBoardFactory } from './boardsStore/deleteRemoteBoardFactory';
import {
  fetchBoardById,
  resetBoardByIdCaches,
} from './boardsStore/fetchBoardById';
import {
  fetchPublicBoardsPage,
  resetPublicBoardsPageCache,
} from './boardsStore/fetchPublicBoardsPage';
import {
  fetchSystemBoards,
  initSystemBoardsCache,
} from './boardsStore/fetchSystemBoards';
import {
  fetchUserBoards,
  resetFetchUserBoardsCache,
} from './boardsStore/fetchUserBoards';
import {
  fetchUserBoardsPage,
  resetUserBoardsPageCache,
} from './boardsStore/fetchUserBoardsPage';
import { getApiObjects } from './boardsStore/getApiObjects';
import { reportBoardToApiFactory } from './boardsStore/reportBoardToApiFactory';
import { syncBoardsWithCommunicatorFactory } from './boardsStore/syncBoardsWithCommunicatorFactory';
import { syncBoardWithCommunicatorFactory } from './boardsStore/syncBoardWithCommunicatorFactory';
import {
  BoardPageParams,
  BoardPageResponse,
  BoardState,
} from './boardsStore/types';
import { updateApiMarkedBoards } from './boardsStore/updateApiMarkedBoards';
import { updateRemoteBoardFactory } from './boardsStore/updateRemoteBoardFactory';
import { upsertRemoteBoardFactory } from './boardsStore/upsertRemoteBoardFactory';
import {
  getCachedSystemBoards,
  getCachedSystemHashes,
} from './systemCatalogCache';

import type { Board, Tile } from '@/types/board';

// Initialise the system boards runtime cache from persisted data
const cachedSystemBoards = getCachedSystemBoards();
const cachedSystemHashes = getCachedSystemHashes();
initSystemBoardsCache(cachedSystemHashes.boardsHash || '');

const resetAllBoardPageCaches = () => {
  resetBoardByIdCaches();
  resetPublicBoardsPageCache();
  resetUserBoardsPageCache();
};

const resetAllUserBoardCaches = () => {
  resetFetchUserBoardsCache();
  resetAllBoardPageCaches();
};

const buildInitialBoardsState = (): BoardState => {
  const initialState = cloneInitialState();
  if (!cachedSystemBoards.length) {
    return initialState;
  }
  return {
    ...initialState,
    boards: mergeRemoteBoards(initialState.boards, cachedSystemBoards),
  };
};

export interface BoardsStore extends BoardState {
  importBoards: (boards: Board[]) => void;
  addBoards: (boards: Board[]) => void;
  createBoard: (board: Board) => void;
  updateBoard: (board: Board) => void;
  deleteBoard: (boardId: string) => void;
  replaceBoard: (payload: { prev: Board; current: Board }) => void;
  toRootBoard: () => void;
  changeBoard: (boardId: string) => void;
  previousBoard: () => void;
  historyRemoveBoard: (boardId: string) => void;
  unmarkBoard: (boardId: string) => void;
  switchBoard: (boardId: string) => void;
  createTile: (payload: { boardId: string; tile: Tile }) => void;
  deleteTiles: (payload: { boardId: string; tileIds: string[] }) => void;
  editTiles: (payload: { boardId: string; tiles: Tile[] }) => void;
  focusTile: (payload: { boardId: string; tileId: string }) => void;
  changeOutput: (output: Tile[]) => void;
  changeImprovedPhrase: (value: string, sourcePhrase?: string) => void;
  downloadImagesStarted: () => void;
  downloadImageSuccess: (payload: unknown) => void;
  applyLogout: () => void;
  fetchUserBoards: () => Promise<Board[]>;
  createRemoteBoard: (payload: {
    board: Board;
    tempId: string;
  }) => Promise<Board>;
  updateRemoteBoard: (board: Board) => Promise<Board>;
  deleteRemoteBoard: (boardId: string) => Promise<Board>;
  upsertRemoteBoard: (board: Board) => Promise<Board>;
  fetchBoardById: (boardId: string) => Promise<Board>;
  fetchPublicBoardsPage: (
    params?: BoardPageParams,
  ) => Promise<BoardPageResponse>;
  fetchUserBoardsPage: (params?: BoardPageParams) => Promise<BoardPageResponse>;
  reportBoardToApi: (reportData: Record<string, unknown>) => Promise<void>;
  getApiObjects: () => Promise<void>;
  fetchSystemBoards: () => Promise<void>;
  updateApiMarkedBoards: () => Promise<void>;
  syncBoardWithCommunicator: (args: {
    parentBoard: Board;
    createCommunicator?: boolean;
    createParentBoard?: boolean;
    previousBoardId?: string;
  }) => Promise<string>;
  syncBoardsWithCommunicator: (args: {
    childBoard: Board;
    parentBoard: Board;
    createCommunicator?: boolean;
    createParentBoard?: boolean;
    previousParentBoardId?: string;
  }) => Promise<string>;
}

export const useBoardsStore = create<BoardsStore>()((set, get) => ({
  ...buildInitialBoardsState(),

  // ── Simple inline actions ──────────────────────────────────────────────────

  importBoards: (boards) => set({ boards: boards.filter(Boolean) }),

  addBoards: (boards) =>
    set((state) => ({ boards: state.boards.concat(boards.filter(Boolean)) })),

  createBoard: (board) =>
    set((state) => ({
      boards: state.boards.concat({ ...board, lastEdited: moment().format() }),
    })),

  updateBoard: (board) => {
    set((state) => {
      const boards = [...state.boards];
      const index = boards.findIndex((item) => item.id === board.id);
      if (index === -1) return state;
      const nextBoard = { ...board, lastEdited: moment().format() };
      if (board.id !== 'komunicare') {
        boards.splice(index, 1, nextBoard);
      }
      return { ...state, boards };
    });
  },

  deleteBoard: (boardId) => {
    set((state) => {
      const nextBoards = state.boards.filter((board) => board.id !== boardId);
      const { activeBoardId, navHistory } = reconcileActiveBoardState(
        nextBoards,
        state.activeBoardId!,
        state.navHistory,
      );
      return { boards: nextBoards, activeBoardId, navHistory };
    });
  },

  replaceBoard: ({ prev, current }) => {
    if (!prev || !current) {
      console.warn('replaceBoard action missing prev/current payload', {
        prev,
        current,
      });
      return;
    }
    set((state) => {
      const nextHistory = [...state.navHistory];
      let nextBoards = [...state.boards];
      if (prev.id !== current.id) {
        const boardIndex = nextBoards.findIndex(
          (board) => board.id === prev.id,
        );
        if (boardIndex >= 0) {
          nextBoards[boardIndex] = current;
        } else {
          nextBoards.push(current);
        }
        const historyIndex = nextHistory.findIndex(
          (boardId) => boardId === prev.id,
        );
        if (historyIndex >= 0) nextHistory[historyIndex] = current.id;
      } else {
        const boardIndex = nextBoards.findIndex(
          (board) => board.id === current.id,
        );
        if (boardIndex >= 0) nextBoards[boardIndex] = current;
      }
      return {
        ...state,
        boards: nextBoards,
        navHistory: nextHistory,
        activeBoardId:
          state.activeBoardId === prev.id ? current.id : state.activeBoardId,
      };
    });
  },

  toRootBoard: () => {
    set((state) => {
      if (state.navHistory.length <= 1) return state;
      const rootId = state.navHistory[0];
      return { ...state, navHistory: [rootId], activeBoardId: rootId };
    });
  },

  changeBoard: (boardId) => {
    set((state) => {
      const target = state.boards.find((board) => board.id === boardId);
      if (!target) return state;
      return {
        ...state,
        navHistory: Array.from(new Set([...state.navHistory, boardId])),
        activeBoardId: boardId,
        isFixed: target.isFixed || false,
      };
    });
  },

  previousBoard: () => {
    set((state) => {
      const history = [...state.navHistory];
      if (history.length === 1) return state;
      history.pop();
      return {
        ...state,
        navHistory: history,
        activeBoardId: history[history.length - 1],
      };
    });
  },

  historyRemoveBoard: (boardId) => {
    set((state) => {
      if (state.navHistory.length < 2) return state;
      return {
        ...state,
        navHistory: state.navHistory.filter((id) => id !== boardId),
      };
    });
  },

  unmarkBoard: (boardId) => {
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id !== boardId ? board : { ...board, markToUpdate: false },
      ),
    }));
  },

  switchBoard: (boardId) => {
    // Guard against empty ids — they would seed navHistory with '' and later
    // produce a `/board/` (404) on back navigation.
    if (!boardId) return;
    set({ navHistory: [boardId], activeBoardId: boardId });
  },

  createTile: ({ boardId, tile }) => {
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id !== boardId
          ? board
          : { ...board, tiles: [...board.tiles, { ...tile }] },
      ),
    }));
  },

  deleteTiles: ({ boardId, tileIds }) => {
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id !== boardId
          ? board
          : {
              ...board,
              tiles: board.tiles.filter((tile) => !tileIds.includes(tile.id)),
            },
      ),
    }));
  },

  editTiles: ({ boardId, tiles }) => {
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id !== boardId
          ? board
          : {
              ...board,
              tiles: board.tiles.map(
                (tile) => tiles.find((item) => item.id === tile.id) || tile,
              ),
            },
      ),
    }));
  },

  focusTile: ({ boardId, tileId }) => {
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id !== boardId ? board : { ...board, focusedTileId: tileId },
      ),
    }));
  },

  changeOutput: (output) => set({ output: [...output] }),

  changeImprovedPhrase: (value, sourcePhrase = '') =>
    set({ improvedPhrase: value, improvedPhraseSource: sourcePhrase }),

  downloadImagesStarted: () => {
    set((state) =>
      Array.isArray(state.images) ? state : { ...state, images: [] },
    );
  },

  downloadImageSuccess: (payload) => {
    set((state) => ({ images: [...(state.images || []), payload] }));
  },

  applyLogout: () => {
    resetAllUserBoardCaches();
    set(cloneInitialState());
  },

  // ── Delegated async actions ────────────────────────────────────────────────

  fetchUserBoards: () => fetchUserBoards(set),

  createRemoteBoard: createRemoteBoardFactory(set, resetAllUserBoardCaches),

  updateRemoteBoard: updateRemoteBoardFactory(set, resetAllUserBoardCaches),

  deleteRemoteBoard: deleteRemoteBoardFactory(set, resetAllUserBoardCaches),

  upsertRemoteBoard: upsertRemoteBoardFactory(get),

  fetchBoardById: (boardId) =>
    fetchBoardById(
      boardId,
      () => get().boards.find((board) => board.id === boardId),
      () => get().fetchSystemBoards(),
      () => get().boards.find((board) => board.id === boardId),
    ),

  fetchPublicBoardsPage: (params) => fetchPublicBoardsPage(params),

  fetchUserBoardsPage: (params) => fetchUserBoardsPage(params),

  reportBoardToApi: reportBoardToApiFactory(),

  fetchSystemBoards: () => fetchSystemBoards(set, () => get().boards),

  getApiObjects: () =>
    getApiObjects(
      () => get().fetchSystemBoards(),
      () => get().fetchUserBoards(),
    ),

  updateApiMarkedBoards: () =>
    updateApiMarkedBoards(
      () => get().boards,
      (board) => get().updateRemoteBoard(board),
      (boardId) => get().unmarkBoard(boardId),
    ),

  syncBoardWithCommunicator: syncBoardWithCommunicatorFactory(get),

  syncBoardsWithCommunicator: syncBoardsWithCommunicatorFactory(get),
}));

export type { BoardPageParams, BoardPageResponse, BoardState };
