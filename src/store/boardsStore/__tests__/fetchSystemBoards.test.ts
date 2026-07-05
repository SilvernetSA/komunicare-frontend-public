// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  apiClientGet: vi.fn(),
}));

vi.mock('../../apiClient', () => ({
  apiClient: {
    get: mocks.apiClientGet,
  },
}));

const SYSTEM_CATALOG_CACHE_KEY = 'komunicare-system-catalog-v1';

const buildBoard = (overrides: Record<string, unknown> = {}) => ({
  id: 'komunicare',
  name: 'Komunicare board',
  author: 'Komunicare',
  email: 'info@komuni.care',
  tiles: [],
  lastEdited: '2026-06-28T00:00:00.000Z',
  ...overrides,
});

describe('fetchSystemBoards', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-29T12:00:00.000Z'));
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses persisted boards as bootstrap but still revalidates on the first fetch of the session', async () => {
    const cachedBoard = buildBoard({ name: 'Cached board' });

    localStorage.setItem(
      SYSTEM_CATALOG_CACHE_KEY,
      JSON.stringify({
        version: 1,
        boards: [cachedBoard],
        communicators: [],
        boardsHash: 'hash-cache',
        communicatorsHash: '',
        boardsCheckedAt: Date.now(),
        communicatorsCheckedAt: 0,
      }),
    );

    mocks.apiClientGet
      .mockResolvedValueOnce({
        data: [
          buildBoard({
            name: 'Remote board A',
            lastEdited: '2026-06-29T12:00:10.000Z',
          }),
        ],
      })
      .mockResolvedValueOnce({
        data: [
          buildBoard({
            name: 'Remote board B',
            lastEdited: '2026-06-29T12:00:31.000Z',
          }),
        ],
      });

    const { fetchSystemBoards, initSystemBoardsCache } =
      await import('../fetchSystemBoards');

    const state = { boards: [] as any[] };
    const set = (patch: any) => {
      const nextPatch = typeof patch === 'function' ? patch(state) : patch;
      Object.assign(state, nextPatch);
    };

    initSystemBoardsCache('hash-cache');

    const firstFetch = fetchSystemBoards(set, () => state.boards);

    expect(state.boards.map((board) => board.name)).toEqual(['Cached board']);

    await firstFetch;

    expect(mocks.apiClientGet).toHaveBeenCalledTimes(1);
    expect(mocks.apiClientGet).toHaveBeenCalledWith(
      '/backoffice/system-boards/public/boards',
    );
    expect(state.boards.find((board) => board.id === 'komunicare')?.name).toBe(
      'Remote board A',
    );

    vi.setSystemTime(new Date('2026-06-29T12:00:20.000Z'));
    await fetchSystemBoards(set, () => state.boards);
    expect(mocks.apiClientGet).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date('2026-06-29T12:00:31.000Z'));
    await fetchSystemBoards(set, () => state.boards);
    expect(mocks.apiClientGet).toHaveBeenCalledTimes(2);
    expect(state.boards.find((board) => board.id === 'komunicare')?.name).toBe(
      'Remote board B',
    );
  });
});
