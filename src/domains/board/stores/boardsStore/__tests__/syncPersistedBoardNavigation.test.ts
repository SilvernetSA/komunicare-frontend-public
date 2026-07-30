import { describe, expect, it, vi } from 'vitest';

import { persistStartupCommunicatorSelection } from '@/utils/persistStartupCommunicatorSelection';
import { syncPersistedBoardNavigation } from '../syncPersistedBoardNavigation';

vi.mock('../../../utils/persistStartupCommunicatorSelection', () => ({
  persistStartupCommunicatorSelection: vi.fn(),
}));

describe('syncPersistedBoardNavigation', () => {
  it('persists communicator selection, reconciles the board, and replaces navigation', async () => {
    const replaceBoard = vi.fn();
    const switchBoard = vi.fn();
    const navigate = vi.fn();
    const board = {
      id: 'temp-board-id',
      name: 'Board copy',
      isPublic: false,
    } as any;

    await syncPersistedBoardNavigation({
      board,
      previousBoardId: 'temp-board-id',
      persistedBoardId: 'persisted-board-id',
      shouldReplaceBoard: true,
      replaceBoard,
      switchBoard,
      navigate,
      communicatorId: 'communicator-id',
      shouldPersistStartupCommunicator: true,
    });

    expect(persistStartupCommunicatorSelection).toHaveBeenCalledWith({
      communicatorId: 'communicator-id',
      shouldPersist: true,
    });
    expect(replaceBoard).toHaveBeenCalledWith({
      prev: { ...board, id: 'temp-board-id' },
      current: { ...board, id: 'persisted-board-id' },
    });
    expect(switchBoard).toHaveBeenCalledWith('persisted-board-id');
    expect(navigate).toHaveBeenCalledWith('/board/persisted-board-id', {
      replace: true,
    });
  });
});
