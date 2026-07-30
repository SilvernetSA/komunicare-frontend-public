import { create } from 'zustand';

import { useAppStore } from '@/domains/app/stores/appStore';
import { applyLoginSuccessFactory } from './settingsStore/applyLoginSuccessFactory';
import { fetchSettingsFactory } from './settingsStore/fetchSettingsFactory';
import { persistSettingsFactory } from './settingsStore/persistSettingsFactory';

import type { Settings } from '@/types/settings';

const SETTINGS_CACHE_TTL_MS = 60 * 1000;

interface SettingsStoreState {
  fetchStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  updateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string;
  updateError?: string;
  lastFetchedAt?: string;
  lastUpdatedAt?: string;
}

const initialSettingsState: SettingsStoreState = {
  fetchStatus: 'idle',
  updateStatus: 'idle',
};

export interface SettingsStore extends SettingsStoreState {
  resetSettingsStatus: () => void;
  fetchSettings: () => Promise<Settings>;
  persistSettings: (settingsPatch: Partial<Settings>) => Promise<Settings>;
  applyLoginSuccess: (payload: unknown) => void;
}

export const useSettingsStore = create<SettingsStore>()((set) => {
  const settingsCache = {
    fetchedAt: 0,
    inFlight: null as Promise<Settings> | null,
    inFlightUserId: '',
    settings: null as Settings | null,
    ttlMs: SETTINGS_CACHE_TTL_MS,
    userId: '',
  };

  const getCurrentUserId = () =>
    String((useAppStore.getState().userData as any)?.id || '');

  return {
    ...initialSettingsState,

    resetSettingsStatus: () => {
      set({
        fetchStatus: 'idle',
        updateStatus: 'idle',
        error: undefined,
        updateError: undefined,
      });
    },

    fetchSettings: fetchSettingsFactory(settingsCache, getCurrentUserId, set),

    persistSettings: persistSettingsFactory(
      settingsCache,
      getCurrentUserId,
      set,
    ),

    applyLoginSuccess: applyLoginSuccessFactory(settingsCache),
  };
});
