import { applySettingsPatchAction } from './applySettingsPatch';

import type { Settings } from '@/types/settings';

interface SettingsCache {
  fetchedAt: number;
  settings: Settings | null;
  userId: string;
}

export const applyLoginSuccessFactory =
  (cache: SettingsCache) => (payload: unknown) => {
    const settings = (payload as any)?.settings || {};

    if (settings) {
      cache.settings = settings;
      cache.fetchedAt = Date.now();
      cache.userId = String((payload as any)?.id || '');
      applySettingsPatchAction(settings);
    }
  };
