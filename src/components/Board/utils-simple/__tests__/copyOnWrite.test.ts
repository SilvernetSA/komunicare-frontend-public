// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

import { switchCommunicatorNavigation } from '../../../../utils/switchCommunicatorNavigation';
import {
  buildCommunicatorCopy,
  createAndActivateCommunicatorCopy,
  findExistingPersonalCopyForBoard,
  findExistingPersonalCopyForBoardWithRefresh,
  isProtectedBoard,
  isProtectedCommunicator,
  prepareCommunicatorCopyDraft,
  resolveOrCreateCommunicatorCopy,
  resolveProtectedBoardCommunicatorCopy,
  resolveCommunicatorCopySource,
  requestCommunicatorCopyConfiguration,
  setCommunicatorCopyDialogHandler,
} from '../copyOnWrite';

vi.mock('../../../../utils/switchCommunicatorNavigation', () => ({
  switchCommunicatorNavigation: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
  setCommunicatorCopyDialogHandler(null);
});

describe('copyOnWrite protections', () => {
  it('treats official root boards as protected even if board email matches user', () => {
    const userData = { email: 'user@example.com', name: 'User' } as any;
    const board = {
      id: 'komunicare',
      email: 'user@example.com',
    } as any;

    expect(isProtectedBoard(board, userData)).toBe(false);
  });

  it('treats official root boards as protected when board is not owned by user', () => {
    const userData = { email: 'user@example.com', name: 'User' } as any;
    const board = {
      id: 'komunicare',
      email: 'info@komuni.care',
    } as any;

    expect(isProtectedBoard(board, userData)).toBe(true);
  });

  it('treats default communicator as protected even if communicator email matches user', () => {
    const userData = { email: 'user@example.com', name: 'User' } as any;
    const communicator = {
      id: 'komunicare_default',
      email: 'user@example.com',
      defaultBoardsIncluded: [],
    } as any;

    expect(isProtectedCommunicator(communicator, userData)).toBe(true);
  });

  it('falls back to browser prompt when no dialog handler is registered', async () => {
    const promptSpy = vi
      .spyOn(window, 'prompt')
      .mockReturnValue('Mi copia oficial');

    const resolution = await requestCommunicatorCopyConfiguration(
      {
        id: 'official_advanced',
        name: 'Komunicare',
      } as any,
      'prompt',
      'default',
    );

    expect(promptSpy).toHaveBeenCalled();
    expect(resolution).toEqual({
      name: 'Mi copia oficial',
      setAsStartup: false,
    });
  });

  it('builds a communicator copy draft even when userData is temporarily unavailable', async () => {
    setCommunicatorCopyDialogHandler(
      vi.fn().mockResolvedValue({
        name: 'My fallback copy',
        setAsStartup: false,
      }),
    );

    const result = await prepareCommunicatorCopyDraft({
      communicator: {
        id: 'official_advanced',
        name: 'Avanzado',
        author: 'Komunicare',
        email: 'info@komuni.care',
        description: 'Comunicador Avanzado',
        boards: ['root'],
        rootBoard: 'root',
        defaultBoardsIncluded: [],
      } as any,
      userData: undefined,
      boardTitle: 'Home Board',
      promptText: 'prompt',
    });

    expect(result).toMatchObject({
      communicatorDraft: {
        name: 'My fallback copy',
        author: 'Komunicare',
        email: 'info@komuni.care',
      },
      resolution: {
        name: 'My fallback copy',
        setAsStartup: false,
      },
    });
  });

  it('creates and activates a communicator copy through the shared helper', async () => {
    const dialogHandler = vi.fn().mockResolvedValue({
      name: 'User - My Feelings Board',
      setAsStartup: true,
    });
    const navigate = vi.fn();
    const showNotification = vi.fn();
    const upsertCommunicator = vi.fn();
    setCommunicatorCopyDialogHandler(dialogHandler);

    const result = await createAndActivateCommunicatorCopy({
      communicator: {
        id: 'komunicare_default',
        name: 'Komunicare',
        description: 'Komunicare default communicator',
        email: 'support@komuni.care',
        rootBoard: 'komunicare',
        boards: ['komunicare', 'jjmlUcQs19'],
        defaultBoardsIncluded: [
          { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
        ],
      } as any,
      userData: { email: 'user@example.com', name: 'User' } as any,
      boardTitle: 'My Feelings Board',
      promptText: 'prompt',
      noticeMessage: 'notice',
      upsertCommunicator,
      navigate,
      showNotification,
    });

    expect(dialogHandler).toHaveBeenCalledWith({
      communicator: expect.objectContaining({ id: 'komunicare_default' }),
      promptText: 'prompt',
      suggestedName: 'User - My Feelings Board',
    });
    expect(result).toEqual({
      communicator: expect.objectContaining({
        name: 'User - My Feelings Board',
        email: 'user@example.com',
      }),
      resolution: {
        name: 'User - My Feelings Board',
        setAsStartup: true,
      },
    });
    expect(upsertCommunicator).toHaveBeenCalledWith(result?.communicator);
    expect(switchCommunicatorNavigation).toHaveBeenCalledWith({
      communicator: result?.communicator,
      navigate,
      skipBoardNavigation: true,
    });
    expect(showNotification).toHaveBeenCalledWith('notice');
  });

  it('prepares a communicator copy draft without side effects', async () => {
    const dialogHandler = vi.fn().mockResolvedValue({
      name: 'User - My Feelings Board',
      setAsStartup: true,
    });
    setCommunicatorCopyDialogHandler(dialogHandler);

    const result = await prepareCommunicatorCopyDraft({
      communicator: {
        id: 'komunicare_default',
        name: 'Komunicare',
        description: 'Komunicare default communicator',
        email: 'support@komuni.care',
        rootBoard: 'komunicare',
        boards: ['komunicare', 'jjmlUcQs19'],
        defaultBoardsIncluded: [
          { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
        ],
      } as any,
      userData: { email: 'user@example.com', name: 'User' } as any,
      boardTitle: 'My Feelings Board',
      promptText: 'prompt',
    });

    expect(dialogHandler).toHaveBeenCalledWith({
      communicator: expect.objectContaining({ id: 'komunicare_default' }),
      promptText: 'prompt',
      suggestedName: 'User - My Feelings Board',
    });
    expect(result).toEqual({
      communicatorDraft: expect.objectContaining({
        name: 'User - My Feelings Board',
        email: 'user@example.com',
      }),
      resolution: {
        name: 'User - My Feelings Board',
        setAsStartup: true,
      },
    });
    expect(switchCommunicatorNavigation).not.toHaveBeenCalled();
  });

  it('returns null without side effects when communicator copy creation is cancelled', async () => {
    const navigate = vi.fn();
    const showNotification = vi.fn();
    const upsertCommunicator = vi.fn();
    setCommunicatorCopyDialogHandler(vi.fn().mockResolvedValue(null));

    const result = await createAndActivateCommunicatorCopy({
      communicator: {
        id: 'official_komunicare',
        name: 'Komunicare',
        email: 'support@komuni.care',
        rootBoard: 'komunicare',
        boards: ['komunicare'],
        defaultBoardsIncluded: [
          { nameOnJSON: 'advanced', homeBoard: 'root' },
          { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
        ],
      } as any,
      userData: { email: 'user@example.com', name: 'User' } as any,
      boardTitle: 'My Board',
      promptText: 'prompt',
      noticeMessage: 'notice',
      upsertCommunicator,
      navigate,
      showNotification,
    });

    expect(result).toBeNull();
    expect(upsertCommunicator).not.toHaveBeenCalled();
    expect(switchCommunicatorNavigation).not.toHaveBeenCalled();
    expect(showNotification).not.toHaveBeenCalled();
  });

  it('finds an existing personal copy by board membership to avoid duplicate communicator creation', () => {
    const activeCommunicator = {
      id: 'official_advanced',
      email: 'support@komuni.care',
      defaultBoardsIncluded: [
        { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
      ],
      boards: ['komunicare', 'feelingsBoard'],
      rootBoard: 'komunicare',
    } as any;

    const existingCopy = {
      id: '6a021aec02c5301e646b29d7',
      email: 'user@example.com',
      name: 'Komunicare',
      defaultBoardsIncluded: [
        { nameOnJSON: 'komunicare', homeBoard: '6a021aec02c53057006b29d3' },
      ],
      boards: ['6a021aec02c53057006b29d3', 'feelingsBoard'],
      rootBoard: '6a021aec02c53057006b29d3',
    } as any;

    const found = findExistingPersonalCopyForBoard({
      communicators: [activeCommunicator, existingCopy] as any,
      activeCommunicator,
      userEmail: 'user@example.com',
      boardId: 'feelingsBoard',
    });

    expect(found?.id).toBe(existingCopy.id);
  });

  it('finds komunicare personal copy when canonical root board was already replaced', () => {
    const activeCommunicator = {
      id: 'official_komunicare',
      email: 'support@komuni.care',
      name: "Komunicare's Communicator",
      rootBoard: 'komunicare',
      boards: ['komunicare', 'feelingsBoard', 'chatBoard'],
      defaultBoardsIncluded: [
        { nameOnJSON: 'advanced', homeBoard: 'root' },
        { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
      ],
    } as any;

    const personalCopy = {
      id: '6a02237402c530c4446b2b2c',
      email: 'user@example.com',
      name: "user - Komunicare's Communicator",
      rootBoard: '6a02237402c530c4446b2b2c',
      boards: ['root', 'jjmlUcQs19', '6a02237402c530c4446b2b2c'],
      defaultBoardsIncluded: [
        { nameOnJSON: 'advanced', homeBoard: 'root' },
        { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
      ],
    } as any;

    const found = findExistingPersonalCopyForBoard({
      communicators: [activeCommunicator, personalCopy] as any,
      activeCommunicator,
      userEmail: 'user@example.com',
      boardId: 'komunicare',
    });

    expect(found?.id).toBe(personalCopy.id);
  });

  it('accepts temporary local copy ids to avoid duplicate creation before API id sync', () => {
    const activeCommunicator = {
      id: 'official_komunicare',
      email: 'support@komuni.care',
      name: "Komunicare's Communicator",
      rootBoard: 'komunicare',
      boards: ['komunicare', 'feelingsBoard'],
      defaultBoardsIncluded: [
        { nameOnJSON: 'advanced', homeBoard: 'root' },
        { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
      ],
    } as any;

    const localUnsyncedCopy = {
      id: 'tmp123',
      email: 'user@example.com',
      name: "user - Komunicare's Communicator",
      rootBoard: '6a02237402c530c4446b2b2c',
      boards: ['root', 'jjmlUcQs19', '6a02237402c530c4446b2b2c'],
      defaultBoardsIncluded: [
        { nameOnJSON: 'advanced', homeBoard: 'root' },
        { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
      ],
    } as any;

    const found = findExistingPersonalCopyForBoard({
      communicators: [activeCommunicator, localUnsyncedCopy] as any,
      activeCommunicator,
      userEmail: 'user@example.com',
      boardId: 'komunicare',
    });

    expect(found?.id).toBe(localUnsyncedCopy.id);
  });

  it('finds an existing personal copy by explicit copySource', () => {
    const activeCommunicator = {
      id: 'official_komunicare',
      email: 'support@komuni.care',
      name: 'Komunicare',
      rootBoard: 'komunicare',
      boards: ['komunicare', 'feelingsBoard'],
      defaultBoardsIncluded: [
        { nameOnJSON: 'advanced', homeBoard: 'root' },
        { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
      ],
    } as any;

    const personalCopy = {
      id: 'copy_1',
      email: 'user@example.com',
      name: 'Mi Komunicare',
      rootBoard: '6a02237402c530c4446b2b2c',
      boards: ['6a02237402c530c4446b2b2c'],
      copySource: 'komunicare',
    } as any;

    const found = findExistingPersonalCopyForBoard({
      communicators: [activeCommunicator, personalCopy] as any,
      activeCommunicator,
      userEmail: 'user@example.com',
      boardId: 'komunicare',
    });

    expect(found?.id).toBe('copy_1');
  });

  it('returns the local personal copy without forcing a refresh', async () => {
    const activeCommunicator = {
      id: 'official_komunicare',
      email: 'support@komuni.care',
      name: 'Komunicare',
      rootBoard: 'komunicare',
      boards: ['komunicare', 'feelingsBoard'],
      defaultBoardsIncluded: [
        { nameOnJSON: 'advanced', homeBoard: 'root' },
        { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
      ],
    } as any;

    const personalCopy = {
      id: 'copy_local',
      email: 'user@example.com',
      name: 'My Komunicare',
      rootBoard: 'copy_root',
      boards: ['copy_root'],
      copySource: 'komunicare',
    } as any;

    const fetchMyCommunicators = vi.fn().mockResolvedValue([]);

    const found = await findExistingPersonalCopyForBoardWithRefresh({
      communicators: [activeCommunicator, personalCopy] as any,
      fallbackCommunicators: [activeCommunicator, personalCopy] as any,
      activeCommunicator,
      userEmail: 'user@example.com',
      boardId: 'komunicare',
      fetchMyCommunicators,
    });

    expect(found?.id).toBe('copy_local');
    expect(fetchMyCommunicators).not.toHaveBeenCalled();
  });

  it('retries after a forced refresh when no local personal copy exists', async () => {
    const activeCommunicator = {
      id: 'official_komunicare',
      email: 'support@komuni.care',
      name: 'Komunicare',
      rootBoard: 'komunicare',
      boards: ['komunicare', 'feelingsBoard'],
      defaultBoardsIncluded: [
        { nameOnJSON: 'advanced', homeBoard: 'root' },
        { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
      ],
    } as any;

    const refreshedCopy = {
      id: 'copy_refreshed',
      email: 'user@example.com',
      name: 'My Komunicare',
      rootBoard: 'copy_root',
      boards: ['copy_root'],
      copySource: 'komunicare',
    } as any;

    const fetchMyCommunicators = vi
      .fn()
      .mockResolvedValue([activeCommunicator, refreshedCopy]);

    const found = await findExistingPersonalCopyForBoardWithRefresh({
      communicators: [activeCommunicator] as any,
      fallbackCommunicators: [activeCommunicator] as any,
      activeCommunicator,
      userEmail: 'user@example.com',
      boardId: 'komunicare',
      fetchMyCommunicators,
    });

    expect(fetchMyCommunicators).toHaveBeenCalledWith({ force: true });
    expect(found?.id).toBe('copy_refreshed');
  });

  it('falls back to refreshed-store communicators when the refresh returns an empty list', async () => {
    const activeCommunicator = {
      id: 'official_komunicare',
      email: 'support@komuni.care',
      name: 'Komunicare',
      rootBoard: 'komunicare',
      boards: ['komunicare', 'feelingsBoard'],
      defaultBoardsIncluded: [
        { nameOnJSON: 'advanced', homeBoard: 'root' },
        { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
      ],
    } as any;

    const storeCopy = {
      id: 'copy_from_store',
      email: 'user@example.com',
      name: 'My Komunicare',
      rootBoard: 'copy_root',
      boards: ['copy_root'],
      copySource: 'komunicare',
    } as any;

    const found = await findExistingPersonalCopyForBoardWithRefresh({
      communicators: [activeCommunicator] as any,
      fallbackCommunicators: [activeCommunicator, storeCopy] as any,
      activeCommunicator,
      userEmail: 'user@example.com',
      boardId: 'komunicare',
      fetchMyCommunicators: vi.fn().mockResolvedValue([]),
    });

    expect(found?.id).toBe('copy_from_store');
  });

  it('returns a provided existing communicator copy without refreshing or creating', async () => {
    const activeCommunicator = {
      id: 'official_komunicare',
      email: 'support@komuni.care',
      name: 'Komunicare',
      rootBoard: 'komunicare',
      boards: ['komunicare', 'feelingsBoard'],
      defaultBoardsIncluded: [
        { nameOnJSON: 'advanced', homeBoard: 'root' },
        { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
      ],
    } as any;

    const existingCopy = {
      id: 'copy_active',
      email: 'user@example.com',
      name: 'My Komunicare',
      rootBoard: 'copy_root',
      boards: ['copy_root'],
      copySource: 'komunicare',
    } as any;

    const fetchMyCommunicators = vi.fn().mockResolvedValue([]);
    const upsertCommunicator = vi.fn();
    const navigate = vi.fn();
    const showNotification = vi.fn();

    const result = await resolveOrCreateCommunicatorCopy({
      existingCopy,
      communicators: [activeCommunicator] as any,
      fallbackCommunicators: [activeCommunicator] as any,
      activeCommunicator,
      userEmail: 'user@example.com',
      boardId: 'komunicare',
      fetchMyCommunicators,
      userData: { email: 'user@example.com', name: 'User' } as any,
      boardTitle: 'Feelings Board',
      promptText: 'prompt',
      noticeMessage: 'notice',
      upsertCommunicator,
      navigate,
      showNotification,
    });

    expect(result).toEqual({
      kind: 'existing',
      communicator: existingCopy,
    });
    expect(fetchMyCommunicators).not.toHaveBeenCalled();
    expect(upsertCommunicator).not.toHaveBeenCalled();
    expect(switchCommunicatorNavigation).not.toHaveBeenCalled();
    expect(showNotification).not.toHaveBeenCalled();
  });

  it('returns an existing communicator copy after refresh without creating a new one', async () => {
    const activeCommunicator = {
      id: 'official_komunicare',
      email: 'support@komuni.care',
      name: 'Komunicare',
      rootBoard: 'komunicare',
      boards: ['komunicare', 'feelingsBoard'],
      defaultBoardsIncluded: [
        { nameOnJSON: 'advanced', homeBoard: 'root' },
        { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
      ],
    } as any;

    const refreshedCopy = {
      id: 'copy_refreshed',
      email: 'user@example.com',
      name: 'My Komunicare',
      rootBoard: 'copy_root',
      boards: ['copy_root'],
      copySource: 'komunicare',
    } as any;

    const upsertCommunicator = vi.fn();
    const navigate = vi.fn();
    const showNotification = vi.fn();
    const fetchMyCommunicators = vi
      .fn()
      .mockResolvedValue([activeCommunicator, refreshedCopy]);

    const result = await resolveOrCreateCommunicatorCopy({
      communicators: [activeCommunicator] as any,
      fallbackCommunicators: [activeCommunicator] as any,
      activeCommunicator,
      userEmail: 'user@example.com',
      boardId: 'komunicare',
      fetchMyCommunicators,
      userData: { email: 'user@example.com', name: 'User' } as any,
      boardTitle: 'Feelings Board',
      promptText: 'prompt',
      noticeMessage: 'notice',
      upsertCommunicator,
      navigate,
      showNotification,
    });

    expect(result).toEqual({
      kind: 'existing',
      communicator: refreshedCopy,
    });
    expect(fetchMyCommunicators).toHaveBeenCalledWith({ force: true });
    expect(upsertCommunicator).not.toHaveBeenCalled();
    expect(switchCommunicatorNavigation).not.toHaveBeenCalled();
    expect(showNotification).not.toHaveBeenCalled();
  });

  it('creates and activates a communicator copy when no existing copy is found', async () => {
    const dialogHandler = vi.fn().mockResolvedValue({
      name: 'User - My Feelings Board',
      setAsStartup: true,
    });
    const activeCommunicator = {
      id: 'komunicare_default',
      name: 'Komunicare',
      description: 'Komunicare default communicator',
      email: 'support@komuni.care',
      rootBoard: 'komunicare',
      boards: ['komunicare', 'jjmlUcQs19'],
      defaultBoardsIncluded: [
        { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
      ],
    } as any;

    const upsertCommunicator = vi.fn();
    const navigate = vi.fn();
    const showNotification = vi.fn();
    setCommunicatorCopyDialogHandler(dialogHandler);

    const result = await resolveOrCreateCommunicatorCopy({
      communicators: [activeCommunicator] as any,
      fallbackCommunicators: [activeCommunicator] as any,
      activeCommunicator,
      userEmail: 'user@example.com',
      boardId: 'komunicare',
      fetchMyCommunicators: vi.fn().mockResolvedValue([activeCommunicator]),
      userData: { email: 'user@example.com', name: 'User' } as any,
      boardTitle: 'My Feelings Board',
      promptText: 'prompt',
      noticeMessage: 'notice',
      upsertCommunicator,
      navigate,
      showNotification,
    });

    expect(dialogHandler).toHaveBeenCalledWith({
      communicator: expect.objectContaining({ id: 'komunicare_default' }),
      promptText: 'prompt',
      suggestedName: 'User - My Feelings Board',
    });
    expect(result).toMatchObject({
      kind: 'created',
      communicator: expect.objectContaining({
        name: 'User - My Feelings Board',
        email: 'user@example.com',
      }),
      resolution: {
        name: 'User - My Feelings Board',
        setAsStartup: true,
      },
    });
    expect(upsertCommunicator).toHaveBeenCalledWith(
      (result as any).communicator,
    );
    expect(switchCommunicatorNavigation).toHaveBeenCalledWith({
      communicator: (result as any).communicator,
      navigate,
      skipBoardNavigation: true,
    });
    expect(showNotification).toHaveBeenCalledWith('notice');
  });

  it('aborts protected-board copy workflow after handling an existing communicator copy', async () => {
    const activeCommunicator = {
      id: 'official_komunicare',
      email: 'support@komuni.care',
      name: 'Komunicare',
      rootBoard: 'komunicare',
      boards: ['komunicare', 'feelingsBoard'],
      defaultBoardsIncluded: [
        { nameOnJSON: 'advanced', homeBoard: 'root' },
        { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
      ],
    } as any;
    const existingCopy = {
      id: 'copy_active',
      email: 'user@example.com',
      name: 'My Komunicare',
      rootBoard: 'copy_root',
      boards: ['copy_root'],
      copySource: 'komunicare',
    } as any;

    const onExistingCopy = vi.fn().mockReturnValue(true);
    const fetchMyCommunicators = vi.fn().mockResolvedValue([]);

    const result = await resolveProtectedBoardCommunicatorCopy({
      shouldResolveCommunicatorCopy: true,
      existingCopy,
      communicators: [activeCommunicator] as any,
      fallbackCommunicators: [activeCommunicator] as any,
      activeCommunicator,
      userEmail: 'user@example.com',
      boardId: 'komunicare',
      fetchMyCommunicators,
      userData: { email: 'user@example.com', name: 'User' } as any,
      boardTitle: 'Feelings Board',
      promptText: 'prompt',
      noticeMessage: 'notice',
      upsertCommunicator: vi.fn(),
      navigate: vi.fn(),
      showNotification: vi.fn(),
      onExistingCopy,
    });

    expect(result).toEqual({
      shouldAbort: true,
      createCommunicator: false,
      communicatorCopyResolution: null,
    });
    expect(onExistingCopy).toHaveBeenCalledWith(existingCopy);
    expect(fetchMyCommunicators).not.toHaveBeenCalled();
  });

  it('continues protected-board copy workflow after handling an existing communicator copy', async () => {
    const activeCommunicator = {
      id: 'official_komunicare',
      email: 'support@komuni.care',
      name: 'Komunicare',
      rootBoard: 'komunicare',
      boards: ['komunicare', 'feelingsBoard'],
      defaultBoardsIncluded: [
        { nameOnJSON: 'advanced', homeBoard: 'root' },
        { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
      ],
    } as any;
    const existingCopy = {
      id: 'copy_active',
      email: 'user@example.com',
      name: 'My Komunicare',
      rootBoard: 'copy_root',
      boards: ['copy_root'],
      copySource: 'komunicare',
    } as any;

    const onExistingCopy = vi.fn().mockReturnValue(false);

    const result = await resolveProtectedBoardCommunicatorCopy({
      shouldResolveCommunicatorCopy: true,
      existingCopy,
      communicators: [activeCommunicator] as any,
      fallbackCommunicators: [activeCommunicator] as any,
      activeCommunicator,
      userEmail: 'user@example.com',
      boardId: 'komunicare',
      fetchMyCommunicators: vi.fn().mockResolvedValue([]),
      userData: { email: 'user@example.com', name: 'User' } as any,
      boardTitle: 'Feelings Board',
      promptText: 'prompt',
      noticeMessage: 'notice',
      upsertCommunicator: vi.fn(),
      navigate: vi.fn(),
      showNotification: vi.fn(),
      onExistingCopy,
    });

    expect(result).toEqual({
      shouldAbort: false,
      createCommunicator: false,
      communicatorCopyResolution: null,
    });
    expect(onExistingCopy).toHaveBeenCalledWith(existingCopy);
  });

  it('propagates communicator creation state from the protected-board copy workflow', async () => {
    const dialogHandler = vi.fn().mockResolvedValue({
      name: 'User - My Feelings Board',
      setAsStartup: true,
    });
    const activeCommunicator = {
      id: 'official_advanced',
      name: 'Avanzado',
      description: 'Comunicador Avanzado',
      email: 'support@komuni.care',
      rootBoard: 'root',
      boards: ['root', 'jjmlUcQs19', 'komunicare'],
      defaultBoardsIncluded: [
        { nameOnJSON: 'advanced', homeBoard: 'root' },
        { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
      ],
    } as any;

    setCommunicatorCopyDialogHandler(dialogHandler);

    const result = await resolveProtectedBoardCommunicatorCopy({
      shouldResolveCommunicatorCopy: true,
      communicators: [activeCommunicator] as any,
      fallbackCommunicators: [activeCommunicator] as any,
      activeCommunicator,
      userEmail: 'user@example.com',
      boardId: 'root',
      fetchMyCommunicators: vi.fn().mockResolvedValue([activeCommunicator]),
      userData: { email: 'user@example.com', name: 'User' } as any,
      boardTitle: 'My Feelings Board',
      promptText: 'prompt',
      noticeMessage: 'notice',
      upsertCommunicator: vi.fn(),
      navigate: vi.fn(),
      showNotification: vi.fn(),
    });

    expect(result).toEqual({
      shouldAbort: false,
      createCommunicator: true,
      communicatorCopyResolution: {
        name: 'User - My Feelings Board',
        setAsStartup: true,
      },
    });
  });

  it('aborts protected-board copy workflow when communicator copy creation is cancelled', async () => {
    const activeCommunicator = {
      id: 'official_advanced',
      name: 'Avanzado',
      description: 'Comunicador Avanzado',
      email: 'support@komuni.care',
      rootBoard: 'root',
      boards: ['root', 'jjmlUcQs19', 'komunicare'],
      defaultBoardsIncluded: [
        { nameOnJSON: 'advanced', homeBoard: 'root' },
        { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
      ],
    } as any;

    setCommunicatorCopyDialogHandler(vi.fn().mockResolvedValue(null));

    const result = await resolveProtectedBoardCommunicatorCopy({
      shouldResolveCommunicatorCopy: true,
      communicators: [activeCommunicator] as any,
      fallbackCommunicators: [activeCommunicator] as any,
      activeCommunicator,
      userEmail: 'user@example.com',
      boardId: 'root',
      fetchMyCommunicators: vi.fn().mockResolvedValue([activeCommunicator]),
      userData: { email: 'user@example.com', name: 'User' } as any,
      boardTitle: 'My Feelings Board',
      promptText: 'prompt',
      noticeMessage: 'notice',
      upsertCommunicator: vi.fn(),
      navigate: vi.fn(),
      showNotification: vi.fn(),
    });

    expect(result).toEqual({
      shouldAbort: true,
      createCommunicator: false,
      communicatorCopyResolution: null,
    });
  });

  it('buildCommunicatorCopy sets copy source metadata from official communicator', () => {
    const officialCommunicator = {
      id: 'komunicare_default',
      email: 'support@komuni.care',
      name: 'Komunicare',
      rootBoard: 'komunicare',
      boards: ['komunicare', 'jjmlUcQs19'],
      defaultBoardsIncluded: [
        { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
      ],
    } as any;

    const copy = buildCommunicatorCopy(
      officialCommunicator,
      { email: 'user@example.com', name: 'User' } as any,
      'User - Komunicare',
    );

    expect(resolveCommunicatorCopySource(copy as any)).toBe('komunicare');
    expect(copy.copySource).toBe('komunicare');
    expect(copy.copySourceCommunicatorId).toBe('komunicare_default');
  });
});
