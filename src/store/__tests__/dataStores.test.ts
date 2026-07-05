// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  appStoreState: {
    userData: {} as Record<string, unknown>,
  },
  apiClientGet: vi.fn(),
  applySettingsPatchAction: vi.fn(),
}));

vi.mock('../appStore', () => ({
  useAppStore: {
    getState: () => mocks.appStoreState,
  },
}));

vi.mock('../apiClient', () => ({
  apiClient: {
    get: mocks.apiClientGet,
  },
  setAuthTokenProvider: vi.fn(),
  setUnauthorizedHandler: vi.fn(),
}));

vi.mock('../settingsStore/applySettingsPatch', () => ({
  applySettingsPatchAction: mocks.applySettingsPatchAction,
}));

// Mock stores that applySettingsPatch depends on to prevent initialization errors
vi.mock('../voicesStore', () => ({
  useSpeechStore: {
    getState: () => ({ changePitch: vi.fn(), changeRate: vi.fn() }),
  },
}));

vi.mock('../languageStore', () => ({
  useLanguageStore: { getState: () => ({ changeLang: vi.fn() }) },
}));

describe('zustand data stores cache', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.appStoreState.userData = {};
    mocks.apiClientGet.mockResolvedValue({ data: {} });
  });

  it('reuses cached settings for the same logged user', async () => {
    mocks.appStoreState.userData = { id: 'user-1' };
    mocks.apiClientGet.mockResolvedValue({
      data: { language: { lang: 'es-ES' } },
    });

    const { useSettingsStore } = await import('../settingsStore');

    const first = await useSettingsStore.getState().fetchSettings();
    const second = await useSettingsStore.getState().fetchSettings();

    expect(mocks.apiClientGet).toHaveBeenCalledTimes(1);
    expect(mocks.apiClientGet).toHaveBeenCalledWith('/settings');
    expect(mocks.applySettingsPatchAction).toHaveBeenCalledTimes(2);
    expect(second).toEqual(first);
  });

  it('reuses cached user data by id', async () => {
    mocks.apiClientGet.mockResolvedValue({
      data: { id: 'user-1', name: 'Juan Perez' },
    });

    const { useUserStore } = await import('../userStore');

    const first = await useUserStore.getState().getUserDataById('user-1');
    const second = await useUserStore.getState().getUserDataById('user-1');

    expect(mocks.apiClientGet).toHaveBeenCalledTimes(1);
    expect(mocks.apiClientGet).toHaveBeenCalledWith('/user/user-1');
    expect(second).toEqual(first);
  });

  it('reuses cached subscriber data by user id', async () => {
    mocks.apiClientGet.mockResolvedValue({
      data: { id: 'sub-1', userId: 'user-1', status: 'active' },
    });

    const { useSubscriberStore } = await import('../subscriberStore');

    const first = await useSubscriberStore
      .getState()
      .getSubscriber('user-1', 'tests');
    const second = await useSubscriberStore
      .getState()
      .getSubscriber('user-1', 'tests');

    expect(mocks.apiClientGet).toHaveBeenCalledTimes(1);
    expect(mocks.apiClientGet).toHaveBeenCalledWith(
      '/subscriber/user-1',
      expect.objectContaining({ headers: { requestOrigin: 'tests' } }),
    );
    expect(second).toEqual(first);
  });
});
