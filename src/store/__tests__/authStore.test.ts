// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  appStoreState: {
    userData: {} as Record<string, unknown>,
    setUnloggedUserLocation: vi.fn(),
    applyLogout: vi.fn(),
    disableTour: vi.fn(),
    applyLoginSuccess: vi.fn(),
  },
  boardsStoreState: {
    addBoards: vi.fn(),
    applyLogout: vi.fn(),
  },
  communicatorStoreState: {
    applyLoginSuccess: vi.fn(),
    applyLogout: vi.fn(),
  },
  languageStoreState: {
    applyLoginSuccess: vi.fn(),
  },
  settingsStoreState: {
    applyLoginSuccess: vi.fn(),
  },
  subscriptionStoreState: {
    applyLoginSuccess: vi.fn(),
    applyLogout: vi.fn(),
  },
  speechStoreState: {
    applyLoginSuccess: vi.fn(),
  },
  setAuthTokenProvider: vi.fn(),
  setUnauthorizedHandler: vi.fn(),
  apiClientGet: vi.fn(),
  fetchRemoteBoardsAction: vi.fn(),
  handleFirstLoginAction: vi.fn(),
  setVoicePreferencesAction: vi.fn(),
  loginUserApi: vi.fn(),
  requestPasswordResetApi: vi.fn(),
  changePasswordApi: vi.fn(),
}));

vi.mock('../apiClient', () => ({
  apiClient: {
    get: mocks.apiClientGet,
  },
  setAuthTokenProvider: mocks.setAuthTokenProvider,
  setUnauthorizedHandler: mocks.setUnauthorizedHandler,
}));

vi.mock('../appStore', () => ({
  useAppStore: {
    getState: () => mocks.appStoreState,
  },
}));

vi.mock('../boardsStore', () => ({
  useBoardsStore: {
    getState: () => mocks.boardsStoreState,
  },
}));

vi.mock('../communicatorsStore', () => ({
  useCommunicatorsStore: {
    getState: () => mocks.communicatorStoreState,
  },
}));

vi.mock('../languageStore', () => ({
  useLanguageStore: {
    getState: () => mocks.languageStoreState,
  },
}));

vi.mock('../settingsStore', () => ({
  useSettingsStore: {
    getState: () => mocks.settingsStoreState,
  },
}));

vi.mock('../subscriptionStore', () => ({
  useSubscriptionStore: {
    getState: () => mocks.subscriptionStoreState,
  },
}));

vi.mock('../voicesStore', () => ({
  useSpeechStore: {
    getState: () => mocks.speechStoreState,
  },
}));

vi.mock('../authStore/fetchRemoteBoards', () => ({
  fetchRemoteBoardsAction: mocks.fetchRemoteBoardsAction,
}));

vi.mock('../authStore/handleFirstLogin', () => ({
  handleFirstLoginAction: mocks.handleFirstLoginAction,
}));

vi.mock('../authStore/setVoicePreferences', () => ({
  setVoicePreferencesAction: mocks.setVoicePreferencesAction,
}));

vi.mock('../authStore/loginUserApi', () => ({
  loginUserApi: mocks.loginUserApi,
}));

vi.mock('../authStore/requestPasswordResetApi', () => ({
  requestPasswordResetApi: mocks.requestPasswordResetApi,
}));

vi.mock('../authStore/changePasswordApi', () => ({
  changePasswordApi: mocks.changePasswordApi,
}));

describe('authStore cache', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.appStoreState.userData = {};
  });

  it('reuses the cached user location', async () => {
    mocks.apiClientGet.mockResolvedValue({
      data: {
        country: 'Argentina',
        countryCode: 'AR',
      },
    });

    const { useAuthStore } = await import('../authStore');

    const first = await useAuthStore.getState().getUserLocation();
    const second = await useAuthStore.getState().getUserLocation();

    expect(mocks.setUnauthorizedHandler).toHaveBeenCalledTimes(1);
    expect(mocks.setAuthTokenProvider).toHaveBeenCalledTimes(1);
    expect(mocks.apiClientGet).toHaveBeenCalledTimes(1);
    expect(mocks.apiClientGet).toHaveBeenCalledWith('/location');
    expect(second).toEqual(first);
  });

  it('reuses cached auth user data by id', async () => {
    mocks.apiClientGet.mockResolvedValue({
      data: {
        id: 'user-1',
        name: 'Juan Perez',
      },
    });

    const { useAuthStore } = await import('../authStore');

    const first = await useAuthStore.getState().getUserData('user-1');
    const second = await useAuthStore.getState().getUserData('user-1');

    expect(mocks.apiClientGet).toHaveBeenCalledTimes(1);
    expect(mocks.apiClientGet).toHaveBeenCalledWith('/user/user-1');
    expect(second).toEqual(first);
  });
});
