import { apiClient, getQueryParameters } from '../apiClient';
import { normalizeBoardPageResponse } from './normalizeBoardPageResponse';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type { BoardPageParams, BoardPageResponse } from './types';
import type { PaginatedResponse } from '../../types/api';
import type { Board } from '../../types/board';

export const BOARD_PAGE_CACHE_TTL_MS = 30 * 1000;

export const fetchPublicBoardsPageInFlight = new Map<
  string,
  Promise<BoardPageResponse>
>();
export const cachedPublicBoardsPages = new Map<
  string,
  { response: BoardPageResponse; fetchedAt: number }
>();

export const resetPublicBoardsPageCache = () => {
  fetchPublicBoardsPageInFlight.clear();
  cachedPublicBoardsPages.clear();
};

export const getBoardPageCacheKey = (
  params: BoardPageParams = {},
  scope = '',
): string => {
  return JSON.stringify({
    scope,
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search ?? '',
  });
};

export const fetchPublicBoardsPage = async (
  params: BoardPageParams = {},
): Promise<BoardPageResponse> => {
  const cacheKey = getBoardPageCacheKey(params, 'public');
  const cachedPage = cachedPublicBoardsPages.get(cacheKey);
  const canUseCache =
    cachedPage && Date.now() - cachedPage.fetchedAt < BOARD_PAGE_CACHE_TTL_MS;

  if (canUseCache) {
    return cachedPage.response;
  }

  const inFlightRequest = fetchPublicBoardsPageInFlight.get(cacheKey);
  if (inFlightRequest) {
    return await inFlightRequest;
  }

  const requestPromise = (async (): Promise<BoardPageResponse> => {
    try {
      const query = getQueryParameters({
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        offset: 0,
        sort: '-_id',
        search: params.search ?? '',
      });
      const { data } = await apiClient.get<PaginatedResponse<Board>>(
        `/board/public?${query}`,
      );
      const normalisedResponse = normalizeBoardPageResponse(
        data as any,
        params,
      );
      cachedPublicBoardsPages.set(cacheKey, {
        response: normalisedResponse,
        fetchedAt: Date.now(),
      });
      return normalisedResponse;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Failed to fetch public boards'),
      );
    } finally {
      fetchPublicBoardsPageInFlight.delete(cacheKey);
    }
  })();

  fetchPublicBoardsPageInFlight.set(cacheKey, requestPromise);

  try {
    return await requestPromise;
  } finally {
    fetchPublicBoardsPageInFlight.delete(cacheKey);
  }
};
