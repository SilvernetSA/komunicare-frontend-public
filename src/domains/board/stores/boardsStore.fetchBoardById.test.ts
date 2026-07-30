// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  appStoreState: {
    userData: {},
  },
  apiClientGet: vi.fn(),
}));

vi.mock('@/domains/app/stores/appStore', () => ({
  useAppStore: {
    getState: () => mocks.appStoreState,
  },
}));

vi.mock('@/store/apiClient', () => ({
  apiClient: {
    get: mocks.apiClientGet,
  },
  getQueryParameters: (params: Record<string, unknown>) =>
    new URLSearchParams(params as Record<string, string>).toString(),
  setAuthTokenProvider: vi.fn(),
  setUnauthorizedHandler: vi.fn(),
}));

describe('boardsStore.fetchBoardById', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();
    mocks.apiClientGet.mockResolvedValue({ data: [] });
  });

  it('prefers the active communicator local copy by sourceBoardId', async () => {
    const { useBoardsStore } = await import('@/domains/board/stores/boardsStore');
    const { useCommunicatorsStore } = await import(
      '@/domains/communicator/stores/communicatorsStore'
    );

    useCommunicatorsStore.setState({
      activeCommunicatorId: 'copy-comm',
      communicators: [
        {
          id: 'copy-comm',
          email: 'user@example.com',
          rootBoard: 'copy-root',
          boards: ['copy-root', 'personal-copy'],
          defaultBoardsIncluded: [],
        } as any,
      ],
      isFetching: false,
    });
    useBoardsStore.setState({
      boards: [
        {
          id: 'official-child',
          name: 'Official board',
          email: 'official@example.com',
          author: 'Komunicare',
          tiles: [],
        } as any,
        {
          id: 'personal-copy',
          sourceBoardId: 'official-child',
          name: 'Personal copy',
          email: 'user@example.com',
          author: 'User',
          tiles: [],
        } as any,
      ],
      activeBoardId: 'personal-copy',
      navHistory: ['personal-copy'],
    });

    const board = await useBoardsStore.getState().fetchBoardById('official-child');

    expect(board.id).toBe('personal-copy');
    expect(mocks.apiClientGet).not.toHaveBeenCalled();
  });
});
