// @vitest-environment jsdom
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../useBoardRouteLifecycle/useBoardRouteLifecycle.activation', () => ({
  ensureBoardLoadedAndActivate: vi.fn(),
}));

vi.mock('@/domains/shared/providers/SpeechProvider/speechService', () => ({
  speak: vi.fn(),
}));

vi.mock('@/domains/app/stores/appStore', () => ({
  useAppStore: {
    getState: vi.fn(),
  },
}));

import { ensureBoardLoadedAndActivate } from '../useBoardRouteLifecycle/useBoardRouteLifecycle.activation';
import { useBoardTileClickHandler } from '../useBoardTileClickHandler';

import { useAppStore } from '@/domains/app/stores/appStore';
import { speak } from '@/domains/shared/providers/SpeechProvider/speechService';

type HookParams = Parameters<typeof useBoardTileClickHandler>[0];

let latestHookResult: ReturnType<typeof useBoardTileClickHandler> | null = null;

const mockAudioPlay = vi.fn();
const MockAudio = vi.fn().mockImplementation(() => ({
  play: mockAudioPlay,
}));

const mockGetAppState = vi.mocked(useAppStore.getState);
const mockSpeak = vi.mocked(speak);
const mockEnsureBoardLoadedAndActivate = vi.mocked(
  ensureBoardLoadedAndActivate,
);

const buildParams = (overrides: Partial<HookParams> = {}): HookParams => ({
  isSelecting: false,
  setSelectedTileIds: vi.fn(),
  boards: [],
  changeBoard: vi.fn(),
  navigate: vi.fn(),
  fetchBoardById: vi.fn(),
  showNotification: vi.fn(),
  intl: { formatMessage: vi.fn().mockReturnValue('Board missed') } as any,
  output: [],
  changeOutput: vi.fn(),
  ...overrides,
});

const TestHarness = ({ params }: { params: HookParams }) => {
  latestHookResult = useBoardTileClickHandler(params);
  return null;
};

describe('useBoardTileClickHandler', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    latestHookResult = null;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.stubGlobal('Audio', MockAudio as unknown as typeof Audio);
    mockAudioPlay.mockResolvedValue(undefined);
    mockGetAppState.mockReturnValue({ navigationSettings: {} } as never);
    mockEnsureBoardLoadedAndActivate.mockResolvedValue(undefined);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  const renderHook = (params: HookParams) => {
    act(() => {
      root.render(<TestHarness params={params} />);
    });

    expect(latestHookResult).not.toBeNull();
    return latestHookResult!;
  };

  it('plays tile sound for normal tiles when touch audio is enabled', () => {
    mockGetAppState.mockReturnValue({
      navigationSettings: { playSoundOnTouchActive: true },
    } as never);

    const tile = { id: 'tile-1', label: 'Hello', sound: 'sound.mp3' } as any;
    const changeOutput = vi.fn();

    renderHook(buildParams({ changeOutput }));

    act(() => {
      latestHookResult!(tile);
    });

    expect(MockAudio).toHaveBeenCalledWith('sound.mp3');
    expect(mockAudioPlay).toHaveBeenCalledTimes(1);
    expect(mockSpeak).not.toHaveBeenCalled();
    expect(changeOutput).toHaveBeenCalledWith([tile]);
  });

  it('speaks tile vocalization fallback for normal tiles when touch audio is enabled', () => {
    mockGetAppState.mockReturnValue({
      navigationSettings: { playSoundOnTouchActive: true },
    } as never);

    const tile = { id: 'tile-1', label: 'Hello', vocalization: 'Hola' } as any;

    renderHook(buildParams());

    act(() => {
      latestHookResult!(tile);
    });

    expect(mockSpeak).toHaveBeenCalledWith('Hola');
    expect(MockAudio).not.toHaveBeenCalled();
  });

  it('does not speak derived text for action tiles that start with plus', () => {
    mockGetAppState.mockReturnValue({
      navigationSettings: { playSoundOnTouchActive: true },
    } as never);

    const tile = {
      id: 'tile-1',
      label: 'Clear',
      vocalization: 'Should stay silent',
      action: '+clear',
    } as any;
    const changeOutput = vi.fn();

    renderHook(buildParams({ changeOutput }));

    act(() => {
      latestHookResult!(tile);
    });

    expect(mockSpeak).not.toHaveBeenCalled();
    expect(MockAudio).not.toHaveBeenCalled();
    expect(changeOutput).toHaveBeenCalledWith([tile]);
  });

  it('speaks folder fallback text before navigating when folder vocalization is enabled', () => {
    mockGetAppState.mockReturnValue({
      navigationSettings: { vocalizeFolders: true },
    } as never);

    const tile = {
      id: 'tile-1',
      label: 'Animals',
      loadBoard: 'board-2',
    } as any;
    const params = buildParams();

    renderHook(params);

    act(() => {
      latestHookResult!(tile);
    });

    expect(mockSpeak).toHaveBeenCalledWith('Animals');
    expect(mockEnsureBoardLoadedAndActivate).toHaveBeenCalledWith({
      boardId: 'board-2',
      availableBoards: params.boards,
      fetchBoardById: params.fetchBoardById,
      changeBoard: params.changeBoard,
      navigation: { navigate: params.navigate },
    });
    expect(params.changeOutput).not.toHaveBeenCalled();
  });

  it('plays folder sound instead of speaking when folder vocalization is enabled', () => {
    mockGetAppState.mockReturnValue({
      navigationSettings: { vocalizeFolders: true },
    } as never);

    const tile = {
      id: 'tile-1',
      label: 'Animals',
      loadBoard: 'board-2',
      sound: 'folder.mp3',
    } as any;

    renderHook(buildParams());

    act(() => {
      latestHookResult!(tile);
    });

    expect(MockAudio).toHaveBeenCalledWith('folder.mp3');
    expect(mockAudioPlay).toHaveBeenCalledTimes(1);
    expect(mockSpeak).not.toHaveBeenCalled();
  });
});
