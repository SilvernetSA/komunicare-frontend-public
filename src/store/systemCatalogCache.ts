import type { Board } from '../types/board';
import type { Communicator } from '../types/communicator';

const SYSTEM_CATALOG_CACHE_KEY = 'komunicare-system-catalog-v1';
const SYSTEM_CATALOG_CACHE_VERSION = 1;

export const SYSTEM_CATALOG_REVALIDATE_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

interface SystemCatalogCache {
  version: number;
  boards: Board[];
  communicators: Communicator[];
  boardsHash: string;
  communicatorsHash: string;
  boardsCheckedAt: number;
  communicatorsCheckedAt: number;
}

const EMPTY_CACHE: SystemCatalogCache = {
  version: SYSTEM_CATALOG_CACHE_VERSION,
  boards: [],
  communicators: [],
  boardsHash: '',
  communicatorsHash: '',
  boardsCheckedAt: 0,
  communicatorsCheckedAt: 0,
};

const isStorageAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.localStorage;
};

const cloneValue = <T>(value: T): T => {
  return JSON.parse(JSON.stringify(value)) as T;
};

const sanitizeBoards = (boards: unknown): Board[] => {
  if (!Array.isArray(boards)) return [];
  return boards.filter((board) => {
    return Boolean((board as Board)?.id);
  }) as Board[];
};

const sanitizeCommunicators = (communicators: unknown): Communicator[] => {
  if (!Array.isArray(communicators)) return [];
  return communicators.filter((communicator) => {
    return Boolean((communicator as Communicator)?.id);
  }) as Communicator[];
};

const parseCache = (rawValue: string | null): SystemCatalogCache | null => {
  if (!rawValue) return null;
  try {
    const parsed = JSON.parse(rawValue) as Partial<SystemCatalogCache>;
    if (parsed.version !== SYSTEM_CATALOG_CACHE_VERSION) {
      return null;
    }
    return {
      version: SYSTEM_CATALOG_CACHE_VERSION,
      boards: sanitizeBoards(parsed.boards),
      communicators: sanitizeCommunicators(parsed.communicators),
      boardsHash:
        typeof parsed.boardsHash === 'string' ? parsed.boardsHash : '',
      communicatorsHash:
        typeof parsed.communicatorsHash === 'string'
          ? parsed.communicatorsHash
          : '',
      boardsCheckedAt:
        typeof parsed.boardsCheckedAt === 'number' ? parsed.boardsCheckedAt : 0,
      communicatorsCheckedAt:
        typeof parsed.communicatorsCheckedAt === 'number'
          ? parsed.communicatorsCheckedAt
          : 0,
    };
  } catch {
    return null;
  }
};

const readSystemCatalogCache = (): SystemCatalogCache | null => {
  if (!isStorageAvailable()) return null;
  return parseCache(window.localStorage.getItem(SYSTEM_CATALOG_CACHE_KEY));
};

const writeSystemCatalogCache = (
  patch: Partial<SystemCatalogCache>,
): SystemCatalogCache | null => {
  if (!isStorageAvailable()) return null;
  const currentCache = readSystemCatalogCache() || EMPTY_CACHE;
  const nextCache: SystemCatalogCache = {
    ...currentCache,
    ...patch,
    version: SYSTEM_CATALOG_CACHE_VERSION,
  };

  try {
    window.localStorage.setItem(
      SYSTEM_CATALOG_CACHE_KEY,
      JSON.stringify(nextCache),
    );
    return nextCache;
  } catch {
    return null;
  }
};

const hashString = (value: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16);
};

export const computeSystemBoardsHash = (boards: Board[]): string => {
  const sortedBoards = [...boards].sort((left, right) =>
    String(left.id || '').localeCompare(String(right.id || '')),
  );
  return hashString(JSON.stringify(sortedBoards));
};

export const computeSystemCommunicatorsHash = (
  communicators: Communicator[],
): string => {
  const sortedCommunicators = [...communicators].sort((left, right) =>
    String(left.id || '').localeCompare(String(right.id || '')),
  );
  return hashString(JSON.stringify(sortedCommunicators));
};

export const getCachedSystemBoards = (): Board[] => {
  const cache = readSystemCatalogCache();
  if (!cache?.boards?.length) return [];
  return cloneValue(cache.boards);
};

export const getCachedSystemCommunicators = (): Communicator[] => {
  const cache = readSystemCatalogCache();
  if (!cache?.communicators?.length) return [];
  return cloneValue(cache.communicators);
};

export const getCachedSystemHashes = (): {
  boardsHash: string;
  communicatorsHash: string;
} => {
  const cache = readSystemCatalogCache();
  return {
    boardsHash: cache?.boardsHash || '',
    communicatorsHash: cache?.communicatorsHash || '',
  };
};

export const shouldRevalidateSystemBoards = (now = Date.now()): boolean => {
  const cache = readSystemCatalogCache();
  if (!cache) return true;
  if (!cache.boardsCheckedAt) return true;
  return now - cache.boardsCheckedAt >= SYSTEM_CATALOG_REVALIDATE_TTL_MS;
};

export const shouldRevalidateSystemCommunicators = (
  now = Date.now(),
): boolean => {
  const cache = readSystemCatalogCache();
  if (!cache) return true;
  if (!cache.communicatorsCheckedAt) return true;
  return now - cache.communicatorsCheckedAt >= SYSTEM_CATALOG_REVALIDATE_TTL_MS;
};

export const persistSystemBoards = (
  boards: Board[],
  boardsHash: string,
  checkedAt = Date.now(),
): void => {
  writeSystemCatalogCache({
    boards: cloneValue(boards),
    boardsHash,
    boardsCheckedAt: checkedAt,
  });
};

export const persistSystemCommunicators = (
  communicators: Communicator[],
  communicatorsHash: string,
  checkedAt = Date.now(),
): void => {
  writeSystemCatalogCache({
    communicators: cloneValue(communicators),
    communicatorsHash,
    communicatorsCheckedAt: checkedAt,
  });
};

export const markSystemBoardsChecked = (checkedAt = Date.now()): void => {
  writeSystemCatalogCache({ boardsCheckedAt: checkedAt });
};

export const markSystemCommunicatorsChecked = (
  checkedAt = Date.now(),
): void => {
  writeSystemCatalogCache({ communicatorsCheckedAt: checkedAt });
};
