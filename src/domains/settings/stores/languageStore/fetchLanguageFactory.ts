import { apiClient } from '@/store/apiClient';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { Language } from '@/types/language';

interface LanguageCache {
  byLang: Map<string, { fetchedAt: number; language: Language | null }>;
  inFlight: Map<string, Promise<Language | null>>;
  ttlMs: number;
}

export const fetchLanguageFactory =
  (cache: LanguageCache) =>
  async (lang: string): Promise<Language | null> => {
    const cachedEntry = cache.byLang.get(lang);
    const canUseCache =
      cachedEntry && Date.now() - cachedEntry.fetchedAt < cache.ttlMs;

    if (cachedEntry && canUseCache) {
      return cachedEntry.language;
    }

    const inFlightRequest = cache.inFlight.get(lang);
    if (inFlightRequest) {
      return await inFlightRequest;
    }

    const requestPromise = (async (): Promise<Language | null> => {
      try {
        let languageData: Language | null = null;
        try {
          const { status, data } = await apiClient.get(`/languages/${lang}`);
          if (status === 200) languageData = data as Language;
        } catch {
          languageData = null;
        }
        cache.byLang.set(lang, {
          language: languageData,
          fetchedAt: Date.now(),
        });
        return languageData;
      } finally {
        cache.inFlight.delete(lang);
      }
    })();

    cache.inFlight.set(lang, requestPromise);

    try {
      return await requestPromise;
    } catch (error) {
      console.error(getApiErrorMessage(error, 'Failed to fetch language'));
      return null;
    }
  };
