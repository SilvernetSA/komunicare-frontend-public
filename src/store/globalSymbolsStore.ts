import { create } from 'zustand';

import { searchPictogramsFactory } from './globalSymbolsStore/searchPictogramsFactory';

const GLOBAL_SYMBOLS_CACHE_TTL_MS = 60 * 1000;

export interface GlobalSymbolsStore {
  searchPictograms: (locale: string, searchText: string) => Promise<any[]>;
}

export const useGlobalSymbolsStore = create<GlobalSymbolsStore>()(() => {
  const globalSymbolsCache = {
    byQuery: new Map<string, { data: any[]; fetchedAt: number }>(),
    inFlight: new Map<string, Promise<any[]>>(),
    ttlMs: GLOBAL_SYMBOLS_CACHE_TTL_MS,
  };

  return {
    searchPictograms: searchPictogramsFactory(globalSymbolsCache),
  };
});
