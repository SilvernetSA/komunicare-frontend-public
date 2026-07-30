import { apiClient, getQueryParameters } from '@/store/apiClient';
import { useAppStore } from '@/domains/app/stores/appStore';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { Communicator } from '@/types/communicator';
import type { CommunicatorsResponse } from '@/types/communicator/fetchMyCommunicators/FetchMyCommunicators';
import type { CommunicatorsStore } from '../communicatorsStore';

export const COMMUNICATORS_CACHE_TTL_MS = 5 * 1000;

export let fetchMyCommunicatorsInFlight: Promise<Communicator[]> | null = null;
export let lastFetchedCommunicatorsEmail = '';
export let lastFetchedCommunicatorsAt = 0;
export let lastFetchedCommunicators: Communicator[] = [];

export const resetCommunicatorsFetchCache = (): void => {
  lastFetchedCommunicatorsEmail = '';
  lastFetchedCommunicatorsAt = 0;
  lastFetchedCommunicators = [];
  fetchMyCommunicatorsInFlight = null;
};

const COMMUNICATORS_PAGE_SIZE = 100;

export const fetchMyCommunicatorsFactory =
  (get: () => CommunicatorsStore) =>
  async (options: { force?: boolean } = {}): Promise<Communicator[]> => {
    const { force = false } = options;
    const { email } = useAppStore.getState().userData as any;

    if (!email) {
      get().setApiFailure();
      return [];
    }

    const cacheAge = Date.now() - lastFetchedCommunicatorsAt;
    const canUseCache =
      !force &&
      lastFetchedCommunicatorsEmail === email &&
      lastFetchedCommunicatorsAt > 0 &&
      cacheAge < COMMUNICATORS_CACHE_TTL_MS;

    if (canUseCache) {
      get().getApiMyCommunicatorsSuccess({ data: lastFetchedCommunicators });
      return lastFetchedCommunicators;
    }

    if (!force && fetchMyCommunicatorsInFlight) {
      return await fetchMyCommunicatorsInFlight;
    }

    get().setApiStarted();

    const requestPromise = (async (): Promise<Communicator[]> => {
      try {
        const communicators: Communicator[] = [];
        let page = 1;
        let offset = 0;
        let total = 0;

        while (true) {
          const query = getQueryParameters({
            page,
            limit: COMMUNICATORS_PAGE_SIZE,
            offset,
            sort: '-_id',
            search: '',
          });
          const url = `/communicator/byemail/${email}?${query}`;
          const { data } = await apiClient.get<CommunicatorsResponse>(url);
          const currentPage = data?.data ?? [];

          if (!currentPage.length) {
            break;
          }

          communicators.push(...currentPage);
          total = Number(data?.total || total || 0);

          if (
            (total > 0 && communicators.length >= total) ||
            currentPage.length < COMMUNICATORS_PAGE_SIZE
          ) {
            break;
          }

          page += 1;
          offset += COMMUNICATORS_PAGE_SIZE;
        }

        lastFetchedCommunicatorsEmail = email;
        lastFetchedCommunicatorsAt = Date.now();
        lastFetchedCommunicators = communicators;
        get().getApiMyCommunicatorsSuccess({ data: communicators });
        return communicators;
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          'Unexpected communicator API error',
        );
        get().setApiFailure();
        throw new Error(message);
      }
    })();

    fetchMyCommunicatorsInFlight = requestPromise;

    try {
      return await requestPromise;
    } finally {
      if (fetchMyCommunicatorsInFlight === requestPromise) {
        fetchMyCommunicatorsInFlight = null;
      }
    }
  };
