// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loginFactory } from './loginFactory';

const mocks = vi.hoisted(() => ({
  apiClientPost: vi.fn(),
  fetchRemoteBoardsAction: vi.fn(),
  handleFirstLoginAction: vi.fn(),
  setVoicePreferencesAction: vi.fn(),
  appStoreState: {
    disableTour: vi.fn(),
    applyLoginSuccess: vi.fn(),
    enableAllTours: vi.fn(),
  },
  boardsStoreState: {
    resetActiveBoardSelection: vi.fn(),
    fetchSystemBoards: vi.fn(),
    addBoards: vi.fn(),
  },
  communicatorStoreState: {
    applyLoginSuccess: vi.fn(),
    fetchSystemCommunicators: vi.fn(),
    fetchMyCommunicators: vi.fn(),
  },
  languageStoreState: {
    applyLoginSuccess: vi.fn(),
  },
  speechStoreState: {
    applyLoginSuccess: vi.fn(),
  },
  settingsStoreState: {
    applyLoginSuccess: vi.fn(),
  },
  subscriptionStoreState: {
    applyLoginSuccess: vi.fn(),
  },
}));

vi.mock('@/store/apiClient', () => ({
  apiClient: {
    post: mocks.apiClientPost,
  },
}));

vi.mock('@/domains/app/stores/appStore', () => ({
  useAppStore: {
    getState: () => mocks.appStoreState,
  },
}));

vi.mock('@/domains/board/stores/boardsStore', () => ({
  useBoardsStore: {
    getState: () => mocks.boardsStoreState,
  },
}));

vi.mock('@/domains/communicator/stores/communicatorsStore', () => ({
  useCommunicatorsStore: {
    getState: () => mocks.communicatorStoreState,
  },
}));

vi.mock('@/domains/settings/stores/languageStore', () => ({
  useLanguageStore: {
    getState: () => mocks.languageStoreState,
  },
}));

vi.mock('@/domains/settings/stores/settingsStore', () => ({
  useSettingsStore: {
    getState: () => mocks.settingsStoreState,
  },
}));

vi.mock('@/domains/settings/stores/voicesStore', () => ({
  useSpeechStore: {
    getState: () => mocks.speechStoreState,
  },
}));

vi.mock('@/domains/subscription/stores/subscriptionStore', () => ({
  useSubscriptionStore: {
    getState: () => mocks.subscriptionStoreState,
  },
}));

vi.mock('./fetchRemoteBoards', () => ({
  fetchRemoteBoardsAction: mocks.fetchRemoteBoardsAction,
}));

vi.mock('./handleFirstLogin', () => ({
  handleFirstLoginAction: mocks.handleFirstLoginAction,
}));

vi.mock('./setVoicePreferences', () => ({
  setVoicePreferencesAction: mocks.setVoicePreferencesAction,
}));

describe('loginFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.apiClientPost.mockReset();
    mocks.fetchRemoteBoardsAction.mockResolvedValue([]);
    mocks.handleFirstLoginAction.mockResolvedValue(undefined);
    mocks.setVoicePreferencesAction.mockResolvedValue(undefined);
    mocks.boardsStoreState.fetchSystemBoards.mockResolvedValue(undefined);
    mocks.communicatorStoreState.fetchSystemCommunicators.mockResolvedValue(
      undefined,
    );
    mocks.communicatorStoreState.fetchMyCommunicators.mockResolvedValue([]);
  });

  it('refreshes user communicators before preloading remote boards on login', async () => {
    const steps: string[] = [];
    const loginData = {
      id: 'user-1',
      email: 'user@example.com',
      communicators: [],
    };

    mocks.apiClientPost.mockResolvedValue({ data: loginData });
    mocks.boardsStoreState.fetchSystemBoards.mockImplementation(async () => {
      steps.push('system-boards');
    });
    mocks.communicatorStoreState.fetchSystemCommunicators.mockImplementation(
      async () => {
        steps.push('system-communicators');
      },
    );
    mocks.communicatorStoreState.fetchMyCommunicators.mockImplementation(
      async () => {
        steps.push('my-communicators-start');
        await Promise.resolve();
        steps.push('my-communicators-end');
        return [];
      },
    );
    mocks.fetchRemoteBoardsAction.mockImplementation(async () => {
      steps.push('remote-boards');
      return [];
    });

    await loginFactory(vi.fn() as any)({
      email: 'user@example.com',
      password: 'secret',
    });

    expect(
      mocks.boardsStoreState.resetActiveBoardSelection,
    ).toHaveBeenCalledTimes(1);
    expect(mocks.boardsStoreState.fetchSystemBoards).toHaveBeenCalledTimes(1);
    expect(
      mocks.communicatorStoreState.fetchSystemCommunicators,
    ).toHaveBeenCalledWith({ force: false });
    expect(
      mocks.communicatorStoreState.fetchMyCommunicators,
    ).toHaveBeenCalledTimes(1);
    expect(mocks.fetchRemoteBoardsAction).toHaveBeenCalledWith(loginData);
    expect(steps.indexOf('system-boards')).toBeLessThan(
      steps.indexOf('my-communicators-start'),
    );
    expect(steps.indexOf('system-communicators')).toBeLessThan(
      steps.indexOf('my-communicators-start'),
    );
    expect(steps.indexOf('my-communicators-end')).toBeLessThan(
      steps.indexOf('remote-boards'),
    );
  });
});
