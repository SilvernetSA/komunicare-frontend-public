import { beforeEach, describe, expect, it, vi } from 'vitest';

import { syncBoardWithCommunicatorFactory } from '../syncBoardWithCommunicatorFactory';

const mocks = vi.hoisted(() => ({
  communicatorsState: {
    communicators: [] as any[],
    activeCommunicatorId: 'comm-1',
    replaceBoardCommunicator: vi.fn(),
    upsertCommunicator: vi.fn(),
    createRemoteCommunicator: vi.fn().mockResolvedValue({}),
    updateRemoteCommunicator: vi.fn().mockResolvedValue({}),
  },
  replaceDefaultHomeBoardIfIsNecessary: vi.fn(),
  buildUpdatedCommunicatorAfterBoardSync: vi.fn(),
  getApiErrorMessage: vi.fn((_err: unknown, fallback: string) => fallback),
}));

vi.mock('../../communicatorsStore', () => ({
  useCommunicatorsStore: { getState: () => mocks.communicatorsState },
}));

vi.mock('../../utils/replaceDefaultHomeBoard', () => ({
  replaceDefaultHomeBoardIfIsNecessary: (...args: any[]) =>
    mocks.replaceDefaultHomeBoardIfIsNecessary(...args),
}));

vi.mock('../buildUpdatedCommunicatorAfterBoardSync', () => ({
  buildUpdatedCommunicatorAfterBoardSync: (...args: any[]) =>
    mocks.buildUpdatedCommunicatorAfterBoardSync(...args),
}));

vi.mock('../../helpers/getApiErrorMessage', () => ({
  getApiErrorMessage: (...args: any[]) => (mocks as any).getApiErrorMessage(...args),
}));

const makeCommunicator = (overrides: Record<string, unknown> = {}) => ({
  id: 'comm-1',
  name: 'Main',
  boards: ['board-1'],
  rootBoard: 'board-1',
  email: 'user@example.com',
  author: 'User',
  ...overrides,
});

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
  createRemoteBoard: vi.fn().mockResolvedValue({ id: 'new-id' }),
  updateRemoteBoard: vi.fn().mockResolvedValue({ id: 'board-1' }),
  updateApiMarkedBoards: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('syncBoardWithCommunicatorFactory', () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.communicatorsState.communicators = [makeCommunicator()];
    mocks.communicatorsState.activeCommunicatorId = 'comm-1';
    mocks.buildUpdatedCommunicatorAfterBoardSync.mockReturnValue(
      makeCommunicator(),
    );
    store = makeStore();
  });

  it('calls updateRemoteBoard when createParentBoard is false', async () => {
    const fn = syncBoardWithCommunicatorFactory(() => store as any);
    const board = makeBoard();

    await fn({ parentBoard: board });

    expect(store.updateRemoteBoard).toHaveBeenCalledWith(board);
    expect(store.createRemoteBoard).not.toHaveBeenCalled();
  });

  it('calls createRemoteBoard when createParentBoard is true', async () => {
    const fn = syncBoardWithCommunicatorFactory(() => store as any);
    const board = makeBoard();

    await fn({ parentBoard: board, createParentBoard: true });

    expect(store.createRemoteBoard).toHaveBeenCalledWith({
      board,
      tempId: board.id,
    });
    expect(store.updateRemoteBoard).not.toHaveBeenCalled();
  });

  it('returns the synchronized board id', async () => {
    store.updateRemoteBoard = vi.fn().mockResolvedValue({ id: 'synced-id' });
    const fn = syncBoardWithCommunicatorFactory(() => store as any);

    const result = await fn({ parentBoard: makeBoard() });

    expect(result).toBe('synced-id');
  });

  it('replaces the board communicator when the id changes after create', async () => {
    store.createRemoteBoard = vi.fn().mockResolvedValue({ id: 'new-board-id' });
    const fn = syncBoardWithCommunicatorFactory(() => store as any);

    await fn({
      parentBoard: makeBoard({ id: 'old-board-id' }),
      createParentBoard: true,
    });

    expect(
      mocks.communicatorsState.replaceBoardCommunicator,
    ).toHaveBeenCalledWith({
      prevBoardId: 'old-board-id',
      nextBoardId: 'new-board-id',
    });
  });

  it('does not replace the board communicator when the id stays the same', async () => {
    store.updateRemoteBoard = vi.fn().mockResolvedValue({ id: 'board-1' });
    const fn = syncBoardWithCommunicatorFactory(() => store as any);

    await fn({ parentBoard: makeBoard({ id: 'board-1' }) });

    expect(
      mocks.communicatorsState.replaceBoardCommunicator,
    ).not.toHaveBeenCalled();
  });

  it('uses previousBoardId as the prev side of the replacement when provided', async () => {
    store.updateRemoteBoard = vi.fn().mockResolvedValue({ id: 'updated-id' });
    const fn = syncBoardWithCommunicatorFactory(() => store as any);

    await fn({
      parentBoard: makeBoard({ id: 'temp-id' }),
      previousBoardId: 'original-id',
    });

    expect(
      mocks.communicatorsState.replaceBoardCommunicator,
    ).toHaveBeenCalledWith({
      prevBoardId: 'original-id',
      nextBoardId: 'updated-id',
    });
  });

  it('upserts the communicator after syncing the board', async () => {
    const updatedComm = makeCommunicator({ id: 'comm-1' });
    mocks.buildUpdatedCommunicatorAfterBoardSync.mockReturnValue(updatedComm);
    const fn = syncBoardWithCommunicatorFactory(() => store as any);

    await fn({ parentBoard: makeBoard() });

    expect(mocks.communicatorsState.upsertCommunicator).toHaveBeenNthCalledWith(
      1,
      updatedComm,
    );
  });

  it('uses the remote communicator as the final state after create', async () => {
    const optimisticComm = makeCommunicator({ id: 'temp-comm-id' });
    const remoteComm = makeCommunicator({
      id: 'remote-comm-id',
      boards: ['remote-board-id'],
      rootBoard: 'remote-board-id',
    });
    mocks.buildUpdatedCommunicatorAfterBoardSync.mockReturnValue(
      optimisticComm,
    );
    mocks.communicatorsState.createRemoteCommunicator.mockResolvedValue(
      remoteComm,
    );
    const fn = syncBoardWithCommunicatorFactory(() => store as any);

    await fn({ parentBoard: makeBoard(), createCommunicator: true });

    expect(mocks.communicatorsState.upsertCommunicator).toHaveBeenNthCalledWith(
      1,
      optimisticComm,
    );
    expect(mocks.communicatorsState.upsertCommunicator).toHaveBeenNthCalledWith(
      2,
      remoteComm,
    );
  });

  it('uses the remote communicator as the final state after update', async () => {
    const optimisticComm = makeCommunicator({
      boards: ['optimistic-board-id'],
      rootBoard: 'optimistic-board-id',
    });
    const remoteComm = makeCommunicator({
      boards: ['remote-board-id'],
      rootBoard: 'remote-board-id',
    });
    mocks.buildUpdatedCommunicatorAfterBoardSync.mockReturnValue(
      optimisticComm,
    );
    mocks.communicatorsState.updateRemoteCommunicator.mockResolvedValue(
      remoteComm,
    );
    const fn = syncBoardWithCommunicatorFactory(() => store as any);

    await fn({ parentBoard: makeBoard() });

    expect(mocks.communicatorsState.upsertCommunicator).toHaveBeenNthCalledWith(
      1,
      optimisticComm,
    );
    expect(mocks.communicatorsState.upsertCommunicator).toHaveBeenNthCalledWith(
      2,
      remoteComm,
    );
  });

  it('creates a remote communicator when createCommunicator is true', async () => {
    const updatedComm = makeCommunicator({ id: 'comm-1' });
    mocks.buildUpdatedCommunicatorAfterBoardSync.mockReturnValue(updatedComm);
    const fn = syncBoardWithCommunicatorFactory(() => store as any);

    await fn({ parentBoard: makeBoard(), createCommunicator: true });

    expect(
      mocks.communicatorsState.createRemoteCommunicator,
    ).toHaveBeenCalledWith({
      communicator: updatedComm,
      tempId: updatedComm.id,
    });
    expect(
      mocks.communicatorsState.updateRemoteCommunicator,
    ).not.toHaveBeenCalled();
  });

  it('updates the remote communicator when createCommunicator is false', async () => {
    const updatedComm = makeCommunicator({ id: 'comm-1' });
    mocks.buildUpdatedCommunicatorAfterBoardSync.mockReturnValue(updatedComm);
    const fn = syncBoardWithCommunicatorFactory(() => store as any);

    await fn({ parentBoard: makeBoard() });

    expect(
      mocks.communicatorsState.updateRemoteCommunicator,
    ).toHaveBeenCalledWith(updatedComm);
    expect(
      mocks.communicatorsState.createRemoteCommunicator,
    ).not.toHaveBeenCalled();
  });

  it('calls updateApiMarkedBoards after all sync steps', async () => {
    const fn = syncBoardWithCommunicatorFactory(() => store as any);

    await fn({ parentBoard: makeBoard() });

    expect(store.updateApiMarkedBoards).toHaveBeenCalled();
  });

  it('throws when the active communicator is not found', async () => {
    mocks.communicatorsState.communicators = [];
    const fn = syncBoardWithCommunicatorFactory(() => store as any);

    await expect(fn({ parentBoard: makeBoard() })).rejects.toThrow();
  });

  it('wraps unexpected errors via getApiErrorMessage', async () => {
    store.updateRemoteBoard = vi
      .fn()
      .mockRejectedValue(new Error('Network error'));
    mocks.getApiErrorMessage.mockReturnValue(
      'Failed to sync board and communicator',
    );
    const fn = syncBoardWithCommunicatorFactory(() => store as any);

    await expect(fn({ parentBoard: makeBoard() })).rejects.toThrow(
      'Failed to sync board and communicator',
    );
  });
});
