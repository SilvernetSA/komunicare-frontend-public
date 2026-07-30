import { apiClient } from '@/store/apiClient';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

interface ArasaacImageCache {
  byPath: Map<string, { fetchedAt: number; url: string }>;
  inFlight: Map<string, Promise<string>>;
  ttlMs: number;
}

export const getImageUrlFactory =
  (cache: ArasaacImageCache) =>
  async (pictogGetTextPath: string): Promise<string> => {
    const cachedEntry = cache.byPath.get(pictogGetTextPath);
    const canUseCache =
      cachedEntry && Date.now() - cachedEntry.fetchedAt < cache.ttlMs;

    if (cachedEntry && canUseCache) {
      return cachedEntry.url;
    }

    const inFlightRequest = cache.inFlight.get(pictogGetTextPath);
    if (inFlightRequest) {
      return await inFlightRequest;
    }

    const requestPromise = (async (): Promise<string> => {
      try {
        let imageUrl = '';
        try {
          const { status, data } = await apiClient.get(pictogGetTextPath);
          if (status === 200) imageUrl = (data as any).image || '';
        } catch {
          imageUrl = '';
        }
        cache.byPath.set(pictogGetTextPath, {
          url: imageUrl,
          fetchedAt: Date.now(),
        });
        return imageUrl;
      } finally {
        cache.inFlight.delete(pictogGetTextPath);
      }
    })();

    cache.inFlight.set(pictogGetTextPath, requestPromise);

    try {
      return await requestPromise;
    } catch (error) {
      console.error(getApiErrorMessage(error, 'Failed to fetch image URL'));
      return '';
    }
  };
