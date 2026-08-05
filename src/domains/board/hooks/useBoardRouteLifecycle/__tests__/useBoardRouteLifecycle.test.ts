// @vitest-environment jsdom
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  useBoardRouteLifecycle,
} from '../useBoardRouteLifecycle';

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

type HookParams = Parameters<typeof useBoardRouteLifecycle>[0];

const buildHookParams = (overrides: Partial<HookParams> = {}): HookParams => ({
  urlCommunicatorId: 'copy-comm',
  urlId: 'official-child',
  activeBoardId: 'official-child',
  boards: [],
  changeBoard: vi.fn(),
  fetchBoardById: vi.fn(),
  userEmail: 'user@example.com',
  setBlockedPrivateBoard: vi.fn(),
  historyRemoveBoard: vi.fn(),
  navigate: vi.fn(),
  pathname: '/communicator/copy-comm/board/official-child',
  communicators: [],
  activeCommunicatorId: undefined,
  getApiObjects: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const UseBoardRouteLifecycleTestHarness = ({
  params,
}: {
  params: HookParams;
}) => {
  useBoardRouteLifecycle(params);
  return null;
};

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
    expect(mockSwitchCommunicatorNavigation).not.toHaveBeenCalled();
    expect(changeBoard).toHaveBeenCalledWith('personal-copy');
    expect(changeBoard).not.toHaveBeenCalledWith('official-child');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('prefers the URL communicator scoped copy before active communicator hydration finishes', async () => {
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
    const copyCommunicator = {
      boards: ['personal-copy'],
      copySource: 'official-comm',
      id: 'copy-comm',
      rootBoard: 'personal-copy',
    };

    mockCommunicatorsStoreGetState.mockReturnValue({
      activeCommunicatorId: undefined,
      communicators: [
        {
          boards: ['official-child'],
          id: 'official-comm',
          rootBoard: 'official-child',
        },
        copyCommunicator,
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
    expect(mockSwitchCommunicatorNavigation).toHaveBeenCalledWith({
      communicator: copyCommunicator,
      navigate,
      skipBoardNavigation: true,
    });
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
    const setBlockedPrivateBoard = vi.fn();

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
      setBlockedPrivateBoard,
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
    expect(setBlockedPrivateBoard).not.toHaveBeenCalled();
  });

  it('activates the communicator-scoped copied root when the URL keeps the canonical root id', async () => {
    const copiedRootBoard = {
      id: 'copy-root',
      sourceBoardId: 'komunicare',
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
          boards: ['copy-root', 'feelingsBoard'],
          copySource: 'komunicare',
          id: 'copy-comm',
          rootBoard: 'feelingsBoard',
        },
      ],
    } as any);

    handleUrlBoardSyncEffect({
      urlId: 'komunicare',
      activeBoardId: undefined,
      boards: [copiedRootBoard],
      changeBoard,
      fetchBoardById,
      userEmail: 'user@example.com',
      setBlockedPrivateBoard: vi.fn(),
      historyRemoveBoard: vi.fn(),
      navigate,
      pathname: '/communicator/copy-comm/board/komunicare',
      lastNavigateTargetRef: { current: '' },
      loadingUrlBoardIdRef: { current: '' },
    });

    await flushEffect();

    expect(fetchBoardById).not.toHaveBeenCalled();
    expect(mockSwitchCommunicatorNavigation).not.toHaveBeenCalled();
    expect(changeBoard).toHaveBeenCalledWith('copy-root');
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
    expect(navigate).toHaveBeenCalledWith(
      '/communicator/comm-a/board/fallback-board',
      {
        replace: true,
      },
    );
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
    expect(navigate).toHaveBeenCalledWith(
      '/communicator/comm-a/board/active-board',
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
    expect(navigate).toHaveBeenCalledWith(
      '/communicator/comm-a/board/fallback-board',
      {
        replace: true,
      },
    );
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
    expect(navigate).toHaveBeenCalledWith(
      '/communicator/comm-a/board/active-board',
      {
        replace: true,
      },
    );
  });
});

describe('useBoardRouteLifecycle', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.clearAllMocks();
  });

  it('resolves the URL board immediately against the URL communicator during bootstrap', async () => {
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
    const communicators = [
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
    ] as any;
    const changeBoard = vi.fn();
    const changeCommunicator = vi.fn();

    let communicatorState = {
      activeCommunicatorId: 'official-comm',
      communicators,
      changeCommunicator,
    } as any;

    mockBoardsStoreGetState.mockReturnValue({
      activeBoardId: 'official-child',
      boards: [officialBoard, copiedBoard],
    } as any);
    mockCommunicatorsStoreGetState.mockImplementation(() => communicatorState);

    const initialParams = buildHookParams({
      activeBoardId: 'official-child',
      activeCommunicatorId: 'official-comm',
      boards: [officialBoard, copiedBoard],
      changeBoard,
      communicators,
      fetchBoardById: vi.fn(),
    });

    await act(async () => {
      root.render(
        React.createElement(UseBoardRouteLifecycleTestHarness, {
          params: initialParams,
        }),
      );

      await flushEffect();
    });

    expect(changeCommunicator).toHaveBeenCalledWith('copy-comm');
    expect(changeBoard).toHaveBeenCalledWith('personal-copy');
  });

  it('forces the exact URL board from the URL communicator when startup still points at an official board', async () => {
    const copiedRootBoard = {
      id: 'copied-root',
      isFixed: false,
      isPublic: false,
      email: 'user@example.com',
    } as any;
    const officialRootBoard = {
      id: 'komunicare',
      isFixed: false,
      isPublic: false,
      email: 'official@example.com',
    } as any;
    const communicators = [
      {
        boards: ['komunicare', 'official-child'],
        id: 'official-comm',
        rootBoard: 'komunicare',
      },
      {
        boards: ['copied-root', 'official-child'],
        copySource: 'komunicare',
        id: 'copy-comm',
        rootBoard: 'copied-root',
      },
    ] as any;
    const changeBoard = vi.fn();
    const changeCommunicator = vi.fn();
    const fetchBoardById = vi.fn().mockResolvedValue(copiedRootBoard);

    mockBoardsStoreGetState.mockReturnValue({
      activeBoardId: 'komunicare',
      boards: [officialRootBoard],
    } as any);
    mockCommunicatorsStoreGetState.mockReturnValue({
      activeCommunicatorId: 'official-comm',
      communicators,
      changeCommunicator,
    } as any);

    const params = buildHookParams({
      activeBoardId: 'komunicare',
      activeCommunicatorId: 'official-comm',
      boards: [officialRootBoard],
      changeBoard,
      communicators,
      fetchBoardById,
      urlCommunicatorId: 'copy-comm',
      urlId: 'copied-root',
      pathname: '/communicator/copy-comm/board/copied-root',
    });

    await act(async () => {
      root.render(
        React.createElement(UseBoardRouteLifecycleTestHarness, {
          params,
        }),
      );

      await flushEffect();
    });

    expect(fetchBoardById).toHaveBeenCalledWith('copied-root');
    expect(changeCommunicator).toHaveBeenCalledWith('copy-comm');
    expect(changeBoard).toHaveBeenCalledWith('copied-root');
    expect(changeBoard).not.toHaveBeenCalledWith('komunicare');
  });
});
