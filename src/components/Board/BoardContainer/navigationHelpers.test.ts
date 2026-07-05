import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../utils/switchCommunicatorNavigation', () => ({
  switchCommunicatorNavigation: vi.fn(),
}));

import {
  ensureBoardLoadedAndActivate,
  syncBoardOwnerAndActivate,
  syncCommunicatorForBoardOwner,
} from './navigationHelpers';
import { switchCommunicatorNavigation } from '../../../utils/switchCommunicatorNavigation';

const mockSwitchCommunicatorNavigation = vi.mocked(
  switchCommunicatorNavigation,
);

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('ensureBoardLoadedAndActivate', () => {
  it('activates a local board and pushes navigation without fetching', async () => {
    const board = { id: 'board-1' } as any;
    const changeBoard = vi.fn();
    const fetchBoardById = vi.fn();
    const navigate = vi.fn();

    const resolvedBoard = await ensureBoardLoadedAndActivate({
      boardId: 'board-1',
      availableBoards: [board],
      fetchBoardById,
      changeBoard,
      navigation: { navigate },
    });

    expect(resolvedBoard).toBe(board);
    expect(fetchBoardById).not.toHaveBeenCalled();
    expect(changeBoard).toHaveBeenCalledWith('board-1');
    expect(navigate).toHaveBeenCalledWith('/board/board-1');
  });

  it('fetches a missing board and navigates with replace mode', async () => {
    vi.useFakeTimers();

    const board = { id: 'board-2' } as any;
    const changeBoard = vi.fn();
    const fetchBoardById = vi.fn().mockResolvedValue(board);
    const navigate = vi.fn();
    const lastNavigateTargetRef = { current: '' };

    const resolvedBoard = await ensureBoardLoadedAndActivate({
      boardId: 'board-2',
      availableBoards: [],
      fetchBoardById,
      changeBoard,
      navigation: {
        mode: 'replace',
        urlId: 'missing-board',
        pathname: '/board/missing-board',
        navigate,
        lastNavigateTargetRef,
      },
    });

    expect(resolvedBoard).toBe(board);
    expect(fetchBoardById).toHaveBeenCalledWith('board-2');
    expect(changeBoard).toHaveBeenCalledWith('board-2');
    expect(navigate).toHaveBeenCalledWith('/board/board-2', { replace: true });
    expect(lastNavigateTargetRef.current).toBe('/board/board-2');

    vi.runAllTimers();

    expect(lastNavigateTargetRef.current).toBe('');
  });

  it('skips activation when the caller blocks late state updates', async () => {
    const board = { id: 'board-3' } as any;
    const changeBoard = vi.fn();
    const fetchBoardById = vi.fn().mockResolvedValue(board);
    const navigate = vi.fn();

    const resolvedBoard = await ensureBoardLoadedAndActivate({
      boardId: 'board-3',
      availableBoards: [],
      fetchBoardById,
      changeBoard,
      canActivate: () => false,
      navigation: { navigate },
    });

    expect(resolvedBoard).toBe(board);
    expect(changeBoard).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('reuses a resolved board and runs setup before activation', async () => {
    const steps: string[] = [];
    const board = { id: 'board-4' } as any;
    const changeBoard = vi.fn(() => {
      steps.push('changeBoard');
    });
    const fetchBoardById = vi.fn();
    const beforeActivate = vi.fn(() => {
      steps.push('beforeActivate');
    });

    const resolvedBoard = await ensureBoardLoadedAndActivate({
      boardId: 'board-4',
      resolvedBoard: board,
      availableBoards: [],
      fetchBoardById,
      changeBoard,
      beforeActivate,
    });

    expect(resolvedBoard).toBe(board);
    expect(fetchBoardById).not.toHaveBeenCalled();
    expect(beforeActivate).toHaveBeenCalledWith(board);
    expect(changeBoard).toHaveBeenCalledWith('board-4');
    expect(steps).toEqual(['beforeActivate', 'changeBoard']);
  });
});

describe('syncCommunicatorForBoardOwner', () => {
  it('switches communicator when the board belongs to a different owner', () => {
    const navigate = vi.fn();
    const ownerCommunicator = {
      boards: ['board-1'],
      id: 'comm-b',
      rootBoard: 'board-1',
    } as any;

    syncCommunicatorForBoardOwner({
      boardId: 'board-1',
      communicators: [
        {
          boards: ['other-board'],
          id: 'comm-a',
          rootBoard: 'other-board',
        } as any,
        ownerCommunicator,
      ],
      activeCommunicatorId: 'comm-a',
      navigate,
    });

    expect(mockSwitchCommunicatorNavigation).toHaveBeenCalledWith({
      communicator: ownerCommunicator,
      navigate,
      skipBoardNavigation: true,
    });
  });

  it('does not switch communicator when the owner is already active', () => {
    syncCommunicatorForBoardOwner({
      boardId: 'board-1',
      communicators: [
        {
          boards: ['board-1'],
          id: 'comm-a',
          rootBoard: 'board-1',
        } as any,
      ],
      activeCommunicatorId: 'comm-a',
      navigate: vi.fn(),
    });

    expect(mockSwitchCommunicatorNavigation).not.toHaveBeenCalled();
  });

  it('does not switch communicator when no owner contains the board', () => {
    syncCommunicatorForBoardOwner({
      boardId: 'missing-board',
      communicators: [
        {
          boards: ['board-1'],
          id: 'comm-a',
          rootBoard: 'board-1',
        } as any,
      ],
      activeCommunicatorId: 'comm-a',
      navigate: vi.fn(),
    });

    expect(mockSwitchCommunicatorNavigation).not.toHaveBeenCalled();
  });
});

describe('syncBoardOwnerAndActivate', () => {
  it('syncs the owner communicator before activating the board', async () => {
    const steps: string[] = [];
    const board = { id: 'board-1' } as any;
    const changeBoard = vi.fn(() => {
      steps.push('changeBoard');
    });
    const fetchBoardById = vi.fn();
    const navigate = vi.fn();

    mockSwitchCommunicatorNavigation.mockImplementation(() => {
      steps.push('syncCommunicator');
    });

    const resolvedBoard = await syncBoardOwnerAndActivate({
      boardId: 'board-1',
      availableBoards: [board],
      fetchBoardById,
      changeBoard,
      communicators: [
        {
          boards: ['other-board'],
          id: 'comm-a',
          rootBoard: 'other-board',
        } as any,
        {
          boards: ['board-1'],
          id: 'comm-b',
          rootBoard: 'board-1',
        } as any,
      ],
      activeCommunicatorId: 'comm-a',
      navigate,
      navigation: { navigate },
    });

    expect(resolvedBoard).toBe(board);
    expect(fetchBoardById).not.toHaveBeenCalled();
    expect(changeBoard).toHaveBeenCalledWith('board-1');
    expect(navigate).toHaveBeenCalledWith('/board/board-1');
    expect(steps).toEqual(['syncCommunicator', 'changeBoard']);
  });

  it('does not sync or activate when activation is blocked late', async () => {
    const board = { id: 'board-2' } as any;
    const changeBoard = vi.fn();
    const fetchBoardById = vi.fn().mockResolvedValue(board);

    const resolvedBoard = await syncBoardOwnerAndActivate({
      boardId: 'board-2',
      availableBoards: [],
      fetchBoardById,
      changeBoard,
      canActivate: () => false,
      communicators: [
        {
          boards: ['board-2'],
          id: 'comm-b',
          rootBoard: 'board-2',
        } as any,
      ],
      activeCommunicatorId: 'comm-a',
      navigate: vi.fn(),
    });

    expect(resolvedBoard).toBe(board);
    expect(mockSwitchCommunicatorNavigation).not.toHaveBeenCalled();
    expect(changeBoard).not.toHaveBeenCalled();
  });
});
