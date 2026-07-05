import { beforeEach, describe, expect, it, vi } from 'vitest';

import { syncBoardsWithCommunicatorFactory } from '../syncBoardsWithCommunicatorFactory';

const mocks = vi.hoisted(() => ({
  communicatorsState: {
    communicators: [] as any[],
    activeCommunicatorId: 'comm-1',
    replaceBoardCommunicator: vi.fn(),
    addBoardCommunicator: vi.fn(),
  },
  getApiErrorMessage: vi.fn((_err: unknown, fallback: string) => fallback),
}));

vi.mock('../../communicatorsStore', () => ({
  useCommunicatorsStore: { getState: () => mocks.communicatorsState },
}));

vi.mock('../../helpers/getApiErrorMessage', () => ({
  getApiErrorMessage: (...args: any[]) => mocks.getApiErrorMessage(...args),
}));

const makeBoard = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'board-1',
    name: 'My Board',
    tiles: [],
    isPublic: false,
    email: 'user@example.com',
    author: 'User',
    locale: 'en',
    ...overrides,
  }) as any;

const makeStore = (overrides: Record<string, unknown> = {}) => ({
  createRemoteBoard: vi.fn().mockResolvedValue({ id: 'new-child-id' }),
  syncBoardWithCommunicator: vi.fn().mockResolvedValue('parent-board-id'),
  ...overrides,
});

const makeCommunicator = (overrides: Record<string, unknown> = {}) => ({
  id: 'comm-1',
  name: 'Main communicator',
  boards: ['child-id'],
  rootBoard: 'parent-board-id',
  email: 'user@example.com',
  author: 'User',
  ...overrides,
});

describe('syncBoardsWithCommunicatorFactory', () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.communicatorsState.communicators = [makeCommunicator()];
    mocks.communicatorsState.activeCommunicatorId = 'comm-1';
    store = makeStore();
  });

  it('creates the child board before syncing the parent', async () => {
    const fn = syncBoardsWithCommunicatorFactory(() => store as any);
    const child = makeBoard({ id: 'child-id' });
    const parent = makeBoard({ id: 'parent-id' });

    const steps: string[] = [];
    store.createRemoteBoard = vi.fn(async () => {
      steps.push('create-child');
      return { id: 'new-child-id' };
    });
    store.syncBoardWithCommunicator = vi.fn(async () => {
      steps.push('sync-parent');
      return 'parent-board-id';
    });

    await fn({ childBoard: child, parentBoard: parent });

    expect(steps).toEqual(['create-child', 'sync-parent']);
  });

  it('creates the child board with its current id as tempId', async () => {
    const fn = syncBoardsWithCommunicatorFactory(() => store as any);
    const child = makeBoard({ id: 'child-id' });

    await fn({ childBoard: child, parentBoard: makeBoard() });

    expect(store.createRemoteBoard).toHaveBeenCalledWith({
      board: child,
      tempId: 'child-id',
    });
  });

  it('replaces the child board communicator after creating it', async () => {
    store.createRemoteBoard = vi.fn().mockResolvedValue({ id: 'new-child-id' });
    mocks.communicatorsState.communicators = [
      makeCommunicator({ boards: ['old-child-id'] }),
    ];
    const fn = syncBoardsWithCommunicatorFactory(() => store as any);

    await fn({
      childBoard: makeBoard({ id: 'old-child-id' }),
      parentBoard: makeBoard(),
    });

    expect(
      mocks.communicatorsState.replaceBoardCommunicator,
    ).toHaveBeenCalledWith({
      prevBoardId: 'old-child-id',
      nextBoardId: 'new-child-id',
    });
  });

  it('adds the persisted child board to the active communicator when the temp id was never associated', async () => {
    mocks.communicatorsState.communicators = [
      makeCommunicator({ boards: ['parent-board-id'] }),
    ];
    const fn = syncBoardsWithCommunicatorFactory(() => store as any);

    await fn({
      childBoard: makeBoard({ id: 'missing-temp-child-id' }),
      parentBoard: makeBoard({ id: 'parent-board-id' }),
    });

    expect(mocks.communicatorsState.addBoardCommunicator).toHaveBeenCalledWith(
      'new-child-id',
    );
    expect(
      mocks.communicatorsState.replaceBoardCommunicator,
    ).not.toHaveBeenCalled();
  });

  it('forwards all args to syncBoardWithCommunicator', async () => {
    const fn = syncBoardsWithCommunicatorFactory(() => store as any);
    const parent = makeBoard({ id: 'parent-id' });

    await fn({
      childBoard: makeBoard({ id: 'child-id' }),
      parentBoard: parent,
      createCommunicator: true,
      createParentBoard: true,
      previousParentBoardId: 'prev-parent-id',
    });

    expect(store.syncBoardWithCommunicator).toHaveBeenCalledWith({
      parentBoard: parent,
      createCommunicator: true,
      createParentBoard: true,
      previousBoardId: 'prev-parent-id',
    });
  });

  it('defaults createCommunicator and createParentBoard to false', async () => {
    const fn = syncBoardsWithCommunicatorFactory(() => store as any);

    await fn({
      childBoard: makeBoard({ id: 'child-id' }),
      parentBoard: makeBoard(),
    });

    expect(store.syncBoardWithCommunicator).toHaveBeenCalledWith(
      expect.objectContaining({
        createCommunicator: false,
        createParentBoard: false,
      }),
    );
  });

  it('returns the parent board id from syncBoardWithCommunicator', async () => {
    store.syncBoardWithCommunicator = vi
      .fn()
      .mockResolvedValue('final-parent-id');
    const fn = syncBoardsWithCommunicatorFactory(() => store as any);

    const result = await fn({
      childBoard: makeBoard({ id: 'child-id' }),
      parentBoard: makeBoard({ id: 'parent-id' }),
    });

    expect(result).toBe('final-parent-id');
  });

  it('wraps errors from createRemoteBoard via getApiErrorMessage', async () => {
    store.createRemoteBoard = vi
      .fn()
      .mockRejectedValue(new Error('Network error'));
    mocks.getApiErrorMessage.mockReturnValue(
      'Failed to sync parent and child boards',
    );
    const fn = syncBoardsWithCommunicatorFactory(() => store as any);

    await expect(
      fn({ childBoard: makeBoard(), parentBoard: makeBoard() }),
    ).rejects.toThrow('Failed to sync parent and child boards');
  });

  it('wraps errors from syncBoardWithCommunicator via getApiErrorMessage', async () => {
    store.syncBoardWithCommunicator = vi
      .fn()
      .mockRejectedValue(new Error('Sync failed'));
    mocks.getApiErrorMessage.mockReturnValue(
      'Failed to sync parent and child boards',
    );
    const fn = syncBoardsWithCommunicatorFactory(() => store as any);

    await expect(
      fn({ childBoard: makeBoard(), parentBoard: makeBoard() }),
    ).rejects.toThrow('Failed to sync parent and child boards');
  });
});
