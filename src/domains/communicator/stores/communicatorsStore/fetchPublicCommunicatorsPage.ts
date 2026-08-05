import type { PaginatedResponse } from '@/types/api';
import type {
  Communicator,
  CommunicatorPageParams,
  CommunicatorPageResponse,
} from '@/types/communicator';

import { apiClient, getQueryParameters } from '@/store/apiClient';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';


export const COMMUNICATOR_PAGE_CACHE_TTL_MS = 30 * 1000;

export const fetchPublicCommunicatorsPageInFlight = new Map<
  string,
  Promise<CommunicatorPageResponse>
>();
export const cachedPublicCommunicatorsPages = new Map<
  string,
  { response: CommunicatorPageResponse; fetchedAt: number }
>();

export const resetPublicCommunicatorsPageCache = () => {
  fetchPublicCommunicatorsPageInFlight.clear();
  cachedPublicCommunicatorsPages.clear();
};

const getCommunicatorPageCacheKey = (
  params: CommunicatorPageParams = {},
): string => {
  return JSON.stringify({
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search ?? '',
  });
};

const normalizeCommunicatorPageResponse = (
  response:
    | Partial<CommunicatorPageResponse>
    | PaginatedResponse<Communicator>
    | Communicator[]
    | undefined,
  params: CommunicatorPageParams,
): CommunicatorPageResponse => {
  const data = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? (response.data as Communicator[])
      : [];

  return {
    data,
    total:
      typeof response === 'object' && response && 'total' in response
        ? (response as CommunicatorPageResponse).total
        : typeof response === 'object' && response && 'totalCount' in response
          ? Number(
              (response as PaginatedResponse<Communicator>).totalCount || 0,
            )
          : data.length,
    page:
      typeof response === 'object' && response && 'page' in response
        ? Number(
            (response as CommunicatorPageResponse).page || params.page || 1,
          )
        : params.page,
    limit:
      typeof response === 'object' && response && 'limit' in response
        ? Number(
            (response as CommunicatorPageResponse).limit || params.limit || 10,
          )
        : params.limit,
    offset:
      typeof response === 'object' && response && 'offset' in response
        ? Number((response as CommunicatorPageResponse).offset || 0)
        : undefined,
  };
};

export const fetchPublicCommunicatorsPage = async (
  params: CommunicatorPageParams = {},
): Promise<CommunicatorPageResponse> => {
  const cacheKey = getCommunicatorPageCacheKey(params);
  const cachedPage = cachedPublicCommunicatorsPages.get(cacheKey);
  const canUseCache =
    cachedPage &&
    Date.now() - cachedPage.fetchedAt < COMMUNICATOR_PAGE_CACHE_TTL_MS;

  if (canUseCache) {
    return cachedPage.response;
  }

  const inFlightRequest = fetchPublicCommunicatorsPageInFlight.get(cacheKey);
  if (inFlightRequest) {
    return await inFlightRequest;
  }

  const requestPromise = (async (): Promise<CommunicatorPageResponse> => {
    try {
      const query = getQueryParameters({
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        offset: 0,
        sort: '-_id',
        search: params.search ?? '',
      });
      const { data } = await apiClient.get<PaginatedResponse<Communicator>>(
        `/communicator/public?${query}`,
      );
      const normalizedResponse = normalizeCommunicatorPageResponse(
        data,
        params,
      );
      cachedPublicCommunicatorsPages.set(cacheKey, {
        response: normalizedResponse,
        fetchedAt: Date.now(),
      });
      return normalizedResponse;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Failed to fetch public communicators'),
      );
    } finally {
      fetchPublicCommunicatorsPageInFlight.delete(cacheKey);
    }
  })();

  fetchPublicCommunicatorsPageInFlight.set(cacheKey, requestPromise);

  try {
    return await requestPromise;
  } finally {
    fetchPublicCommunicatorsPageInFlight.delete(cacheKey);
  }
};
