import { create } from 'zustand';

import { getImageUrlFactory } from './arasaacStore/getImageUrlFactory';
import { searchPictogramsFactory } from './arasaacStore/searchPictogramsFactory';

const ARASAAC_CACHE_TTL_MS = 60 * 1000;

export interface ArasaacStore {
  searchPictograms: (locale: string, searchText: string) => Promise<any[]>;
  getImageUrl: (pictogGetTextPath: string) => Promise<string>;
}

export const useArasaacStore = create<ArasaacStore>()(() => {
  const arasaacSearchCache = {
    byQuery: new Map<string, { data: any[]; fetchedAt: number }>(),
    inFlight: new Map<string, Promise<any[]>>(),
    ttlMs: ARASAAC_CACHE_TTL_MS,
  };

  const arasaacImageCache = {
    byPath: new Map<string, { fetchedAt: number; url: string }>(),
    inFlight: new Map<string, Promise<string>>(),
    ttlMs: ARASAAC_CACHE_TTL_MS,
  };

  return {
    searchPictograms: searchPictogramsFactory(arasaacSearchCache),
    getImageUrl: getImageUrlFactory(arasaacImageCache),
  };
});
