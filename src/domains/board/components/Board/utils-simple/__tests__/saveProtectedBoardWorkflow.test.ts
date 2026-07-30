import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resolveProtectedBoardCommunicatorCopy: vi.fn(),
  prepareBoardForPersistence: vi.fn(),
  persistBoardAndSyncNavigation: vi.fn(),
}));

vi.mock('../copyOnWrite', () => ({
  resolveProtectedBoardCommunicatorCopy:
    mocks.resolveProtectedBoardCommunicatorCopy,
}));

vi.mock('../../../../store/boardsStore/prepareBoardForPersistence', () => ({
  prepareBoardForPersistence: mocks.prepareBoardForPersistence,
}));

vi.mock('../../../../store/boardsStore/persistBoardAndSyncNavigation', () => ({
  persistBoardAndSyncNavigation: mocks.persistBoardAndSyncNavigation,
}));

import { saveProtectedBoardWorkflow } from '../saveProtectedBoardWorkflow';

const createBoard = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'persisted-board-id',
    name: 'Feelings Board',
    hidden: false,
    tiles: [],
    ...overrides,
  }) as any;

const createCommunicatorCopyParams = (
  overrides: Record<string, unknown> = {},
) => ({
  shouldResolveCommunicatorCopy: true,
  communicators: [],
  fallbackCommunicators: [],
  activeCommunicator: { id: 'communicator-id', email: 'owner@example.com', name: '', author: '', rootBoard: '', boards: [] },
  userEmail: 'user@example.com',
  boardId: 'persisted-board-id',
  fetchMyCommunicators: vi.fn().mockResolvedValue([]),
  userData: { email: 'user@example.com', name: 'User' },
  boardTitle: 'Feelings Board',
  promptText: 'prompt',
  noticeMessage: 'notice',
  upsertCommunicator: vi.fn(),
  navigate: vi.fn(),
  showNotification: vi.fn(),
  ...overrides,
});

describe('saveProtectedBoardWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveProtectedBoardCommunicatorCopy.mockResolvedValue({
      shouldAbort: false,
      createCommunicator: false,
      communicatorCopyResolution: null,
    });
    mocks.prepareBoardForPersistence.mockImplementation(({ board }: any) => ({
      board: { ...board, prepared: true },
      createBoard: false,
      previousBoardId: board.id,
    }));
    mocks.persistBoardAndSyncNavigation.mockImplementation(
      async ({ persistBoard }: any) => persistBoard(),
    );
  });

  it('aborts before preparing or persisting when communicator-copy resolution aborts', async () => {
    mocks.resolveProtectedBoardCommunicatorCopy.mockResolvedValueOnce({
      shouldAbort: true,
      createCommunicator: false,
      communicatorCopyResolution: null,
    });

    const persistBoard = vi.fn();

    const result = await saveProtectedBoardWorkflow({
      board: createBoard(),
      shouldCreateBoardCopy: true,
      communicatorCopyParams: createCommunicatorCopyParams(),
      updateBoard: vi.fn(),
      persistBoard,
      replaceBoard: vi.fn(),
      switchBoard: vi.fn(),
      navigate: vi.fn(),
      getCommunicatorId: vi.fn(),
    });

    expect(result).toEqual({ wasAborted: true });
    expect(mocks.prepareBoardForPersistence).not.toHaveBeenCalled();
    expect(mocks.persistBoardAndSyncNavigation).not.toHaveBeenCalled();
    expect(persistBoard).not.toHaveBeenCalled();
  });

  it('prepares the board and persists with navigation sync using resolved copy state', async () => {
    mocks.resolveProtectedBoardCommunicatorCopy.mockResolvedValueOnce({
      shouldAbort: false,
      createCommunicator: true,
      communicatorCopyResolution: {
        name: 'User - Feelings Board',
        setAsStartup: true,
      },
    });
    mocks.prepareBoardForPersistence.mockReturnValueOnce({
      board: {
        id: 'prepared-board-id',
        name: 'Prepared Board',
        prepared: true,
      },
      createBoard: true,
      previousBoardId: 'persisted-board-id',
    });

    const persistBoard = vi.fn().mockResolvedValue('persisted-copy-id');
    const updateBoard = vi.fn();
    const replaceBoard = vi.fn();
    const switchBoard = vi.fn();
    const navigate = vi.fn();
    const getCommunicatorId = vi.fn().mockReturnValue('active-communicator-id');

    const result = await saveProtectedBoardWorkflow({
      board: createBoard(),
      shouldCreateBoardCopy: true,
      communicatorCopyParams: createCommunicatorCopyParams(),
      updateBoard,
      persistBoard,
      replaceBoard,
      switchBoard,
      navigate,
      getCommunicatorId,
    });

    expect(mocks.resolveProtectedBoardCommunicatorCopy).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldResolveCommunicatorCopy: true,
      }),
    );
    expect(mocks.prepareBoardForPersistence).toHaveBeenCalledWith({
      board: createBoard(),
      shouldCreateBoardCopy: true,
      updateBoard,
    });
    expect(persistBoard).toHaveBeenCalledWith({
      board: {
        id: 'prepared-board-id',
        name: 'Prepared Board',
        prepared: true,
      },
      createCommunicator: true,
      createBoard: true,
      previousBoardId: 'persisted-board-id',
    });
    expect(mocks.persistBoardAndSyncNavigation).toHaveBeenCalledWith({
      persistBoard: expect.any(Function),
      board: {
        id: 'prepared-board-id',
        name: 'Prepared Board',
        prepared: true,
      },
      previousBoardId: 'persisted-board-id',
      shouldReplaceBoard: true,
      replaceBoard,
      switchBoard,
      navigate,
      communicatorId: 'active-communicator-id',
      shouldPersistStartupCommunicator: true,
    });
    expect(getCommunicatorId).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      wasAborted: false,
      persistedBoardId: 'persisted-copy-id',
    });
  });

  it('persists without startup communicator sync when no communicator copy is created', async () => {
    mocks.prepareBoardForPersistence.mockReturnValueOnce({
      board: {
        id: 'editable-board-id',
        name: 'Editable Board',
        prepared: true,
      },
      createBoard: false,
      previousBoardId: 'editable-board-id',
    });

    const persistBoard = vi.fn().mockResolvedValue('editable-board-id');

    await saveProtectedBoardWorkflow({
      board: createBoard({ id: 'editable-board-id' }),
      shouldCreateBoardCopy: false,
      communicatorCopyParams: createCommunicatorCopyParams({
        shouldResolveCommunicatorCopy: false,
      }),
      updateBoard: vi.fn(),
      persistBoard,
      replaceBoard: vi.fn(),
      switchBoard: vi.fn(),
      navigate: vi.fn(),
      getCommunicatorId: vi.fn().mockReturnValue('active-communicator-id'),
    });

    expect(persistBoard).toHaveBeenCalledWith({
      board: {
        id: 'editable-board-id',
        name: 'Editable Board',
        prepared: true,
      },
      createCommunicator: false,
      createBoard: false,
      previousBoardId: 'editable-board-id',
    });
    expect(mocks.persistBoardAndSyncNavigation).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldReplaceBoard: false,
        shouldPersistStartupCommunicator: false,
      }),
    );
  });
});
