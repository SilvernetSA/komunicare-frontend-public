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

vi.mock('@/utils/switchCommunicatorNavigation', () => ({
  switchCommunicatorNavigation: vi.fn(),
}));

import { useExistingCopyResolution } from '../useExistingCopyResolution';

import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import { switchCommunicatorNavigation } from '@/utils/switchCommunicatorNavigation';

type HookParams = Parameters<typeof useExistingCopyResolution>[0];

let latestHookResult: ReturnType<typeof useExistingCopyResolution> | null =
  null;

const mockBoardsStoreGetState = vi.mocked(useBoardsStore.getState);
const mockSwitchCommunicatorNavigation = vi.mocked(
  switchCommunicatorNavigation,
);

const buildParams = (overrides: Partial<HookParams> = {}): HookParams => ({
  activeBoard: {
    id: 'komunicare',
  } as any,
  communicator: {
    id: 'official-comm',
    rootBoard: 'komunicare',
    boards: ['komunicare', 'feelingsBoard'],
  } as any,
  communicators: [
    {
      id: 'copy-comm',
      rootBoard: 'feelingsBoard',
      boards: ['copy-root', 'feelingsBoard'],
    } as any,
  ],
  navigate: vi.fn(),
  switchBoard: vi.fn(),
  setSelectedTileIds: vi.fn(),
  setIsSelecting: vi.fn(),
  ...overrides,
});

const TestHarness = ({ params }: { params: HookParams }) => {
  latestHookResult = useExistingCopyResolution(params);
  return null;
};

describe('useExistingCopyResolution', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    latestHookResult = null;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    mockBoardsStoreGetState.mockReturnValue({
      boards: [],
    } as any);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.clearAllMocks();
  });

  const renderHook = (overrides: Partial<HookParams> = {}) => {
    const params = buildParams(overrides);

    act(() => {
      root.render(<TestHarness params={params} />);
    });

    expect(latestHookResult).not.toBeNull();

    return {
      getHook: () => latestHookResult!,
    };
  };

  it('routes canonical root existing copies to the copied root board instead of communicator root fallbacks', () => {
    const navigate = vi.fn();
    const switchBoard = vi.fn();
    const setSelectedTileIds = vi.fn();
    const setIsSelecting = vi.fn();
    const targetCommunicator = {
      id: 'copy-comm',
      rootBoard: 'feelingsBoard',
      boards: ['copy-root', 'feelingsBoard'],
    } as any;

    mockBoardsStoreGetState.mockReturnValue({
      boards: [
        {
          id: 'copy-root',
          sourceBoardId: 'komunicare',
        },
        {
          id: 'feelingsBoard',
        },
      ],
    } as any);

    const { getHook } = renderHook({
      communicators: [targetCommunicator],
      navigate,
      switchBoard,
      setSelectedTileIds,
      setIsSelecting,
    });

    act(() => {
      getHook().handleExistingCopyFound(targetCommunicator);
    });

    expect(getHook().existingCopyFoundOpen).toBe(true);

    act(() => {
      getHook().handleGoToExistingCopy();
    });

    expect(switchBoard).toHaveBeenCalledWith('copy-root');
    expect(mockSwitchCommunicatorNavigation).toHaveBeenCalledWith({
      communicator: targetCommunicator,
      navigate,
      skipBoardNavigation: true,
    });
    expect(navigate).toHaveBeenCalledWith(
      '/communicator/copy-comm/board/copy-root',
      { replace: true },
    );
    expect(setSelectedTileIds).toHaveBeenCalledWith([]);
    expect(setIsSelecting).toHaveBeenCalledWith(false);
  });
});
