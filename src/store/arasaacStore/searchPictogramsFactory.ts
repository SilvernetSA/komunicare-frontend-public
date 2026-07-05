import { ARASAAC_BASE_PATH_API } from '../../constants';
import { apiClient } from '../apiClient';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

interface ArasaacSearchCache {
  byQuery: Map<string, { data: any[]; fetchedAt: number }>;
  inFlight: Map<string, Promise<any[]>>;
  ttlMs: number;
}

export const searchPictogramsFactory =
  (cache: ArasaacSearchCache) =>
  async (locale: string, searchText: string): Promise<any[]> => {
    const cacheKey = `${locale}:${searchText}`;
    const cachedEntry = cache.byQuery.get(cacheKey);
    const canUseCache =
      cachedEntry && Date.now() - cachedEntry.fetchedAt < cache.ttlMs;

    if (cachedEntry && canUseCache) {
      return cachedEntry.data;
    }

    const inFlightRequest = cache.inFlight.get(cacheKey);
    if (inFlightRequest) {
      return await inFlightRequest;
    }

    const requestPromise = (async (): Promise<any[]> => {
      try {
        const path = `${ARASAAC_BASE_PATH_API}pictograms/${locale}/search/${searchText}`;
        let pictograms: any[] = [];
        try {
          const { status, data } = await apiClient.get(path);
          if (status === 200) pictograms = data as any[];
        } catch {
          pictograms = [];
        }
        cache.byQuery.set(cacheKey, {
          data: pictograms,
          fetchedAt: Date.now(),
        });
        return pictograms;
      } finally {
        cache.inFlight.delete(cacheKey);
      }
    })();

    cache.inFlight.set(cacheKey, requestPromise);

    try {
      return await requestPromise;
    } catch (error) {
      console.error(getApiErrorMessage(error, 'Failed to search pictograms'));
      return [];
    }
  };
