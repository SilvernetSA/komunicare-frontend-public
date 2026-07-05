import { describe, expect, it, vi } from 'vitest';

import { persistBoardAndSyncNavigation } from '../persistBoardAndSyncNavigation';
import { syncPersistedBoardNavigation } from '../syncPersistedBoardNavigation';

vi.mock('../syncPersistedBoardNavigation', () => ({
  syncPersistedBoardNavigation: vi.fn(),
}));

describe('persistBoardAndSyncNavigation', () => {
  it('persists first, then syncs navigation with the persisted board id', async () => {
    const steps: string[] = [];
    const persistBoard = vi.fn(async () => {
      steps.push('persist');
      return 'persisted-board-id';
    });

    vi.mocked(syncPersistedBoardNavigation).mockImplementationOnce(async () => {
      steps.push('sync');
    });

    const replaceBoard = vi.fn();
    const switchBoard = vi.fn();
    const navigate = vi.fn();
    const board = {
      id: 'temp-board-id',
      name: 'Board copy',
      isPublic: false,
    } as any;

    const persistedBoardId = await persistBoardAndSyncNavigation({
      persistBoard,
      board,
      previousBoardId: 'temp-board-id',
      shouldReplaceBoard: true,
      replaceBoard,
      switchBoard,
      navigate,
      communicatorId: 'communicator-id',
      shouldPersistStartupCommunicator: true,
    });

    expect(persistedBoardId).toBe('persisted-board-id');
    expect(steps).toEqual(['persist', 'sync']);
    expect(syncPersistedBoardNavigation).toHaveBeenCalledWith({
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
  });
});
