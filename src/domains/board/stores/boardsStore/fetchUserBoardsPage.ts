import { apiClient, getQueryParameters } from '@/store/apiClient';
import { useAppStore } from '@/domains/app/stores/appStore';
import {
  getBoardPageCacheKey,
  BOARD_PAGE_CACHE_TTL_MS,
} from './fetchPublicBoardsPage';
import { normalizeBoardPageResponse } from './normalizeBoardPageResponse';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { BoardPageParams, BoardPageResponse } from './types';
import type { PaginatedResponse } from '@/types/api';
import type { Board } from '@/types/board';

export const fetchUserBoardsPageInFlight = new Map<
  string,
  Promise<BoardPageResponse>
>();
export const cachedUserBoardsPages = new Map<
  string,
  { response: BoardPageResponse; fetchedAt: number }
>();

export const resetUserBoardsPageCache = () => {
  fetchUserBoardsPageInFlight.clear();
  cachedUserBoardsPages.clear();
};

export const fetchUserBoardsPage = async (
  params: BoardPageParams = {},
): Promise<BoardPageResponse> => {
  try {
    const user = useAppStore.getState().userData as any;
    if (!user?.email) {
      return normalizeBoardPageResponse(undefined, params);
    }

    const cacheKey = getBoardPageCacheKey(params, user.email);
    const cachedPage = cachedUserBoardsPages.get(cacheKey);
    const canUseCache =
      cachedPage && Date.now() - cachedPage.fetchedAt < BOARD_PAGE_CACHE_TTL_MS;

    if (canUseCache) {
      return cachedPage.response;
    }

    const inFlightRequest = fetchUserBoardsPageInFlight.get(cacheKey);
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
          `/board/byemail/${user.email}?${query}`,
        );
        const normalisedResponse = normalizeBoardPageResponse(
          data as any,
          params,
        );
        cachedUserBoardsPages.set(cacheKey, {
          response: normalisedResponse,
          fetchedAt: Date.now(),
        });
        return normalisedResponse;
      } finally {
        fetchUserBoardsPageInFlight.delete(cacheKey);
      }
    })();

    fetchUserBoardsPageInFlight.set(cacheKey, requestPromise);
    return await requestPromise;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch your boards'));
  }
};
