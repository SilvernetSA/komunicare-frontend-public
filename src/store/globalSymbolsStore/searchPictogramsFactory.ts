import { alpha2ToAlpha3T } from '@cospired/i18n-iso-languages';

import { GLOBALSYMBOLS_BASE_PATH_API } from '../../constants';
import { apiClient } from '../apiClient';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

interface GlobalSymbolsCache {
  byQuery: Map<string, { data: any[]; fetchedAt: number }>;
  inFlight: Map<string, Promise<any[]>>;
  ttlMs: number;
}

export const searchPictogramsFactory =
  (cache: GlobalSymbolsCache) =>
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
        let language = 'eng';

        if (locale.length === 3) {
          language = locale;
        }

        if (locale.length === 2) {
          language = alpha2ToAlpha3T(locale);
        }

        const path = `${GLOBALSYMBOLS_BASE_PATH_API}labels/search/?query=${searchText}&language=${language}&language_iso_format=639-3&limit=20`;
        let symbols: any[] = [];
        try {
          const { status, data } = await apiClient.get(path);
          if (status === 200) symbols = data as any[];
        } catch {
          symbols = [];
        }
        cache.byQuery.set(cacheKey, {
          data: symbols,
          fetchedAt: Date.now(),
        });
        return symbols;
      } finally {
        cache.inFlight.delete(cacheKey);
      }
    })();

    cache.inFlight.set(cacheKey, requestPromise);

    try {
      return await requestPromise;
    } catch (error) {
      console.error(
        getApiErrorMessage(error, 'Failed to search Global Symbols'),
      );
      return [];
    }
  };
