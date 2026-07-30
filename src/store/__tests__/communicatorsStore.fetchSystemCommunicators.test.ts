// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  appStoreState: {
    userData: {} as Record<string, unknown>,
  },
  apiClientGet: vi.fn(),
  apiClientPost: vi.fn(),
  apiClientPut: vi.fn(),
  apiClientDelete: vi.fn(),
}));

vi.mock('../appStore', () => ({
  useAppStore: {
    getState: () => mocks.appStoreState,
  },
}));

vi.mock('../apiClient', () => ({
  apiClient: {
    get: mocks.apiClientGet,
    post: mocks.apiClientPost,
    put: mocks.apiClientPut,
    delete: mocks.apiClientDelete,
  },
  getQueryParameters: (obj: Record<string, unknown> = {}): string => {
    return Object.keys(obj)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(obj[key]))}`,
      )
      .join('&');
  },
}));

const SYSTEM_CATALOG_CACHE_KEY = 'komunicare-system-catalog-v1';

const buildCacheCommunicator = (overrides: Record<string, unknown> = {}) => ({
  id: 'comm-cache',
  name: 'Cached',
  description: '',
  author: 'Komunicare',
  email: 'info@komuni.care',
  rootBoard: 'komunicare',
  boards: ['komunicare'],
  defaultBoardsIncluded: [],
  ...overrides,
});

const buildApiCommunicator = (overrides: Record<string, unknown> = {}) => ({
  id: 'comm-api',
  name: 'Official',
  description: '',
  rootBoard: 'komunicare',
  boards: ['komunicare'],
  defaultBoardsIncluded: [],
  ...overrides,
});

const readSystemCatalogCache = () => {
  return JSON.parse(localStorage.getItem(SYSTEM_CATALOG_CACHE_KEY) || '{}');
};

describe('useCommunicatorsStore.fetchSystemCommunicators', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-29T12:00:00.000Z'));
    localStorage.clear();
    mocks.appStoreState.userData = {};
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses persisted communicators as bootstrap but still revalidates on first fetch', async () => {
    localStorage.setItem(
      SYSTEM_CATALOG_CACHE_KEY,
      JSON.stringify({
        version: 1,
        boards: [],
        communicators: [buildCacheCommunicator()],
        boardsHash: '',
        communicatorsHash: 'hash-cache',
        boardsCheckedAt: Date.now(),
        communicatorsCheckedAt: Date.now(),
      }),
    );
    mocks.apiClientGet
      .mockResolvedValueOnce({
        data: [buildApiCommunicator({ id: 'comm-official-1' })],
      })
      .mockResolvedValueOnce({
        data: [buildApiCommunicator({ id: 'comm-official-2' })],
      });

    const { useCommunicatorsStore } = await import('@/domains/communicator/stores/communicatorsStore');

    expect(
      useCommunicatorsStore
        .getState()
        .communicators.map((communicator) => communicator.id),
    ).toEqual(['comm-cache']);

    await useCommunicatorsStore.getState().fetchSystemCommunicators();

    expect(mocks.apiClientGet).toHaveBeenCalledTimes(1);
    expect(mocks.apiClientGet).toHaveBeenCalledWith(
      '/backoffice/system-boards/public/communicators',
    );
    expect(
      useCommunicatorsStore
        .getState()
        .communicators.map((communicator) => communicator.id),
    ).toContain('comm-official-1');

    vi.setSystemTime(new Date('2026-06-29T12:00:20.000Z'));
    await useCommunicatorsStore.getState().fetchSystemCommunicators();
    expect(mocks.apiClientGet).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date('2026-06-29T12:00:31.000Z'));
    await useCommunicatorsStore.getState().fetchSystemCommunicators();
    expect(mocks.apiClientGet).toHaveBeenCalledTimes(2);
  });

  it('keeps cached communicators and does not stamp checkedAt on failure or empty responses', async () => {
    localStorage.setItem(
      SYSTEM_CATALOG_CACHE_KEY,
      JSON.stringify({
        version: 1,
        boards: [],
        communicators: [buildCacheCommunicator()],
        boardsHash: '',
        communicatorsHash: 'hash-cache',
        boardsCheckedAt: 0,
        communicatorsCheckedAt: 0,
      }),
    );
    mocks.apiClientGet
      .mockRejectedValueOnce(new Error('Network down'))
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [buildApiCommunicator({ id: 'comm-official-success' })],
      });

    const { useCommunicatorsStore } = await import('@/domains/communicator/stores/communicatorsStore');

    await useCommunicatorsStore.getState().fetchSystemCommunicators();
    expect(mocks.apiClientGet).toHaveBeenCalledTimes(1);
    expect(readSystemCatalogCache().communicatorsCheckedAt).toBe(0);
    expect(
      useCommunicatorsStore
        .getState()
        .communicators.map((communicator) => communicator.id),
    ).toEqual(['comm-cache']);

    await useCommunicatorsStore.getState().fetchSystemCommunicators();
    expect(mocks.apiClientGet).toHaveBeenCalledTimes(2);
    expect(readSystemCatalogCache().communicatorsCheckedAt).toBe(0);
    expect(
      useCommunicatorsStore
        .getState()
        .communicators.map((communicator) => communicator.id),
    ).toEqual(['comm-cache']);

    await useCommunicatorsStore.getState().fetchSystemCommunicators();
    expect(mocks.apiClientGet).toHaveBeenCalledTimes(3);
    expect(readSystemCatalogCache().communicatorsCheckedAt).toBe(Date.now());
    expect(
      useCommunicatorsStore
        .getState()
        .communicators.map((communicator) => communicator.id),
    ).toContain('comm-official-success');
  });
});
