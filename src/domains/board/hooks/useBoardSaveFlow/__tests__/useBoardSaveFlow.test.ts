import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getBoardDisplayTitle: vi.fn(),
  isOwnedByUser: vi.fn(),
  isProtectedBoard: vi.fn(),
  isProtectedCommunicator: vi.fn(),
  resolveBundleNameForBoard: vi.fn(),
  resolveCommunicatorBundle: vi.fn(),
  resolveProtectedBoardCommunicatorCopy: vi.fn(),
  prepareBoardForPersistence: vi.fn(),
  saveProtectedBoardWorkflow: vi.fn(),
  fetchMyCommunicators: vi.fn(),
  activeCommunicatorId: 'active-communicator-id',
  communicators: [] as any[],
}));

vi.mock('@/utils/getBoardDisplayTitle', () => ({
  getBoardDisplayTitle: mocks.getBoardDisplayTitle,
}));

vi.mock('../useBoardSaveFlow.copyOnWrite', () => ({
  isOwnedByUser: mocks.isOwnedByUser,
  isProtectedBoard: mocks.isProtectedBoard,
  isProtectedCommunicator: mocks.isProtectedCommunicator,
  resolveBundleNameForBoard: mocks.resolveBundleNameForBoard,
  resolveCommunicatorBundle: mocks.resolveCommunicatorBundle,
  resolveProtectedBoardCommunicatorCopy:
    mocks.resolveProtectedBoardCommunicatorCopy,
}));

vi.mock(
  '@/domains/board/stores/boardsStore/prepareBoardForPersistence',
  () => ({
    prepareBoardForPersistence: mocks.prepareBoardForPersistence,
  }),
);

vi.mock('../useBoardSaveFlow.workflow', () => ({
  saveProtectedBoardWorkflow: mocks.saveProtectedBoardWorkflow,
}));

vi.mock('@/domains/communicator/stores/communicatorsStore', () => ({
  useCommunicatorsStore: {
    getState: () => ({
      activeCommunicatorId: mocks.activeCommunicatorId,
      communicators: mocks.communicators,
      fetchMyCommunicators: mocks.fetchMyCommunicators,
    }),
  },
}));

import { handleApiUpdates } from '../useBoardSaveFlow';

const createBoard = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'protected-board',
    name: 'Feelings Board',
    author: 'Original Author',
    email: 'owner@example.com',
    hidden: false,
    tiles: [],
    ...overrides,
  }) as any;

const createCommunicator = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'official-communicator',
    email: 'owner@example.com',
    name: 'Official Communicator',
    rootBoard: 'protected-board',
    boards: ['protected-board'],
    ...overrides,
  }) as any;

const createIntl = () =>
  ({
    formatMessage: vi.fn(
      (message: { defaultMessage?: string; id?: string } | undefined) =>
        message?.defaultMessage || message?.id || 'message',
    ),
  }) as any;

const createBoardTile = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'board-tile',
    type: 'board',
    label: 'Nested Board',
    loadBoard: 'nested-board-id',
    linkedBoard: false,
    ...overrides,
  }) as any;

const createParams = (overrides: Record<string, unknown> = {}) => ({
  userData: { email: 'user@example.com', name: 'User' } as any,
  communicator: createCommunicator(),
  board: createBoard(),
  intl: createIntl(),
  upsertCommunicator: vi.fn(),
  syncBoardWithCommunicator: vi.fn().mockResolvedValue('persisted-board-id'),
  syncBoardsWithCommunicator: vi
    .fn()
    .mockResolvedValue('persisted-child-board-id'),
  replaceBoard: vi.fn(),
  updateBoard: vi.fn(),
  syncActiveBoardAfterSave: vi.fn(),
  lang: 'en',
  navigate: vi.fn(),
  setSaving: vi.fn(),
  uploadTileSound: vi.fn().mockImplementation(async (tile: any) => tile),
  showNotification: vi.fn(),
  communicators: [],
  onExistingCopyFound: vi.fn(),
  ...overrides,
});

describe('handleApiUpdates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.activeCommunicatorId = 'active-communicator-id';
    mocks.communicators = [];
    mocks.fetchMyCommunicators.mockResolvedValue([]);
    mocks.getBoardDisplayTitle.mockImplementation(
      (board: { name?: string }) => board.name || null,
    );
    mocks.isOwnedByUser.mockReturnValue(false);
    mocks.isProtectedBoard.mockReturnValue(true);
    mocks.isProtectedCommunicator.mockReturnValue(true);
    mocks.resolveBundleNameForBoard.mockReturnValue('');
    mocks.resolveCommunicatorBundle.mockReturnValue('');
    mocks.resolveProtectedBoardCommunicatorCopy.mockResolvedValue({
      shouldAbort: false,
      createCommunicator: false,
      communicatorCopyResolution: null,
    });
    mocks.prepareBoardForPersistence.mockImplementation(
      ({ board, shouldCreateBoardCopy }: any) => ({
        board: { ...board, prepared: true },
        createBoard: shouldCreateBoardCopy,
        previousBoardId: shouldCreateBoardCopy ? board.id : undefined,
      }),
    );
    mocks.saveProtectedBoardWorkflow.mockResolvedValue({
      wasAborted: false,
      persistedBoardId: 'persisted-board-id',
    });
  });

  it('keeps the user-chosen row count when tiles exceed the fixed grid', async () => {
    // Regression: saving used to inflate grid.rows to fit every tile
    // (ceil(tiles/columns)), silently resetting a 2x3 grid to 7 rows.
    // Overflow tiles render on scrollable extra rows now.
    const tiles = Array.from({ length: 7 }, (_, i) => ({
      id: `tile-${i}`,
      label: `Tile ${i}`,
    }));
    const boardWithGrid = createBoard({
      isFixed: true,
      tiles,
      grid: { rows: 2, columns: 3, order: [] },
    });
    const params = createParams({
      board: boardWithGrid,
      // Board-level save (like a title edit or communicator sync).
      processedBoard: boardWithGrid,
    });

    await expect(handleApiUpdates(params as any)).resolves.toBe(true);

    const workflowParams = mocks.saveProtectedBoardWorkflow.mock
      .calls[0][0] as any;
    expect(workflowParams.board.grid.rows).toBe(2);
    expect(workflowParams.board.grid.columns).toBe(3);
    // The order matrix still registers every tile (on overflow rows).
    const orderedIds = workflowParams.board.grid.order.flat().filter(Boolean);
    expect(orderedIds).toHaveLength(7);
  });

  it('passes non-child save wiring into the shared workflow helper', async () => {
    const params = createParams();

    await expect(handleApiUpdates(params as any)).resolves.toBe(true);

    expect(mocks.saveProtectedBoardWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({
        board: expect.objectContaining({
          id: 'protected-board',
          name: 'Feelings Board',
          author: 'User',
          email: 'user@example.com',
          locale: 'en',
        }),
        shouldCreateBoardCopy: true,
        getCommunicatorId: expect.any(Function),
      }),
    );

    const workflowParams = mocks.saveProtectedBoardWorkflow.mock
      .calls[0][0] as any;
    const existingCopy = createCommunicator({
      id: 'existing-copy',
      email: 'user@example.com',
    });

    expect(workflowParams.communicatorCopyParams).toEqual(
      expect.objectContaining({
        shouldResolveCommunicatorCopy: true,
        activeCommunicator: params.communicator,
        communicators: [],
        fallbackCommunicators: mocks.communicators,
        userEmail: 'user@example.com',
        boardId: 'protected-board',
        boardTitle: 'Feelings Board',
      }),
    );
    expect(workflowParams.getCommunicatorId()).toBe('active-communicator-id');
    expect(
      workflowParams.communicatorCopyParams.onExistingCopy(existingCopy),
    ).toBe(true);
    expect(params.onExistingCopyFound).toHaveBeenCalledWith(existingCopy);

    await workflowParams.persistBoard({
      board: { id: 'prepared-parent-id', prepared: true },
      createCommunicator: true,
      createBoard: true,
      previousBoardId: 'protected-board',
    });

    expect(params.syncBoardWithCommunicator).toHaveBeenCalledWith({
      parentBoard: { id: 'prepared-parent-id', prepared: true },
      createCommunicator: true,
      createParentBoard: true,
      previousBoardId: 'protected-board',
    });
    expect(params.setSaving).toHaveBeenNthCalledWith(1, true);
    expect(params.setSaving).toHaveBeenNthCalledWith(2, false);
  });

  it('passes child-board save wiring into the shared workflow helper', async () => {
    const params = createParams({
      tile: {
        id: 'tile-with-child-board',
        type: 'text',
        label: 'Child Board',
        loadBoard: 'child-board-id',
        linkedBoard: false,
        image: 'child-caption',
      },
    });

    await expect(handleApiUpdates(params as any)).resolves.toBe(true);

    const workflowParams = mocks.saveProtectedBoardWorkflow.mock
      .calls[0][0] as any;

    expect(params.updateBoard).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'child-board-id',
        name: 'Child Board',
        caption: 'child-caption',
      }),
    );

    await workflowParams.persistBoard({
      board: { id: 'prepared-parent-id', prepared: true },
      createCommunicator: true,
      createBoard: true,
      previousBoardId: 'protected-board',
    });

    expect(params.syncBoardsWithCommunicator).toHaveBeenCalledWith({
      childBoard: expect.objectContaining({
        id: 'child-board-id',
        name: 'Child Board',
        caption: 'child-caption',
      }),
      parentBoard: { id: 'prepared-parent-id', prepared: true },
      createCommunicator: true,
      createParentBoard: true,
      previousParentBoardId: 'protected-board',
    });
  });

  it('returns false when the board-tile communicator copy resolution aborts', async () => {
    mocks.resolveProtectedBoardCommunicatorCopy.mockResolvedValueOnce({
      shouldAbort: true,
      createCommunicator: false,
      communicatorCopyResolution: null,
    });

    const params = createParams({
      tile: createBoardTile(),
    });

    await expect(handleApiUpdates(params as any)).resolves.toBe(false);

    expect(mocks.saveProtectedBoardWorkflow).not.toHaveBeenCalled();
    expect(mocks.resolveProtectedBoardCommunicatorCopy).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldResolveCommunicatorCopy: true,
      }),
    );
    expect(mocks.prepareBoardForPersistence).not.toHaveBeenCalled();
    expect(params.syncBoardWithCommunicator).not.toHaveBeenCalled();
    expect(params.syncActiveBoardAfterSave).not.toHaveBeenCalled();
    expect(params.navigate).not.toHaveBeenCalled();
  });

  it('persists and navigates the special board-tile branch after communicator-copy resolution', async () => {
    mocks.resolveProtectedBoardCommunicatorCopy.mockResolvedValueOnce({
      shouldAbort: false,
      createCommunicator: true,
      communicatorCopyResolution: {
        name: 'User - Feelings Board',
        setAsStartup: true,
      },
    });

    const params = createParams({
      tile: createBoardTile(),
      syncBoardWithCommunicator: vi
        .fn()
        .mockResolvedValue('returned-child-board-id'),
    });

    await expect(handleApiUpdates(params as any)).resolves.toBe(true);

    expect(mocks.saveProtectedBoardWorkflow).not.toHaveBeenCalled();
    expect(mocks.resolveProtectedBoardCommunicatorCopy).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldResolveCommunicatorCopy: true,
      }),
    );
    expect(mocks.prepareBoardForPersistence).toHaveBeenCalledWith(
      expect.objectContaining({
        board: expect.objectContaining({ id: 'protected-board' }),
        shouldCreateBoardCopy: true,
      }),
    );
    expect(params.syncBoardWithCommunicator).toHaveBeenCalledWith({
      parentBoard: expect.objectContaining({
        id: 'nested-board-id',
        name: 'Nested Board',
      }),
      createCommunicator: true,
      createParentBoard: true,
    });
    expect(params.syncActiveBoardAfterSave).toHaveBeenCalledWith(
      'returned-child-board-id',
    );
    expect(params.navigate).toHaveBeenCalledWith(
      '/communicator/active-communicator-id/board/returned-child-board-id',
      { replace: true },
    );

    expect(
      mocks.resolveProtectedBoardCommunicatorCopy.mock.invocationCallOrder[0],
    ).toBeLessThan(
      mocks.prepareBoardForPersistence.mock.invocationCallOrder[0],
    );
    expect(
      mocks.prepareBoardForPersistence.mock.invocationCallOrder[0],
    ).toBeLessThan(
      params.syncBoardWithCommunicator.mock.invocationCallOrder[0],
    );
  });

  it('uses the shared child-board workflow for board tiles on owned boards', async () => {
    const params = createParams({
      tile: createBoardTile({
        id: 'owned-board-tile',
        loadBoard: 'owned-child-board-id',
      }),
      board: createBoard({
        id: 'owned-board-id',
        email: 'user@example.com',
      }),
      communicator: createCommunicator({
        email: 'user@example.com',
        rootBoard: 'owned-board-id',
      }),
    });

    mocks.isOwnedByUser.mockReturnValue(true);
    mocks.isProtectedBoard.mockReturnValue(false);
    mocks.isProtectedCommunicator.mockReturnValue(false);

    await expect(handleApiUpdates(params as any)).resolves.toBe(true);

    expect(mocks.saveProtectedBoardWorkflow).toHaveBeenCalledTimes(1);
    expect(mocks.resolveProtectedBoardCommunicatorCopy).not.toHaveBeenCalled();
    expect(mocks.prepareBoardForPersistence).not.toHaveBeenCalled();
    expect(params.syncBoardWithCommunicator).not.toHaveBeenCalled();

    const workflowParams = mocks.saveProtectedBoardWorkflow.mock
      .calls[0][0] as any;

    expect(workflowParams.shouldCreateBoardCopy).toBe(false);

    await workflowParams.persistBoard({
      board: { id: 'prepared-owned-parent-id', prepared: true },
      createCommunicator: false,
      createBoard: false,
      previousBoardId: 'owned-board-id',
    });

    expect(params.syncBoardsWithCommunicator).toHaveBeenCalledWith({
      childBoard: expect.objectContaining({
        id: 'owned-child-board-id',
        name: 'Nested Board',
      }),
      parentBoard: { id: 'prepared-owned-parent-id', prepared: true },
      createCommunicator: false,
      createParentBoard: false,
      previousParentBoardId: 'owned-board-id',
    });
  });

  it('includes a new board tile in the parent board payload for owned boards', async () => {
    const createdBoardTile = createBoardTile({
      id: 'new-owned-board-tile',
      loadBoard: 'new-owned-child-board-id',
    });
    const params = createParams({
      tile: createdBoardTile,
      board: createBoard({
        id: 'owned-board-id',
        email: 'user@example.com',
        tiles: [{ id: 'existing-tile', type: 'text', label: 'Existing tile' }],
      }),
      communicator: createCommunicator({
        email: 'user@example.com',
        rootBoard: 'owned-board-id',
      }),
    });

    mocks.isOwnedByUser.mockReturnValue(true);
    mocks.isProtectedBoard.mockReturnValue(false);
    mocks.isProtectedCommunicator.mockReturnValue(false);

    await expect(handleApiUpdates(params as any)).resolves.toBe(true);

    expect(mocks.saveProtectedBoardWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({
        board: expect.objectContaining({
          tiles: expect.arrayContaining([
            expect.objectContaining({ id: 'existing-tile' }),
            expect.objectContaining({ id: 'new-owned-board-tile' }),
          ]),
        }),
      }),
    );
  });

  it('passes official-root existing copy inputs into the shared workflow helper', async () => {
    mocks.isOwnedByUser.mockReturnValue(true);
    mocks.resolveBundleNameForBoard.mockReturnValue('komunicare');
    mocks.resolveCommunicatorBundle.mockReturnValue('komunicare');

    const communicator = createCommunicator({
      email: 'user@example.com',
      rootBoard: 'personal-root',
    });
    const params = createParams({
      board: createBoard({ id: 'komunicare' }),
      communicator,
    });

    await expect(handleApiUpdates(params as any)).resolves.toBe(true);

    const workflowParams = mocks.saveProtectedBoardWorkflow.mock
      .calls[0][0] as any;

    expect(workflowParams.communicatorCopyParams).toEqual(
      expect.objectContaining({
        shouldResolveCommunicatorCopy: true,
        existingCopy: communicator,
        boardId: 'komunicare',
      }),
    );
  });

  it('does not abort when the existing copy is already the active communicator', async () => {
    mocks.isOwnedByUser.mockReturnValue(true);
    mocks.resolveBundleNameForBoard.mockReturnValue('komunicare');
    mocks.resolveCommunicatorBundle.mockReturnValue('komunicare');

    const communicator = createCommunicator({
      id: 'active-copy',
      email: 'user@example.com',
      rootBoard: 'personal-root',
    });
    const onExistingCopyFound = vi.fn();
    const params = createParams({
      board: createBoard({ id: 'komunicare' }),
      communicator,
      onExistingCopyFound,
    });

    await expect(handleApiUpdates(params as any)).resolves.toBe(true);

    const workflowParams = mocks.saveProtectedBoardWorkflow.mock
      .calls[0][0] as any;

    expect(
      workflowParams.communicatorCopyParams.onExistingCopy(communicator),
    ).toBe(false);
    expect(onExistingCopyFound).not.toHaveBeenCalled();
  });

  it('skips communicator-copy resolution for non-protected boards in the shared workflow helper', async () => {
    mocks.isProtectedBoard.mockReturnValue(false);
    mocks.isProtectedCommunicator.mockReturnValue(false);

    const params = createParams({
      board: createBoard({ email: 'user@example.com' }),
      communicator: createCommunicator({ email: 'user@example.com' }),
    });

    await expect(handleApiUpdates(params as any)).resolves.toBe(true);

    const workflowParams = mocks.saveProtectedBoardWorkflow.mock
      .calls[0][0] as any;

    expect(workflowParams.shouldCreateBoardCopy).toBe(false);
    expect(workflowParams.communicatorCopyParams).toEqual(
      expect.objectContaining({
        shouldResolveCommunicatorCopy: false,
      }),
    );
  });
});
