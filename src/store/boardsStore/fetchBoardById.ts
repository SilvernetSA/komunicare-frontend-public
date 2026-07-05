import { apiClient } from '../apiClient';
import { normalizeApiBoard } from './normalizeApiBoard';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type { Board } from '../../types/board';

export const FETCH_BOARD_BY_ID_CACHE_TTL_MS = 30 * 1000;
export const FETCH_BOARD_BY_ID_ERROR_TTL_MS = 5 * 1000;

export const fetchBoardByIdInFlight = new Map<string, Promise<Board>>();
export const cachedBoardsById = new Map<
  string,
  { board: Board; fetchedAt: number }
>();
export const failedBoardFetchById = new Map<string, number>();

export const resetBoardByIdCaches = () => {
  fetchBoardByIdInFlight.clear();
  cachedBoardsById.clear();
  failedBoardFetchById.clear();
};

export const fetchBoardById = async (
  boardId: string,
  getLocalBoard: () => Board | undefined,
  fetchSystemBoards: () => Promise<void>,
  getBoardAfterSystemFetch: () => Board | undefined,
): Promise<Board> => {
  const now = Date.now();
  const failedAt = failedBoardFetchById.get(boardId);
  if (failedAt && now - failedAt < FETCH_BOARD_BY_ID_ERROR_TTL_MS) {
    throw new Error(`Board fetch throttled after recent failure: ${boardId}`);
  }

  // 1. Check local store first (includes system boards)
  const localBoard = getLocalBoard();
  if (localBoard) {
    failedBoardFetchById.delete(boardId);
    return localBoard;
  }

  // 2. If not a valid MongoDB ObjectId, fetch system boards first
  const isMongoId = /^[a-f\d]{24}$/i.test(boardId);
  if (!isMongoId) {
    await fetchSystemBoards();
    const systemBoard = getBoardAfterSystemFetch();
    if (systemBoard) {
      failedBoardFetchById.delete(boardId);
      return systemBoard;
    }
    failedBoardFetchById.set(boardId, Date.now());
    throw new Error(`System board not found: ${boardId}`);
  }

  const cachedBoardEntry = cachedBoardsById.get(boardId);
  const canUseBoardCache =
    cachedBoardEntry &&
    Date.now() - cachedBoardEntry.fetchedAt < FETCH_BOARD_BY_ID_CACHE_TTL_MS;

  if (canUseBoardCache) {
    failedBoardFetchById.delete(boardId);
    return cachedBoardEntry.board;
  }

  const inFlightRequest = fetchBoardByIdInFlight.get(boardId);
  if (inFlightRequest) {
    return await inFlightRequest;
  }

  const requestPromise = (async (): Promise<Board> => {
    try {
      const { data } = await apiClient.get<Board>(`/board/${boardId}`);
      const normalized = normalizeApiBoard(data);
      if (!normalized) {
        throw new Error('Board not found');
      }
      cachedBoardsById.set(boardId, {
        board: normalized,
        fetchedAt: Date.now(),
      });
      failedBoardFetchById.delete(boardId);
      return normalized;
    } catch (error) {
      failedBoardFetchById.set(boardId, Date.now());
      const message = getApiErrorMessage(error, 'Failed to fetch board');
      const status = (error as any)?.response?.status;
      const err: any = new Error(message);
      if (status) {
        err.status = status;
      }
      throw err;
    } finally {
      fetchBoardByIdInFlight.delete(boardId);
    }
  })();

  fetchBoardByIdInFlight.set(boardId, requestPromise);

  try {
    return await requestPromise;
  } finally {
    fetchBoardByIdInFlight.delete(boardId);
  }
};
