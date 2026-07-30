import { describe, expect, it, vi } from 'vitest';

import { reconcilePersistedBoard } from '../reconcilePersistedBoard';

describe('reconcilePersistedBoard', () => {
  it('replaces the local board with the persisted id when creation happened', () => {
    const replaceBoard = vi.fn();
    const board = {
      id: 'temp-board-id',
      name: 'Board copy',
      isPublic: false,
    } as any;

    reconcilePersistedBoard({
      board,
      previousBoardId: 'temp-board-id',
      persistedBoardId: 'persisted-board-id',
      shouldReplace: true,
      replaceBoard,
    });

    expect(replaceBoard).toHaveBeenCalledTimes(1);
    expect(replaceBoard).toHaveBeenCalledWith({
      prev: { ...board, id: 'temp-board-id' },
      current: { ...board, id: 'persisted-board-id' },
    });
  });

  it('does nothing when the board was updated in place', () => {
    const replaceBoard = vi.fn();

    reconcilePersistedBoard({
      board: {
        id: 'persisted-board-id',
        name: 'Board copy',
      } as any,
      previousBoardId: 'persisted-board-id',
      persistedBoardId: 'persisted-board-id',
      shouldReplace: false,
      replaceBoard,
    });

    expect(replaceBoard).not.toHaveBeenCalled();
  });
});
