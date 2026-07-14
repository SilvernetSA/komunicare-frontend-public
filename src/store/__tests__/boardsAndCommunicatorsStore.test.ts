// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  appStoreState: {
    userData: {} as Record<string, unknown>,
  },
  apiClientGet: vi.fn(),
  apiClientPost: vi.fn(),
}));

vi.mock('../appStore', () => ({
  useAppStore: {
    getState: () => mocks.appStoreState,
  },
}));

vi.mock('../apiClient', () => ({
  apiClient: {
    get: mocks.apiClientGet,
    post: mocks.apiClientPost,
  },
  getQueryParameters: (obj: Record<string, unknown> = {}): string => {
    return Object.keys(obj)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(obj[key]))}`,
      )
      .join('&');
  },
  setAuthTokenProvider: vi.fn(),
  setUnauthorizedHandler: vi.fn(),
}));

describe('boardsStore and communicatorsStore cache', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();
    mocks.appStoreState.userData = {};
    // Default: system board/communicator API returns empty arrays
    mocks.apiClientGet.mockResolvedValue({ data: [] });
  });

  it('reuses the cached user boards page for the same request', async () => {
    mocks.appStoreState.userData = { email: 'owner@example.com' };
    mocks.apiClientGet.mockImplementation((url: string) => {
      if (url.includes('/board/byemail/')) {
        return Promise.resolve({
          data: {
            data: [{ id: 'board-1', tiles: [], email: 'owner@example.com' }],
            total: 1,
          },
        });
      }
      return Promise.resolve({ data: [] });
    });

    const { useBoardsStore } = await import('../boardsStore');

    const first = await useBoardsStore
      .getState()
      .fetchUserBoardsPage({ page: 1, limit: 10 });
    const second = await useBoardsStore
      .getState()
      .fetchUserBoardsPage({ page: 1, limit: 10 });

    const boardByEmailCalls = mocks.apiClientGet.mock.calls.filter(
      ([url]: [string]) => url.includes('/board/byemail/'),
    );
    expect(boardByEmailCalls).toHaveLength(1);
    expect(boardByEmailCalls[0][0]).toContain('owner@example.com');
    expect(second).toEqual(first);
  });

  it('returns an empty paginated response without hitting the API when the user has no email', async () => {
    const { useBoardsStore } = await import('../boardsStore');

    const response = await useBoardsStore
      .getState()
      .fetchUserBoardsPage({ page: 2, limit: 10 });

    const boardByEmailCalls = mocks.apiClientGet.mock.calls.filter(
      ([url]: [string]) => url.includes('/board/byemail/'),
    );
    expect(boardByEmailCalls).toHaveLength(0);
    expect(response).toEqual({
      data: [],
      total: 0,
      page: 2,
      limit: 10,
      offset: undefined,
    });
  });

  it('reuses cached communicators for the same user', async () => {
    mocks.appStoreState.userData = { email: 'owner@example.com' };
    const mockCommunicator = {
      id: 'comm-1',
      boards: ['root'],
      defaultBoardsIncluded: [],
      rootBoard: 'root',
    };
    mocks.apiClientGet.mockImplementation((url: string) => {
      if (url.includes('/communicator/byemail/')) {
        return Promise.resolve({
          data: { data: [mockCommunicator], total: 1 },
        });
      }
      return Promise.resolve({ data: [] });
    });

    const { useCommunicatorsStore } = await import('../communicatorsStore');

    const first = await useCommunicatorsStore.getState().fetchMyCommunicators();
    const second = await useCommunicatorsStore
      .getState()
      .fetchMyCommunicators();

    const communicatorByEmailCalls = mocks.apiClientGet.mock.calls.filter(
      ([url]: [string]) => url.includes('/communicator/byemail/'),
    );
    expect(communicatorByEmailCalls).toHaveLength(1);
    expect(communicatorByEmailCalls[0][0]).toContain('owner@example.com');
    expect(second).toEqual(first);
  });

  it('replaces the local default communicator when the API returns official communicators', async () => {
    mocks.appStoreState.userData = { email: 'owner@example.com' };
    const myComms = [
      {
        id: 'comm-root',
        name: "Komunicare's Communicator",
        email: 'official-a@example.com',
        boards: ['root', 'jjmlUcQs19', 'komunicare'],
        defaultBoardsIncluded: [],
        rootBoard: 'root',
      },
      {
        id: 'comm-picseepal',
        name: "Komunicare's Communicator",
        email: 'official-b@example.com',
        boards: ['root', 'jjmlUcQs19', 'komunicare'],
        defaultBoardsIncluded: [],
        rootBoard: 'jjmlUcQs19',
      },
      {
        id: 'comm-komunicare',
        name: "Komunicare's Communicator",
        email: 'official-c@example.com',
        boards: ['root', 'jjmlUcQs19', 'komunicare'],
        defaultBoardsIncluded: [],
        rootBoard: 'komunicare',
      },
    ];
    mocks.apiClientGet.mockImplementation((url: string) => {
      if (url.includes('/communicator/byemail/')) {
        return Promise.resolve({
          data: { data: myComms, total: myComms.length },
        });
      }
      return Promise.resolve({ data: [] });
    });

    const { useCommunicatorsStore } = await import('../communicatorsStore');

    await useCommunicatorsStore.getState().fetchMyCommunicators();

    const state = useCommunicatorsStore.getState();
    expect(state.communicators.map((communicator) => communicator.id)).toEqual([
      'comm-root',
      'comm-picseepal',
      'comm-komunicare',
    ]);
    expect(state.activeCommunicatorId).toBe('comm-root');
  });

  it('loads only official API data when there is no logged user', async () => {
    const systemBoard = {
      id: 'komunicare',
      name: 'Mi tablero',
      author: 'Komunicare',
      email: 'info@komuni.care',
      tiles: [],
    };
    const systemComm = {
      id: 'comm-system',
      name: 'Official',
      description: '',
      author: 'Komunicare',
      email: 'info@komuni.care',
      rootBoard: 'komunicare',
      boards: ['komunicare'],
      defaultBoardsIncluded: [],
    };
    mocks.apiClientGet.mockImplementation((url: string) => {
      if (url.includes('/system-boards/public/boards')) {
        return Promise.resolve({ data: [systemBoard] });
      }
      if (url.includes('/system-boards/public/communicators')) {
        return Promise.resolve({ data: [systemComm] });
      }
      return Promise.resolve({ data: [] });
    });

    const { useBoardsStore } = await import('../boardsStore');
    const { useCommunicatorsStore } = await import('../communicatorsStore');

    await useBoardsStore.getState().getApiObjects();

    const boardApiCalls = mocks.apiClientGet.mock.calls.map(
      ([url]: [string]) => url,
    );
    expect(
      boardApiCalls.some((url) => url.includes('/system-boards/public/boards')),
    ).toBe(true);
    expect(
      boardApiCalls.some((url) =>
        url.includes('/system-boards/public/communicators'),
      ),
    ).toBe(true);
    expect(boardApiCalls.some((url) => url.includes('/board/byemail/'))).toBe(
      false,
    );
    expect(
      boardApiCalls.some((url) => url.includes('/communicator/byemail/')),
    ).toBe(false);
    expect(
      useBoardsStore
        .getState()
        .boards.some((board) => board.id === 'komunicare'),
    ).toBe(true);
    expect(
      useCommunicatorsStore
        .getState()
        .communicators.some(
          (communicator) => communicator.id === 'comm-system',
        ),
    ).toBe(true);
  });

  it('hydrates official boards and communicators from localStorage cache', async () => {
    localStorage.setItem(
      'komunicare-system-catalog-v1',
      JSON.stringify({
        version: 1,
        boards: [
          {
            id: 'root',
            name: 'Root',
            author: 'Komunicare',
            email: 'info@komuni.care',
            tiles: [],
          },
        ],
        communicators: [
          {
            id: 'comm-cache',
            name: 'Cached',
            description: '',
            author: 'Komunicare',
            email: 'info@komuni.care',
            rootBoard: 'root',
            boards: ['root'],
            defaultBoardsIncluded: [],
          },
        ],
        boardsHash: 'hash-boards',
        communicatorsHash: 'hash-communicators',
        boardsCheckedAt: Date.now(),
        communicatorsCheckedAt: Date.now(),
      }),
    );

    const { useBoardsStore } = await import('../boardsStore');
    const { useCommunicatorsStore } = await import('../communicatorsStore');

    expect(useBoardsStore.getState().boards.map((board) => board.id)).toContain(
      'root',
    );
    expect(
      useCommunicatorsStore
        .getState()
        .communicators.map((communicator) => communicator.id),
    ).toContain('comm-cache');
  });
});
