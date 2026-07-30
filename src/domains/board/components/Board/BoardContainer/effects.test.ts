import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/board/stores/boardsStore', () => ({
  useBoardsStore: {
    getState: vi.fn(),
  },
}));

vi.mock('@/domains/communicator/stores/communicatorsStore', () => ({
  useCommunicatorsStore: {
    getState: vi.fn(),
  },
}));

vi.mock('@/utils/switchCommunicatorNavigation', () => ({
  switchCommunicatorNavigation: vi.fn(),
}));

import {
  handleLateBoardFallbackEffect,
  handleUrlBoardSyncEffect,
} from './effects';
import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import { useCommunicatorsStore } from '@/domains/communicator/stores/communicatorsStore';
import { switchCommunicatorNavigation } from '@/utils/switchCommunicatorNavigation';

const mockBoardsStoreGetState = vi.mocked(useBoardsStore.getState);
const mockCommunicatorsStoreGetState = vi.mocked(
  useCommunicatorsStore.getState,
);
const mockSwitchCommunicatorNavigation = vi.mocked(
  switchCommunicatorNavigation,
);

const flushEffect = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

describe('handleUrlBoardSyncEffect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBoardsStoreGetState.mockReturnValue({
      activeBoardId: undefined,
      boards: [],
    } as any);
    mockCommunicatorsStoreGetState.mockReturnValue({
      activeCommunicatorId: undefined,
      communicators: [],
    } as any);
  });

  it('switches communicator before activating a fetched accessible URL board owned by another communicator', async () => {
    const board = {
      id: 'public-board',
      isFixed: false,
      isPublic: true,
      email: 'other@example.com',
    } as any;
    const changeBoard = vi.fn();
    const fetchBoardById = vi.fn().mockResolvedValue(board);
    const navigate = vi.fn();
    const setBlockedPrivateBoard = vi.fn();

    mockCommunicatorsStoreGetState.mockReturnValue({
      activeCommunicatorId: 'comm-a',
      communicators: [
        {
          boards: ['other-board'],
          id: 'comm-a',
          rootBoard: 'other-board',
        },
        {
          boards: ['public-board'],
          id: 'comm-b',
          rootBoard: 'public-board',
        },
      ],
    } as any);

    handleUrlBoardSyncEffect({
      urlId: 'public-board',
      activeBoardId: undefined,
      boards: [],
      changeBoard,
      fetchBoardById,
      userEmail: 'current@example.com',
      setBlockedPrivateBoard,
      historyRemoveBoard: vi.fn(),
      navigate,
      pathname: '/communicator/comm-a/board/public-board',
      lastNavigateTargetRef: { current: '' },
      loadingUrlBoardIdRef: { current: '' },
    });

    await flushEffect();

    expect(fetchBoardById).toHaveBeenCalledWith('public-board');
    expect(mockSwitchCommunicatorNavigation).toHaveBeenCalledWith({
      communicator: {
        boards: ['public-board'],
        id: 'comm-b',
        rootBoard: 'public-board',
      },
      navigate,
      skipBoardNavigation: true,
    });
    expect(changeBoard).toHaveBeenCalledWith('public-board');
    expect(navigate).not.toHaveBeenCalled();
    expect(setBlockedPrivateBoard).not.toHaveBeenCalled();
  });

  it('prefers the communicator-scoped copied board over a local exact-id URL match', async () => {
    const officialBoard = {
      id: 'official-child',
      isFixed: false,
      isPublic: false,
      email: 'official@example.com',
    } as any;
    const copiedBoard = {
      id: 'personal-copy',
      sourceBoardId: 'official-child',
      isFixed: false,
      isPublic: false,
      email: 'user@example.com',
    } as any;
    const changeBoard = vi.fn();
    const fetchBoardById = vi.fn();
    const navigate = vi.fn();

    mockCommunicatorsStoreGetState.mockReturnValue({
      activeCommunicatorId: 'copy-comm',
      communicators: [
        {
          boards: ['personal-copy'],
          copySource: 'official-comm',
          id: 'copy-comm',
          rootBoard: 'personal-copy',
        },
      ],
    } as any);

    handleUrlBoardSyncEffect({
      urlCommunicatorId: 'copy-comm',
      urlId: 'official-child',
      activeBoardId: undefined,
      boards: [officialBoard, copiedBoard],
      changeBoard,
      fetchBoardById,
      userEmail: 'user@example.com',
      setBlockedPrivateBoard: vi.fn(),
      historyRemoveBoard: vi.fn(),
      navigate,
      pathname: '/communicator/copy-comm/board/official-child',
      lastNavigateTargetRef: { current: '' },
      loadingUrlBoardIdRef: { current: '' },
    });

    await flushEffect();

    expect(fetchBoardById).not.toHaveBeenCalled();
    expect(changeBoard).toHaveBeenCalledWith('personal-copy');
    expect(changeBoard).not.toHaveBeenCalledWith('official-child');
    expect(mockSwitchCommunicatorNavigation).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('rechecks the latest URL communicator scoped copy before activating a fetched original board', async () => {
    const officialBoard = {
      id: 'official-child',
      isFixed: false,
      isPublic: false,
      email: 'official@example.com',
    } as any;
    const copiedBoard = {
      id: 'personal-copy',
      sourceBoardId: 'official-child',
      isFixed: false,
      isPublic: false,
      email: 'user@example.com',
    } as any;
    const changeBoard = vi.fn();
    const navigate = vi.fn();

    let boardState = {
      activeBoardId: undefined,
      boards: [] as any[],
    };
    let communicatorState = {
      activeCommunicatorId: undefined,
      communicators: [
        {
          boards: ['official-child'],
          id: 'official-comm',
          rootBoard: 'official-child',
        },
        {
          boards: ['personal-copy'],
          copySource: 'official-comm',
          id: 'copy-comm',
          rootBoard: 'personal-copy',
        },
      ],
    } as any;

    mockBoardsStoreGetState.mockImplementation(() => boardState as any);
    mockCommunicatorsStoreGetState.mockImplementation(() => communicatorState);

    const fetchBoardById = vi.fn().mockImplementation(async () => {
      boardState = {
        ...boardState,
        boards: [officialBoard, copiedBoard],
      };
      communicatorState = {
        ...communicatorState,
        activeCommunicatorId: 'copy-comm',
      };

      return officialBoard;
    });

    handleUrlBoardSyncEffect({
      urlCommunicatorId: 'copy-comm',
      urlId: 'official-child',
      activeBoardId: undefined,
      boards: [],
      changeBoard,
      fetchBoardById,
      userEmail: 'user@example.com',
      setBlockedPrivateBoard: vi.fn(),
      historyRemoveBoard: vi.fn(),
      navigate,
      pathname: '/communicator/copy-comm/board/official-child',
      lastNavigateTargetRef: { current: '' },
      loadingUrlBoardIdRef: { current: '' },
    });

    await flushEffect();

    expect(fetchBoardById).toHaveBeenCalledWith('official-child');
    expect(changeBoard).toHaveBeenCalledWith('personal-copy');
    expect(changeBoard).not.toHaveBeenCalledWith('official-child');
    expect(mockSwitchCommunicatorNavigation).not.toHaveBeenCalled();
  });

  it('blocks a fetched private board owned by another user', async () => {
    const board = {
      id: 'private-board',
      isFixed: false,
      isPublic: false,
      email: 'other@example.com',
    } as any;
    const changeBoard = vi.fn();
    const fetchBoardById = vi.fn().mockResolvedValue(board);
    const setBlockedPrivateBoard = vi.fn();

    handleUrlBoardSyncEffect({
      urlId: 'private-board',
      activeBoardId: undefined,
      boards: [],
      changeBoard,
      fetchBoardById,
      userEmail: 'current@example.com',
      setBlockedPrivateBoard,
      historyRemoveBoard: vi.fn(),
      navigate: vi.fn(),
      pathname: '/communicator/comm-a/board/private-board',
      lastNavigateTargetRef: { current: '' },
      loadingUrlBoardIdRef: { current: '' },
    });

    await flushEffect();

    expect(fetchBoardById).toHaveBeenCalledWith('private-board');
    expect(changeBoard).not.toHaveBeenCalled();
    expect(setBlockedPrivateBoard).toHaveBeenCalledWith(true);
  });

  it('switches communicator when the fallback board belongs to another communicator', async () => {
    const fallbackCommunicator = {
      boards: ['fallback-board'],
      id: 'comm-b',
      rootBoard: 'fallback-board',
    } as any;
    const changeBoard = vi.fn();
    const fetchBoardById = vi.fn().mockRejectedValue(new Error('missing board'));
    const historyRemoveBoard = vi.fn();
    const navigate = vi.fn();

    mockBoardsStoreGetState.mockReturnValue({
      activeBoardId: undefined,
      boards: [{ id: 'fallback-board' }],
    } as any);
    mockCommunicatorsStoreGetState.mockReturnValue({
      activeCommunicatorId: 'comm-a',
      communicators: [
        {
          boards: ['missing-root'],
          id: 'comm-a',
          rootBoard: 'missing-root',
        },
        fallbackCommunicator,
      ],
    } as any);

    handleUrlBoardSyncEffect({
      urlId: 'missing-board',
      activeBoardId: undefined,
      boards: [],
      changeBoard,
      fetchBoardById,
      userEmail: 'current@example.com',
      setBlockedPrivateBoard: vi.fn(),
      historyRemoveBoard,
      navigate,
      pathname: '/communicator/comm-a/board/missing-board',
      lastNavigateTargetRef: { current: '' },
      loadingUrlBoardIdRef: { current: '' },
    });

    await flushEffect();

    expect(historyRemoveBoard).toHaveBeenCalledWith('missing-board');
    expect(mockSwitchCommunicatorNavigation).toHaveBeenCalledWith({
      communicator: fallbackCommunicator,
      navigate,
      skipBoardNavigation: true,
    });
    expect(changeBoard).toHaveBeenCalledWith('fallback-board');
    expect(navigate).toHaveBeenCalledWith(
      '/communicator/comm-a/board/fallback-board',
      {
        replace: true,
      },
    );
  });
});

describe('handleLateBoardFallbackEffect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('switches communicator before activating a late fallback board owned by another communicator', async () => {
    const fallbackCommunicator = {
      boards: ['fallback-board'],
      id: 'comm-b',
      rootBoard: 'fallback-board',
    } as any;
    const changeBoard = vi.fn();
    const historyRemoveBoard = vi.fn();
    const navigate = vi.fn();

    handleLateBoardFallbackEffect({
      isInitialized: true,
      activeBoardId: 'missing-active-board',
      boards: [{ id: 'fallback-board' } as any],
      communicators: [
        {
          boards: ['missing-root'],
          id: 'comm-a',
          rootBoard: 'missing-root',
        },
        fallbackCommunicator,
      ],
      activeCommunicatorId: 'comm-a',
      urlId: 'missing-board',
      historyRemoveBoard,
      changeBoard,
      fetchBoardById: vi.fn(),
      navigate,
      pathname: '/communicator/comm-a/board/missing-board',
      lastNavigateTargetRef: { current: '' },
    });

    await flushEffect();

    expect(historyRemoveBoard).toHaveBeenCalledWith('missing-board');
    expect(mockSwitchCommunicatorNavigation).toHaveBeenCalledWith({
      communicator: fallbackCommunicator,
      navigate,
      skipBoardNavigation: true,
    });
    expect(changeBoard).toHaveBeenCalledWith('fallback-board');
    expect(navigate).toHaveBeenCalledWith(
      '/communicator/comm-a/board/fallback-board',
      {
        replace: true,
      },
    );
  });
});
