import { apiClient } from '@/store/apiClient';
import { applySettingsPatchAction } from './applySettingsPatch';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { Settings } from '@/types/settings';
import type { StoreSet } from '@/store/_shared/createStoreActions';
import type { SettingsStore } from '../settingsStore';

interface SettingsCache {
  fetchedAt: number;
  settings: Settings | null;
  userId: string;
}

export const persistSettingsFactory =
  (
    cache: SettingsCache,
    getCurrentUserId: () => string,
    set: StoreSet<SettingsStore>,
  ) =>
  async (settingsPatch: Partial<Settings>): Promise<Settings> => {
    set({ updateStatus: 'loading', updateError: undefined });

    try {
      const { data } = await apiClient.post<Settings>(
        '/settings',
        settingsPatch,
      );
      const payload = (data || {}) as Settings;
      const effectivePatch: Partial<Settings> = {
        ...settingsPatch,
        ...payload,
      };

      cache.settings = {
        ...(cache.settings || {}),
        ...effectivePatch,
      } as Settings;
      cache.fetchedAt = Date.now();
      cache.userId = getCurrentUserId();

      applySettingsPatchAction(effectivePatch);
      set({
        updateStatus: 'succeeded',
        lastUpdatedAt: new Date().toISOString(),
      });

      return payload;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unexpected settings error');
      set({ updateStatus: 'failed', updateError: message });
      throw new Error(message);
    }
  };
