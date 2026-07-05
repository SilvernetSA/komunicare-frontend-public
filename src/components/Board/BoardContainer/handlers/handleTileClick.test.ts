import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../navigationHelpers', () => ({
  ensureBoardLoadedAndActivate: vi.fn(),
}));

vi.mock('../../utils-simple/playAudio', () => ({
  playAudio: vi.fn(),
}));

vi.mock('../../../../providers/SpeechProvider/speechService', () => ({
  speak: vi.fn(),
}));

vi.mock('../../../../store/appStore', () => ({
  useAppStore: {
    getState: vi.fn(),
  },
}));

import { handleTileClick } from './handleTileClick';
import { speak } from '../../../../providers/SpeechProvider/speechService';
import { useAppStore } from '../../../../store/appStore';
import { playAudio } from '../../utils-simple/playAudio';
import { ensureBoardLoadedAndActivate } from '../navigationHelpers';

const mockGetAppState = vi.mocked(useAppStore.getState);
const mockSpeak = vi.mocked(speak);
const mockPlayAudio = vi.mocked(playAudio);
const mockEnsureBoardLoadedAndActivate = vi.mocked(
  ensureBoardLoadedAndActivate,
);

const createBaseParams = (overrides: Record<string, unknown> = {}) => ({
  tile: { id: 'tile-1', label: 'Hello' },
  isSelecting: false,
  setSelectedTileIds: vi.fn(),
  boards: [],
  changeBoard: vi.fn(),
  navigate: vi.fn(),
  fetchBoardById: vi.fn(),
  showNotification: vi.fn(),
  intl: { formatMessage: vi.fn().mockReturnValue('Board missed') },
  output: [],
  changeOutput: vi.fn(),
  ...overrides,
});

beforeEach(() => {
  mockGetAppState.mockReturnValue({ navigationSettings: {} } as never);
  mockEnsureBoardLoadedAndActivate.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('handleTileClick', () => {
  it('plays tile sound for normal tiles when touch audio is enabled', () => {
    mockGetAppState.mockReturnValue({
      navigationSettings: { playSoundOnTouchActive: true },
    } as never);

    const tile = { id: 'tile-1', label: 'Hello', sound: 'sound.mp3' };
    const changeOutput = vi.fn();

    handleTileClick(createBaseParams({ tile, changeOutput }) as any);

    expect(mockPlayAudio).toHaveBeenCalledWith('sound.mp3');
    expect(mockSpeak).not.toHaveBeenCalled();
    expect(changeOutput).toHaveBeenCalledWith([tile]);
  });

  it('speaks tile vocalization fallback for normal tiles when touch audio is enabled', () => {
    mockGetAppState.mockReturnValue({
      navigationSettings: { playSoundOnTouchActive: true },
    } as never);

    const tile = { id: 'tile-1', label: 'Hello', vocalization: 'Hola' };

    handleTileClick(createBaseParams({ tile }) as any);

    expect(mockSpeak).toHaveBeenCalledWith('Hola');
    expect(mockPlayAudio).not.toHaveBeenCalled();
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
    };
    const changeOutput = vi.fn();

    handleTileClick(createBaseParams({ tile, changeOutput }) as any);

    expect(mockSpeak).not.toHaveBeenCalled();
    expect(mockPlayAudio).not.toHaveBeenCalled();
    expect(changeOutput).toHaveBeenCalledWith([tile]);
  });

  it('speaks folder fallback text before navigating when folder vocalization is enabled', () => {
    mockGetAppState.mockReturnValue({
      navigationSettings: { vocalizeFolders: true },
    } as never);

    const tile = { id: 'tile-1', label: 'Animals', loadBoard: 'board-2' };
    const params = createBaseParams({ tile });

    handleTileClick(params as any);

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
    };

    handleTileClick(createBaseParams({ tile }) as any);

    expect(mockPlayAudio).toHaveBeenCalledWith('folder.mp3');
    expect(mockSpeak).not.toHaveBeenCalled();
  });
});
