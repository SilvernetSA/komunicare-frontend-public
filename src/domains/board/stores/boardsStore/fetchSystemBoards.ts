import { apiClient } from '@/store/apiClient';
import {
  computeSystemBoardsHash,
  getCachedSystemBoards,
  markSystemBoardsChecked,
  persistSystemBoards,
} from '@/domains/board/stores/systemCatalogCache';
import { mergeRemoteBoards } from './boardStateHelpers';
import { normalizeApiBoard } from './normalizeApiBoard';

import type { Board } from '@/types/board';

export const SYSTEM_BOARDS_RUNTIME_CACHE_TTL_MS = 30 * 1000;

export let fetchSystemBoardsInFlight: Promise<void> | null = null;
export let systemBoardsLoadedAt = 0;
export let systemBoardsHash = '';

export const initSystemBoardsCache = (cachedHash: string) => {
  systemBoardsLoadedAt = 0;
  systemBoardsHash = cachedHash;
};

export const fetchSystemBoards = async (
  set: (patch: any) => void,
  getBoards: () => Board[],
): Promise<void> => {
  const now = Date.now();

  const cachedBoards = getCachedSystemBoards();
  if (cachedBoards.length) {
    const currentBoards = getBoards();
    const cachedBoardsMissingInState = cachedBoards.some(
      (cachedBoard) =>
        !currentBoards.some((board) => board.id === cachedBoard.id),
    );

    if (cachedBoardsMissingInState) {
      set((state: any) => ({
        boards: mergeRemoteBoards(state.boards, cachedBoards),
      }));
    }

    if (!systemBoardsHash) {
      systemBoardsHash = computeSystemBoardsHash(cachedBoards);
    }
  }

  const hasLocalBoards = getBoards().length > 0;
  const isRuntimeCacheFresh =
    systemBoardsLoadedAt > 0 &&
    now - systemBoardsLoadedAt < SYSTEM_BOARDS_RUNTIME_CACHE_TTL_MS;

  if (isRuntimeCacheFresh && hasLocalBoards) {
    return;
  }

  if (fetchSystemBoardsInFlight) return fetchSystemBoardsInFlight;

  fetchSystemBoardsInFlight = (async () => {
    try {
      let systemBoards: Board[] = [];
      try {
        const { data } = await apiClient.get<any[]>(
          '/backoffice/system-boards/public/boards',
        );
        if (Array.isArray(data)) {
          systemBoards = data
            .map((b: any) =>
              normalizeApiBoard(b, {
                forceSystemBoard: true,
              }),
            )
            .filter((b) => !!b.id) as Board[];
        }
      } catch {
        // silent
      }

      if (systemBoards.length) {
        const nextHash = computeSystemBoardsHash(systemBoards);

        if (nextHash !== systemBoardsHash) {
          set((state: any) => ({
            boards: mergeRemoteBoards(state.boards, systemBoards),
          }));
          persistSystemBoards(systemBoards, nextHash);
          systemBoardsHash = nextHash;
        } else {
          markSystemBoardsChecked();
        }
      } else {
        markSystemBoardsChecked();
      }
      systemBoardsLoadedAt = Date.now();
    } catch {
      // Silencioso
    } finally {
      fetchSystemBoardsInFlight = null;
    }
  })();

  return fetchSystemBoardsInFlight;
};
