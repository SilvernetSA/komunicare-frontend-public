import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../store/boardsStore', () => ({
  useBoardsStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../../store/communicatorsStore', () => ({
  useCommunicatorsStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../../utils/switchCommunicatorNavigation', () => ({
  switchCommunicatorNavigation: vi.fn(),
}));

import {
  handleLateBoardFallbackEffect,
  handleUrlBoardSyncEffect,
} from './effects';
import { useBoardsStore } from '../../../store/boardsStore';
import { useCommunicatorsStore } from '../../../store/communicatorsStore';
import { switchCommunicatorNavigation } from '../../../utils/switchCommunicatorNavigation';

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
      pathname: '/board/public-board',
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

  it('does not switch communicator when a fetched accessible URL board already belongs to the active communicator', async () => {
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
          boards: ['public-board'],
          id: 'comm-a',
          rootBoard: 'public-board',
        },
        {
          boards: ['other-board'],
          id: 'comm-b',
          rootBoard: 'other-board',
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
      pathname: '/board/public-board',
      lastNavigateTargetRef: { current: '' },
      loadingUrlBoardIdRef: { current: '' },
    });

    await flushEffect();

    expect(fetchBoardById).toHaveBeenCalledWith('public-board');
    expect(mockSwitchCommunicatorNavigation).not.toHaveBeenCalled();
    expect(changeBoard).toHaveBeenCalledWith('public-board');
    expect(navigate).not.toHaveBeenCalled();
    expect(setBlockedPrivateBoard).not.toHaveBeenCalled();
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
      pathname: '/board/private-board',
      lastNavigateTargetRef: { current: '' },
      loadingUrlBoardIdRef: { current: '' },
    });

    await flushEffect();

    expect(fetchBoardById).toHaveBeenCalledWith('private-board');
    expect(mockSwitchCommunicatorNavigation).not.toHaveBeenCalled();
    expect(changeBoard).not.toHaveBeenCalled();
    expect(setBlockedPrivateBoard).toHaveBeenCalledWith(true);
  });

  it('switches communicator before activating a local URL board owned by another communicator', async () => {
    const localBoard = {
      id: 'local-board',
      isFixed: false,
      isPublic: false,
      email: 'owner@example.com',
    } as any;
    const changeBoard = vi.fn();
    const fetchBoardById = vi.fn();
    const navigate = vi.fn();

    mockCommunicatorsStoreGetState.mockReturnValue({
      activeCommunicatorId: 'comm-a',
      communicators: [
        {
          boards: ['other-board'],
          id: 'comm-a',
          rootBoard: 'other-board',
        },
        {
          boards: ['local-board'],
          id: 'comm-b',
          rootBoard: 'local-board',
        },
      ],
    } as any);

    handleUrlBoardSyncEffect({
      urlId: 'local-board',
      activeBoardId: undefined,
      boards: [localBoard],
      changeBoard,
      fetchBoardById,
      userEmail: 'current@example.com',
      setBlockedPrivateBoard: vi.fn(),
      historyRemoveBoard: vi.fn(),
      navigate,
      pathname: '/board/local-board',
      lastNavigateTargetRef: { current: '' },
      loadingUrlBoardIdRef: { current: '' },
    });

    await flushEffect();

    expect(fetchBoardById).not.toHaveBeenCalled();
    expect(mockSwitchCommunicatorNavigation).toHaveBeenCalledWith({
      communicator: {
        boards: ['local-board'],
        id: 'comm-b',
        rootBoard: 'local-board',
      },
      navigate,
      skipBoardNavigation: true,
    });
    expect(changeBoard).toHaveBeenCalledWith('local-board');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not switch communicator when a local URL board already belongs to the active communicator', async () => {
    const localBoard = {
      id: 'local-board',
      isFixed: false,
      isPublic: false,
      email: 'owner@example.com',
    } as any;
    const changeBoard = vi.fn();
    const fetchBoardById = vi.fn();
    const navigate = vi.fn();

    mockCommunicatorsStoreGetState.mockReturnValue({
      activeCommunicatorId: 'comm-a',
      communicators: [
        {
          boards: ['local-board'],
          id: 'comm-a',
          rootBoard: 'local-board',
        },
        {
          boards: ['other-board'],
          id: 'comm-b',
          rootBoard: 'other-board',
        },
      ],
    } as any);

    handleUrlBoardSyncEffect({
      urlId: 'local-board',
      activeBoardId: undefined,
      boards: [localBoard],
      changeBoard,
      fetchBoardById,
      userEmail: 'current@example.com',
      setBlockedPrivateBoard: vi.fn(),
      historyRemoveBoard: vi.fn(),
      navigate,
      pathname: '/board/local-board',
      lastNavigateTargetRef: { current: '' },
      loadingUrlBoardIdRef: { current: '' },
    });

    await flushEffect();

    expect(fetchBoardById).not.toHaveBeenCalled();
    expect(mockSwitchCommunicatorNavigation).not.toHaveBeenCalled();
    expect(changeBoard).toHaveBeenCalledWith('local-board');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('switches communicator when the fallback board belongs to another communicator', async () => {
    const fallbackCommunicator = {
      boards: ['fallback-board'],
      id: 'comm-b',
      rootBoard: 'fallback-board',
    } as any;
    const changeBoard = vi.fn();
    const fetchBoardById = vi
      .fn()
      .mockRejectedValue(new Error('missing board'));
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
      pathname: '/board/missing-board',
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
    expect(navigate).toHaveBeenCalledWith('/board/fallback-board', {
      replace: true,
    });
  });

  it('does not switch communicator when the fallback board already belongs to the active communicator', async () => {
    const changeBoard = vi.fn();
    const fetchBoardById = vi
      .fn()
      .mockRejectedValue(new Error('missing board'));
    const historyRemoveBoard = vi.fn();
    const navigate = vi.fn();

    mockBoardsStoreGetState.mockReturnValue({
      activeBoardId: undefined,
      boards: [{ id: 'active-board' }],
    } as any);
    mockCommunicatorsStoreGetState.mockReturnValue({
      activeCommunicatorId: 'comm-a',
      communicators: [
        {
          boards: ['active-board'],
          id: 'comm-a',
          rootBoard: 'active-board',
        },
        {
          boards: ['other-board'],
          id: 'comm-b',
          rootBoard: 'other-board',
        },
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
      pathname: '/board/missing-board',
      lastNavigateTargetRef: { current: '' },
      loadingUrlBoardIdRef: { current: '' },
    });

    await flushEffect();

    expect(historyRemoveBoard).toHaveBeenCalledWith('missing-board');
    expect(mockSwitchCommunicatorNavigation).not.toHaveBeenCalled();
    expect(changeBoard).toHaveBeenCalledWith('active-board');
    expect(navigate).toHaveBeenCalledWith('/board/active-board', {
      replace: true,
    });
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
      pathname: '/board/missing-board',
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
    expect(navigate).toHaveBeenCalledWith('/board/fallback-board', {
      replace: true,
    });
  });

  it('does not switch communicator before activating a late fallback board already owned by the active communicator', async () => {
    const changeBoard = vi.fn();
    const historyRemoveBoard = vi.fn();
    const navigate = vi.fn();

    handleLateBoardFallbackEffect({
      isInitialized: true,
      activeBoardId: 'missing-active-board',
      boards: [{ id: 'active-board' } as any],
      communicators: [
        {
          boards: ['active-board'],
          id: 'comm-a',
          rootBoard: 'active-board',
        },
        {
          boards: ['other-board'],
          id: 'comm-b',
          rootBoard: 'other-board',
        },
      ],
      activeCommunicatorId: 'comm-a',
      urlId: 'missing-board',
      historyRemoveBoard,
      changeBoard,
      fetchBoardById: vi.fn(),
      navigate,
      pathname: '/board/missing-board',
      lastNavigateTargetRef: { current: '' },
    });

    await flushEffect();

    expect(historyRemoveBoard).toHaveBeenCalledWith('missing-board');
    expect(mockSwitchCommunicatorNavigation).not.toHaveBeenCalled();
    expect(changeBoard).toHaveBeenCalledWith('active-board');
    expect(navigate).toHaveBeenCalledWith('/board/active-board', {
      replace: true,
    });
  });
});
