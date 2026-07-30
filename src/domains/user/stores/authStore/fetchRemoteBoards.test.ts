// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchRemoteBoardsAction } from './fetchRemoteBoards';

const mocks = vi.hoisted(() => ({
  apiClientGet: vi.fn(),
  boardsStoreState: {
    boards: [] as Array<Record<string, unknown>>,
  },
  communicatorStoreState: {
    activeCommunicatorId: 'comm-1',
    communicators: [] as Array<Record<string, unknown>>,
  },
}));

vi.mock('@/store/apiClient', () => ({
  apiClient: {
    get: mocks.apiClientGet,
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

const buildCommunicator = (overrides: Record<string, unknown> = {}) => ({
  id: 'comm-1',
  name: 'My communicator',
  author: 'Komunicare',
  email: 'info@komuni.care',
  rootBoard: 'root-board',
  boards: ['root-board', 'child-board', 'another-child-board'],
  defaultBoardsIncluded: [],
  ...overrides,
});

describe('fetchRemoteBoardsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.apiClientGet.mockReset();
    window.history.replaceState({}, '', '/');
    mocks.boardsStoreState.boards = [];
    mocks.communicatorStoreState.activeCommunicatorId = 'comm-1';
    mocks.communicatorStoreState.communicators = [buildCommunicator()];
  });

  it('preloads only the active communicator root board after login', async () => {
    mocks.apiClientGet.mockResolvedValue({
      data: {
        id: 'root-board',
        name: 'Root board',
        tiles: [],
      },
    });

    const result = await fetchRemoteBoardsAction({
      id: 'user-1',
      communicators: mocks.communicatorStoreState.communicators as any,
    } as any);

    expect(mocks.apiClientGet).toHaveBeenCalledTimes(1);
    expect(mocks.apiClientGet).toHaveBeenCalledWith('/board/root-board');
    expect(result).toEqual([
      {
        id: 'root-board',
        name: 'Root board',
        tiles: [],
      },
    ]);
  });

  it('prefers the store active communicator over stale login payload preferences', async () => {
    mocks.communicatorStoreState.activeCommunicatorId = 'personal-copy';
    mocks.communicatorStoreState.communicators = [
      buildCommunicator({
        id: 'official-comm',
        rootBoard: 'official-root',
        boards: ['official-root'],
      }),
      buildCommunicator({
        id: 'personal-copy',
        rootBoard: 'personal-root',
        boards: ['personal-root'],
        copySource: 'official-comm',
      }),
    ];
    mocks.apiClientGet.mockResolvedValue({
      data: {
        id: 'personal-root',
        name: 'Personal root',
        tiles: [],
      },
    });

    const result = await fetchRemoteBoardsAction({
      id: 'user-1',
      settings: { communicatorId: 'official-comm' },
      communicators: mocks.communicatorStoreState.communicators as any,
    } as any);

    expect(mocks.apiClientGet).toHaveBeenCalledWith('/board/personal-root');
    expect(result).toEqual([
      {
        id: 'personal-root',
        name: 'Personal root',
        tiles: [],
      },
    ]);
  });

  it('preloads the route board for an exact communicator copy URL', async () => {
    window.history.replaceState(
      {},
      '',
      '/communicator/6a63d175c23c1844bd1e69fc/board/6a63d174c23c18588b1e69f6',
    );
    mocks.communicatorStoreState.activeCommunicatorId = 'official-comm';
    mocks.communicatorStoreState.communicators = [
      buildCommunicator({
        id: 'official-comm',
        rootBoard: 'official-root',
        boards: ['official-root', 'official-child'],
      }),
      buildCommunicator({
        id: '6a63d175c23c1844bd1e69fc',
        rootBoard: 'copy-root',
        boards: ['copy-root', '6a63d174c23c18588b1e69f6'],
        copySource: 'official-comm',
      }),
    ];
    mocks.apiClientGet.mockResolvedValue({
      data: {
        id: '6a63d174c23c18588b1e69f6',
        name: 'Copied child board',
        tiles: [],
      },
    });

    const result = await fetchRemoteBoardsAction({
      id: 'user-1',
      settings: { communicatorId: 'official-comm' },
      communicators: mocks.communicatorStoreState.communicators as any,
    } as any);

    expect(mocks.apiClientGet).toHaveBeenCalledWith(
      '/board/6a63d174c23c18588b1e69f6',
    );
    expect(result).toEqual([
      {
        id: '6a63d174c23c18588b1e69f6',
        name: 'Copied child board',
        tiles: [],
      },
    ]);
  });
});
