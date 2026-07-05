import { describe, expect, it, vi } from 'vitest';

import { prepareBoardForPersistence } from '../prepareBoardForPersistence';

describe('prepareBoardForPersistence', () => {
  it('creates a new local copy for protected persisted boards', () => {
    const updateBoard = vi.fn();

    const result = prepareBoardForPersistence({
      board: {
        id: 'persisted-board-id',
        name: 'Protected board',
        isPublic: true,
      } as any,
      shouldCreateBoardCopy: true,
      updateBoard,
      generateId: () => 'temp-copy-id',
    });

    expect(result).toEqual({
      board: {
        id: 'temp-copy-id',
        name: 'Protected board',
        isPublic: false,
      },
      createBoard: true,
      previousBoardId: 'persisted-board-id',
    });
    expect(updateBoard).not.toHaveBeenCalled();
  });

  it('creates a private board without changing the temp id for local boards', () => {
    const updateBoard = vi.fn();

    const result = prepareBoardForPersistence({
      board: {
        id: 'temp-id',
        name: 'Draft board',
        isPublic: true,
      } as any,
      shouldCreateBoardCopy: false,
      updateBoard,
      generateId: () => 'unused-id',
    });

    expect(result).toEqual({
      board: {
        id: 'temp-id',
        name: 'Draft board',
        isPublic: false,
      },
      createBoard: true,
      previousBoardId: 'temp-id',
    });
    expect(updateBoard).not.toHaveBeenCalled();
  });

  it('updates persisted editable boards in place', () => {
    const updateBoard = vi.fn();
    const board = {
      id: 'persisted-board-id',
      name: 'Editable board',
      isPublic: true,
    } as any;

    const result = prepareBoardForPersistence({
      board,
      shouldCreateBoardCopy: false,
      updateBoard,
      generateId: () => 'unused-id',
    });

    expect(result).toEqual({
      board,
      createBoard: false,
      previousBoardId: 'persisted-board-id',
    });
    expect(updateBoard).toHaveBeenCalledTimes(1);
    expect(updateBoard).toHaveBeenCalledWith(board);
  });
});
