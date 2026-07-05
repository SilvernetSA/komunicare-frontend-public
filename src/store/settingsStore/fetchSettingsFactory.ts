import { apiClient } from '../apiClient';
import { applySettingsPatchAction } from './applySettingsPatch';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type { Settings } from '../../types/settings';
import type { StoreSet } from '../_shared/createStoreActions';
import type { SettingsStore } from '../settingsStore';

interface SettingsCache {
  fetchedAt: number;
  inFlight: Promise<Settings> | null;
  inFlightUserId: string;
  settings: Settings | null;
  ttlMs: number;
  userId: string;
}

export const fetchSettingsFactory =
  (
    cache: SettingsCache,
    getCurrentUserId: () => string,
    set: StoreSet<SettingsStore>,
  ) =>
  async (): Promise<Settings> => {
    const userId = getCurrentUserId();
    const canUseCache =
      cache.settings &&
      cache.userId === userId &&
      cache.fetchedAt > 0 &&
      Date.now() - cache.fetchedAt < cache.ttlMs;

    if (canUseCache) {
      applySettingsPatchAction(cache.settings || {});
      set({ fetchStatus: 'succeeded', error: undefined });
      return cache.settings as Settings;
    }

    if (cache.inFlight && cache.inFlightUserId === userId) {
      return await cache.inFlight;
    }

    set({ fetchStatus: 'loading', error: undefined });

    const requestPromise = (async (): Promise<Settings> => {
      try {
        const { data } = await apiClient.get<Settings>('/settings');
        const settings = (data || {}) as Settings;
        cache.settings = settings;
        cache.fetchedAt = Date.now();
        cache.userId = userId;

        applySettingsPatchAction(settings);
        set({
          fetchStatus: 'succeeded',
          lastFetchedAt: new Date().toISOString(),
        });

        return settings;
      } catch (error) {
        const message = getApiErrorMessage(error, 'Unexpected settings error');
        set({ fetchStatus: 'failed', error: message });
        throw new Error(message);
      } finally {
        cache.inFlight = null;
        cache.inFlightUserId = '';
      }
    })();

    cache.inFlight = requestPromise;
    cache.inFlightUserId = userId;

    return await requestPromise;
  };
