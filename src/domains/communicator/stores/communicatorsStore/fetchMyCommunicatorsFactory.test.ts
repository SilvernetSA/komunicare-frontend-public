// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchMyCommunicatorsFactory,
  resetCommunicatorsFetchCache,
} from './fetchMyCommunicatorsFactory';

const mocks = vi.hoisted(() => ({
  apiClientGet: vi.fn(),
  appStoreState: {
    userData: {
      email: 'user@example.com',
    },
  },
}));

vi.mock('@/store/apiClient', () => ({
  apiClient: {
    get: mocks.apiClientGet,
  },
  getQueryParameters: (params: Record<string, unknown>) =>
    new URLSearchParams(params as Record<string, string>).toString(),
}));

vi.mock('@/domains/app/stores/appStore', () => ({
  useAppStore: {
    getState: () => mocks.appStoreState,
  },
}));

describe('fetchMyCommunicatorsFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetCommunicatorsFetchCache();
  });

  it('reapplies getApiMyCommunicatorsSuccess on cache hits', async () => {
    const communicators = [
      {
        id: 'copy-comm',
        email: 'user@example.com',
        rootBoard: 'copy-root',
        boards: ['copy-root'],
        defaultBoardsIncluded: [],
      },
    ];
    const getApiMyCommunicatorsSuccess = vi.fn();
    const get = () => ({
      getApiMyCommunicatorsSuccess,
      setApiStarted: vi.fn(),
      setApiFailure: vi.fn(),
    });

    mocks.apiClientGet.mockResolvedValue({
      data: { data: communicators, total: 1 },
    });

    const fetchMyCommunicators = fetchMyCommunicatorsFactory(get as any);

    await fetchMyCommunicators();
    await fetchMyCommunicators();

    expect(mocks.apiClientGet).toHaveBeenCalledTimes(1);
    expect(getApiMyCommunicatorsSuccess).toHaveBeenCalledTimes(2);
    expect(getApiMyCommunicatorsSuccess).toHaveBeenNthCalledWith(2, {
      data: communicators,
    });
  });
});
