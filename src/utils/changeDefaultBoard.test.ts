// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const communicatorsState = {
    communicators: [] as any[],
    activeCommunicatorId: '',
    changeCommunicator: vi.fn((communicatorId: string) => {
      if (
        communicatorsState.communicators.some(
          (communicator) => communicator.id === communicatorId,
        )
      ) {
        communicatorsState.activeCommunicatorId = communicatorId;
      }
    }),
    editCommunicator: vi.fn((updatedCommunicator: any) => {
      const communicatorIndex = communicatorsState.communicators.findIndex(
        (communicator) => communicator.id === updatedCommunicator.id,
      );

      if (communicatorIndex >= 0) {
        communicatorsState.communicators[communicatorIndex] =
          updatedCommunicator;
      }
    }),
    upsertCommunicator: vi.fn((updatedCommunicator: any) => {
      const communicatorIndex = communicatorsState.communicators.findIndex(
        (communicator) => communicator.id === updatedCommunicator.id,
      );

      if (communicatorIndex >= 0) {
        communicatorsState.communicators[communicatorIndex] =
          updatedCommunicator;
        return;
      }

      communicatorsState.communicators =
        communicatorsState.communicators.concat(updatedCommunicator);
    }),
    fetchMyCommunicators: vi.fn(),
    updateRemoteCommunicator: vi.fn(),
    createRemoteCommunicator: vi.fn(),
  };

  const boardsState = {
    activeBoardId: 'komunicare' as string | undefined,
    boards: [] as any[],
    switchBoard: vi.fn((boardId: string) => {
      boardsState.activeBoardId = boardId;
    }),
  };

  return {
    appState: {
      userData: {
        email: 'user@example.com',
        name: 'User',
        role: 'user',
      },
    },
    communicatorsState,
    boardsState,
    prepareCommunicatorCopyDraft: vi.fn(),
    persistStartupCommunicatorSelection: vi.fn().mockResolvedValue(undefined),
    switchCommunicatorNavigation: vi.fn(),
  };
});

vi.mock('@/domains/app/stores/appStore', () => ({
  useAppStore: {
    getState: () => mocks.appState,
  },
}));

vi.mock('@/domains/board/stores/boardsStore', () => ({
  useBoardsStore: {
    getState: () => mocks.boardsState,
  },
}));

vi.mock('@/domains/communicator/stores/communicatorsStore', () => ({
  useCommunicatorsStore: {
    getState: () => mocks.communicatorsState,
  },
}));

vi.mock('./persistStartupCommunicatorSelection', () => ({
  persistStartupCommunicatorSelection:
    mocks.persistStartupCommunicatorSelection,
}));

vi.mock('./switchCommunicatorNavigation', () => ({
  switchCommunicatorNavigation: mocks.switchCommunicatorNavigation,
}));

vi.mock('@/domains/board/components/Board/utils-simple/copyOnWrite', async () => {
  const actual = await vi.importActual<
    typeof import('@/domains/board/components/Board/utils-simple/copyOnWrite')
  >('@/domains/board/components/Board/utils-simple/copyOnWrite');

  return {
    ...actual,
    prepareCommunicatorCopyDraft: mocks.prepareCommunicatorCopyDraft,
  };
});

import { changeDefaultBoard } from './changeDefaultBoard';

const defaultBoardsIncluded = [
  { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
];

const buildOfficialCommunicator = (
  overrides: Record<string, unknown> = {},
) => ({
  id: 'official_komunicare',
  email: 'catalog-support@example.com',
  name: 'Komunicare',
  rootBoard: 'komunicare',
  boards: ['komunicare', 'feelingsBoard'],
  defaultBoardsIncluded,
  ...overrides,
});

const buildPersonalCopy = (overrides: Record<string, unknown> = {}) => ({
  id: 'copy_komunicare',
  email: 'user@example.com',
  name: 'My Komunicare',
  rootBoard: 'copy_root',
  boards: ['copy_root', 'feelingsBoard'],
  defaultBoardsIncluded,
  copySource: 'komunicare',
  ...overrides,
});

describe('changeDefaultBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.appState.userData = {
      email: 'user@example.com',
      name: 'User',
      role: 'user',
    };

    mocks.boardsState.activeBoardId = 'komunicare';
    mocks.boardsState.boards = [
      { id: 'feelingsBoard', name: 'Feelings Board' },
      { id: 'copy_root', name: 'Copy Home' },
      { id: 'komunicare', name: 'Komunicare Home' },
    ];

    mocks.communicatorsState.communicators = [];
    mocks.communicatorsState.activeCommunicatorId = '';
    mocks.communicatorsState.fetchMyCommunicators.mockResolvedValue([]);
    mocks.communicatorsState.updateRemoteCommunicator.mockImplementation(
      async (communicator: any) => communicator,
    );
    mocks.communicatorsState.createRemoteCommunicator.mockImplementation(
      async ({ communicator }: any) => ({
        ...communicator,
        id: 'remote-copy',
      }),
    );
    mocks.prepareCommunicatorCopyDraft.mockResolvedValue(null);
  });

  it('refreshes communicators to redirect to an existing personal copy', async () => {
    const activeCommunicator = buildOfficialCommunicator();
    const existingCopy = buildPersonalCopy();
    const navigate = vi.fn();

    mocks.communicatorsState.communicators = [activeCommunicator];
    mocks.communicatorsState.activeCommunicatorId = activeCommunicator.id;
    mocks.communicatorsState.fetchMyCommunicators.mockImplementation(
      async () => {
        mocks.communicatorsState.communicators = [
          activeCommunicator,
          existingCopy,
        ];

        return [activeCommunicator, existingCopy];
      },
    );

    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await changeDefaultBoard(
      { type: 'custom', boardId: 'feelingsBoard' },
      navigate,
    );

    expect(mocks.communicatorsState.fetchMyCommunicators).toHaveBeenCalledWith({
      force: true,
    });
    expect(mocks.communicatorsState.changeCommunicator).toHaveBeenCalledWith(
      existingCopy.id,
    );
    expect(mocks.communicatorsState.activeCommunicatorId).toBe(existingCopy.id);
    expect(mocks.switchCommunicatorNavigation).toHaveBeenCalledWith({
      communicator: existingCopy,
      navigate,
      skipBoardNavigation: false,
    });
    expect(mocks.prepareCommunicatorCopyDraft).not.toHaveBeenCalled();
    expect(
      mocks.communicatorsState.createRemoteCommunicator,
    ).not.toHaveBeenCalled();
  });

  it('updates the active communicator in place when it is already the existing copy', async () => {
    const activeCommunicator = buildPersonalCopy({
      id: 'komunicare_default',
      rootBoard: 'copy_root',
    });
    const navigate = vi.fn();

    mocks.boardsState.activeBoardId = 'copy_root';
    mocks.communicatorsState.communicators = [activeCommunicator];
    mocks.communicatorsState.activeCommunicatorId = activeCommunicator.id;

    await changeDefaultBoard(
      { type: 'custom', boardId: 'feelingsBoard' },
      navigate,
    );

    expect(
      mocks.communicatorsState.fetchMyCommunicators,
    ).not.toHaveBeenCalled();
    expect(mocks.communicatorsState.editCommunicator).toHaveBeenCalledWith(
      expect.objectContaining({
        id: activeCommunicator.id,
        rootBoard: 'feelingsBoard',
        boards: expect.arrayContaining(['copy_root', 'feelingsBoard']),
      }),
    );
    expect(
      mocks.communicatorsState.updateRemoteCommunicator,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        id: activeCommunicator.id,
        rootBoard: 'feelingsBoard',
      }),
    );
    expect(mocks.communicatorsState.upsertCommunicator).toHaveBeenCalledWith(
      expect.objectContaining({
        id: activeCommunicator.id,
        rootBoard: 'feelingsBoard',
      }),
    );
    expect(mocks.switchCommunicatorNavigation).toHaveBeenCalledWith({
      communicator: expect.objectContaining({
        id: activeCommunicator.id,
        rootBoard: 'feelingsBoard',
      }),
      navigate,
      skipBoardNavigation: true,
    });
    expect(mocks.communicatorsState.changeCommunicator).not.toHaveBeenCalled();
    expect(mocks.prepareCommunicatorCopyDraft).not.toHaveBeenCalled();
    expect(
      mocks.communicatorsState.createRemoteCommunicator,
    ).not.toHaveBeenCalled();
  });

  it('falls through to copy creation when no existing copy can be found', async () => {
    const activeCommunicator = buildOfficialCommunicator();
    const navigate = vi.fn();

    mocks.communicatorsState.communicators = [activeCommunicator];
    mocks.communicatorsState.activeCommunicatorId = activeCommunicator.id;
    mocks.prepareCommunicatorCopyDraft.mockResolvedValue({
      communicatorDraft: buildPersonalCopy({
        id: 'temp-copy',
        name: 'User - Feelings Board',
        rootBoard: 'komunicare',
      }),
      resolution: {
        name: 'User - Feelings Board',
        setAsStartup: true,
      },
    });

    await changeDefaultBoard(
      { type: 'custom', boardId: 'feelingsBoard' },
      navigate,
      'Communicator name',
    );

    expect(mocks.communicatorsState.fetchMyCommunicators).toHaveBeenCalledWith({
      force: true,
    });
    expect(mocks.prepareCommunicatorCopyDraft).toHaveBeenCalledWith({
      communicator: activeCommunicator,
      userData: mocks.appState.userData,
      boardTitle: 'Feelings Board',
      boardId: 'feelingsBoard',
      promptText: 'Communicator name',
    });
    expect(
      mocks.communicatorsState.createRemoteCommunicator,
    ).toHaveBeenCalledWith({
      communicator: expect.objectContaining({
        id: 'temp-copy',
        rootBoard: 'feelingsBoard',
        boards: expect.arrayContaining(['komunicare', 'feelingsBoard']),
      }),
      tempId: 'temp-copy',
    });
    expect(mocks.communicatorsState.changeCommunicator).toHaveBeenCalledWith(
      'temp-copy',
    );
    expect(mocks.persistStartupCommunicatorSelection).toHaveBeenCalledWith({
      communicatorId: 'remote-copy',
      shouldPersist: true,
    });
  });

  it('switches dynamic system communicators using their root instead of reusing the active board', async () => {
    const navigate = vi.fn();
    const selectedCommunicator = {
      id: 'official_feelings',
      email: 'catalog-support@example.com',
      name: 'Feelings',
      rootBoard: 'feelings_root',
      boards: ['feelings_root', 'feelingsBoard'],
      defaultBoardsIncluded: defaultBoardsIncluded,
    };

    mocks.boardsState.activeBoardId = 'feelingsBoard';
    mocks.boardsState.boards = [
      { id: 'feelings_root', name: 'Feelings Root' },
      { id: 'feelingsBoard', name: 'Feelings Board' },
    ];
    mocks.communicatorsState.communicators = [
      buildOfficialCommunicator({
        id: 'official_komunicare',
        rootBoard: 'komunicare',
        boards: ['komunicare', 'feelingsBoard'],
      }),
      selectedCommunicator,
    ];
    mocks.communicatorsState.activeCommunicatorId = 'official_komunicare';
    mocks.switchCommunicatorNavigation.mockImplementationOnce(
      ({ communicator, navigate, preferActiveBoard = true }: any) => {
        mocks.communicatorsState.changeCommunicator(communicator.id);

        const activeBoardId = mocks.boardsState.activeBoardId;
        const nextBoardId =
          (preferActiveBoard &&
            activeBoardId &&
            communicator.boards?.includes(activeBoardId) &&
            activeBoardId) ||
          communicator.rootBoard ||
          communicator.boards?.[0] ||
          '';

        if (!nextBoardId) {
          return;
        }

        mocks.boardsState.switchBoard(nextBoardId);
        navigate?.(`/communicator/${communicator.id}/board/${nextBoardId}`, {
          replace: true,
        });
      },
    );

    await changeDefaultBoard(
      { type: 'default', boardName: selectedCommunicator.id },
      navigate,
    );

    expect(mocks.switchCommunicatorNavigation).toHaveBeenCalledWith({
      communicator: selectedCommunicator,
      navigate,
      preferActiveBoard: false,
    });
    expect(mocks.communicatorsState.changeCommunicator).toHaveBeenCalledWith(
      selectedCommunicator.id,
    );
    expect(navigate).toHaveBeenCalledWith(
      '/communicator/official_feelings/board/feelings_root',
      { replace: true },
    );
  });
});
