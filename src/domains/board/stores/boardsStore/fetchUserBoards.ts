import { apiClient, getQueryParameters } from '@/store/apiClient';
import { useAppStore } from '@/domains/app/stores/appStore';
import {
  mergeUserBoards,
  reconcileActiveBoardState,
} from './boardStateHelpers';
import { normalizeApiBoard } from './normalizeApiBoard';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { BoardState } from './types';
import type { PaginatedResponse } from '@/types/api';
import type { Board } from '@/types/board';

const BOARDS_PAGE_LIMIT = 100;
export const FETCH_USER_BOARDS_CACHE_TTL_MS = 5 * 1000;

export let fetchUserBoardsInFlight: Promise<Board[]> | null = null;
export let lastFetchedUserBoardsEmail = '';
export let lastFetchedUserBoardsAt = 0;
export let lastFetchedUserBoards: Board[] = [];

export const resetFetchUserBoardsCache = () => {
  fetchUserBoardsInFlight = null;
  lastFetchedUserBoardsEmail = '';
  lastFetchedUserBoardsAt = 0;
  lastFetchedUserBoards = [];
};

export const fetchUserBoards = async (
  set: (patch: any) => void,
): Promise<Board[]> => {
  const user = useAppStore.getState().userData as any;
  const userEmail = String(user?.email || '');

  if (!userEmail) {
    set({ isFetching: false });
    return [];
  }

  const cacheAge = Date.now() - lastFetchedUserBoardsAt;
  const canUseCache =
    lastFetchedUserBoardsEmail === userEmail &&
    lastFetchedUserBoardsAt > 0 &&
    cacheAge < FETCH_USER_BOARDS_CACHE_TTL_MS;

  if (canUseCache) {
    set((state: BoardState) => {
      const nextBoards = mergeUserBoards(
        state.boards,
        lastFetchedUserBoards,
        userEmail,
      );
      const hasChanges =
        nextBoards.length !== state.boards.length ||
        nextBoards.some((b, i) => b !== state.boards[i]);
      if (!hasChanges) {
        return state.isFetching ? { ...state, isFetching: false } : state;
      }
      return {
        ...state,
        isFetching: false,
        boards: nextBoards,
        ...reconcileActiveBoardState(
          nextBoards,
          state.activeBoardId!,
          state.navHistory,
        ),
      };
    });
    return lastFetchedUserBoards;
  }

  if (fetchUserBoardsInFlight && lastFetchedUserBoardsEmail === userEmail) {
    return await fetchUserBoardsInFlight;
  }

  set({ isFetching: true });

  const requestPromise = (async (): Promise<Board[]> => {
    const query = getQueryParameters({
      page: 1,
      limit: BOARDS_PAGE_LIMIT,
      offset: 0,
      sort: '-_id',
      search: '',
    });
    const url = `/board/byemail/${userEmail}?${query}`;
    const { data } = await apiClient.get<PaginatedResponse<Board>>(url);
    const remoteBoards = (data?.data || []).map((board) =>
      normalizeApiBoard(board),
    );

    lastFetchedUserBoardsEmail = userEmail;
    lastFetchedUserBoardsAt = Date.now();
    lastFetchedUserBoards = remoteBoards;

    set((state: BoardState) => {
      const nextBoards = mergeUserBoards(state.boards, remoteBoards, userEmail);
      return {
        ...state,
        isFetching: false,
        boards: nextBoards,
        ...reconcileActiveBoardState(
          nextBoards,
          state.activeBoardId!,
          state.navHistory,
        ),
      };
    });

    return remoteBoards;
  })();

  fetchUserBoardsInFlight = requestPromise;
  try {
    return await requestPromise;
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to load boards');
    set({ isFetching: false });
    throw new Error(message);
  } finally {
    if (fetchUserBoardsInFlight === requestPromise) {
      fetchUserBoardsInFlight = null;
    }
  }
};
