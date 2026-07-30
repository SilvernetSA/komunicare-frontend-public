// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  apiClientGet: vi.fn(),
}));

vi.mock('../apiClient', () => ({
  apiClient: {
    get: mocks.apiClientGet,
  },
  setAuthTokenProvider: vi.fn(),
  setUnauthorizedHandler: vi.fn(),
}));

// Prevent persist middleware from writing to localStorage
vi.mock('zustand/middleware', async () => {
  const actual =
    await vi.importActual<typeof import('zustand/middleware')>(
      'zustand/middleware',
    );
  return {
    ...actual,
    persist: (_storeCreator: any) => _storeCreator,
  };
});

describe('zustand search stores cache', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.apiClientGet.mockResolvedValue({ status: 200, data: null });
  });

  it('reuses cached language metadata by locale', async () => {
    mocks.apiClientGet.mockResolvedValue({
      status: 200,
      data: { lang: 'es-ES', voices: [] },
    });

    const { useLanguageStore } = await import('@/domains/settings/stores/languageStore');

    const first = await useLanguageStore.getState().fetchLanguage('es-ES');
    const second = await useLanguageStore.getState().fetchLanguage('es-ES');

    const languageCalls = mocks.apiClientGet.mock.calls.filter(
      ([url]: [string]) => url.includes('/languages/'),
    );
    expect(languageCalls).toHaveLength(1);
    expect(languageCalls[0][0]).toContain('es-ES');
    expect(second).toEqual(first);
  });

  it('reuses cached Arasaac pictogram searches and image URLs', async () => {
    mocks.apiClientGet.mockImplementation((url: string) => {
      if (url.includes('/search/')) {
        return Promise.resolve({ status: 200, data: [{ _id: 1 }] });
      }
      if (url.includes('/pictograms/')) {
        return Promise.resolve({
          status: 200,
          data: { image: 'https://arasaac.test/image.png' },
        });
      }
      return Promise.resolve({ status: 200, data: null });
    });

    const { useArasaacStore } = await import('@/domains/board/stores/arasaacStore');

    const firstSearch = await useArasaacStore
      .getState()
      .searchPictograms('es', 'hola');
    const secondSearch = await useArasaacStore
      .getState()
      .searchPictograms('es', 'hola');
    const firstImage = await useArasaacStore
      .getState()
      .getImageUrl('/pictograms/1');
    const secondImage = await useArasaacStore
      .getState()
      .getImageUrl('/pictograms/1');

    const searchCalls = mocks.apiClientGet.mock.calls.filter(
      ([url]: [string]) => url.includes('/search/'),
    );
    // Image URL calls are relative paths (e.g. /pictograms/1) — exclude search URLs
    const imageCalls = mocks.apiClientGet.mock.calls.filter(
      ([url]: [string]) =>
        url.includes('/pictograms/') && !url.includes('/search/'),
    );
    expect(searchCalls).toHaveLength(1);
    expect(imageCalls).toHaveLength(1);
    expect(secondSearch).toEqual(firstSearch);
    expect(secondImage).toBe(firstImage);
  });

  it('reuses cached Global Symbols searches', async () => {
    mocks.apiClientGet.mockResolvedValue({
      status: 200,
      data: [{ id: 'symbol-1' }],
    });

    const { useGlobalSymbolsStore } = await import('@/domains/board/stores/globalSymbolsStore');

    const first = await useGlobalSymbolsStore
      .getState()
      .searchPictograms('es', 'comer');
    const second = await useGlobalSymbolsStore
      .getState()
      .searchPictograms('es', 'comer');

    const symbolCalls = mocks.apiClientGet.mock.calls.filter(
      ([url]: [string]) => url.includes('labels/search'),
    );
    expect(symbolCalls).toHaveLength(1);
    expect(second).toEqual(first);
  });
});
