import { describe, expect, it } from 'vitest';

import { updateBoardsAfterCreateApiBoard } from '../updateBoardsAfterCreateApiBoard';

const makeBoard = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'board-1',
    name: 'Board',
    author: 'User',
    email: 'user@example.com',
    isPublic: false,
    tiles: [],
    ...overrides,
  }) as any;

describe('updateBoardsAfterCreateApiBoard', () => {
  it('adds the persisted board when the temporary placeholder is missing', () => {
    const state = {
      boards: [
        makeBoard({
          id: 'parent-board-id',
          tiles: [{ id: 'tile-1', loadBoard: 'temp-child-id' }],
        }),
      ],
      output: [],
      activeBoardId: 'parent-board-id',
      navHistory: ['parent-board-id'],
      isFetching: true,
      images: [],
      isFixed: false,
      isLiveMode: false,
      improvedPhrase: '',
    } as any;

    const result = updateBoardsAfterCreateApiBoard(
      state,
      'temp-child-id',
      makeBoard({ id: 'persisted-child-id', name: 'Persisted child' }),
    );

    expect(result.isFetching).toBe(false);
    expect(result.boards.map((board: any) => board.id)).toEqual([
      'parent-board-id',
      'persisted-child-id',
    ]);
    expect(result.boards[0].tiles[0].loadBoard).toBe('persisted-child-id');
  });

  it('does not duplicate the persisted board when it is already present', () => {
    const state = {
      boards: [
        makeBoard({
          id: 'parent-board-id',
          tiles: [{ id: 'tile-1', loadBoard: 'temp-child-id' }],
        }),
        makeBoard({ id: 'persisted-child-id', name: 'Stale child name' }),
      ],
      output: [],
      activeBoardId: 'parent-board-id',
      navHistory: ['parent-board-id'],
      isFetching: true,
      images: [],
      isFixed: false,
      isLiveMode: false,
      improvedPhrase: '',
    } as any;

    const result = updateBoardsAfterCreateApiBoard(
      state,
      'temp-child-id',
      makeBoard({ id: 'persisted-child-id', name: 'Fresh child name' }),
    );

    expect(result.boards.map((board: any) => board.id)).toEqual([
      'parent-board-id',
      'persisted-child-id',
    ]);
    expect(result.boards[1].name).toBe('Fresh child name');
  });
});
