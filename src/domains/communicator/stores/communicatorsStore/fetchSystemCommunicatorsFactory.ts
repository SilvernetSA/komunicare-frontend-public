import { normalizeCommunicatorDefaultBoardsIncluded } from '@/utils/defaultBoardsIncluded';
import { apiClient } from '@/store/apiClient';
import {
  computeSystemCommunicatorsHash,
  getCachedSystemCommunicators,
  persistSystemCommunicators,
} from '@/domains/board/stores/systemCatalogCache';

import type { Communicator } from '@/types/communicator';
import type { CommunicatorsStore } from '../communicatorsStore';

export const SYSTEM_COMMUNICATORS_RUNTIME_CACHE_TTL_MS = 30 * 1000;
export const OFFICIAL_SYSTEM_ROOT_BOARDS = new Set(['komunicare']);

export let fetchSystemCommunicatorsInFlight: Promise<void> | null = null;
export let systemCommunicatorsLoadedAt = 0;
export let systemCommunicatorsHash = '';
export let systemCommunicatorIds = new Set<string>();

export const initSystemCommunicatorsCache = (
  cachedCommunicators: Communicator[],
  cachedHash: string,
) => {
  systemCommunicatorsLoadedAt = 0;
  systemCommunicatorsHash = cachedHash;
  systemCommunicatorIds = new Set(
    cachedCommunicators
      .map((c) => String((c as any)?.id || ''))
      .filter(Boolean),
  );
};

interface SystemCommunicatorResponse {
  id: string;
  name: string;
  description: string;
  rootBoard: string;
  boards: string[];
  defaultBoardsIncluded: { nameOnJSON: string; homeBoard: string }[];
}

export const fetchSystemCommunicatorsFactory =
  (
    set: (patch: any) => void,
    get: () => CommunicatorsStore,
    defaultCommunicatorID: string,
  ) =>
  async (options: { force?: boolean } = {}): Promise<void> => {
    const { force = false } = options;
    const now = Date.now();

    const cachedCommunicators = getCachedSystemCommunicators();
    if (cachedCommunicators.length) {
      const normalizedCachedCommunicators = cachedCommunicators.map(
        normalizeCommunicatorDefaultBoardsIncluded,
      );
      systemCommunicatorIds = new Set(
        normalizedCachedCommunicators
          .map((communicator) => String(communicator.id || ''))
          .filter(Boolean),
      );
      const stateCommunicators = get().communicators;
      const cachedCommunicatorsMissingInState =
        normalizedCachedCommunicators.some(
          (cachedCommunicator) =>
            !stateCommunicators.some(
              (communicator) => communicator.id === cachedCommunicator.id,
            ),
        );

      if (cachedCommunicatorsMissingInState) {
        set((state: any) => {
          const userCommunicators = state.communicators.filter(
            (communicator: Communicator) =>
              !normalizedCachedCommunicators.some(
                (systemCommunicator) =>
                  systemCommunicator.id === communicator.id,
              ),
          );
          const merged = [
            ...normalizedCachedCommunicators,
            ...userCommunicators,
          ];
          const currentActiveExists = merged.some(
            (communicator) => communicator.id === state.activeCommunicatorId,
          );
          return {
            communicators: merged,
            activeCommunicatorId: currentActiveExists
              ? state.activeCommunicatorId
              : (normalizedCachedCommunicators[0]?.id ?? defaultCommunicatorID),
          };
        });
      }

      if (!systemCommunicatorsHash) {
        systemCommunicatorsHash = computeSystemCommunicatorsHash(
          normalizedCachedCommunicators,
        );
      }
    }

    const hasLocalCommunicators = get().communicators.length > 0;
    const hasOfficialCommunicators = get().communicators.some((communicator) =>
      OFFICIAL_SYSTEM_ROOT_BOARDS.has(
        String(communicator?.rootBoard || '').trim(),
      ),
    );
    const isRuntimeCacheFresh =
      systemCommunicatorsLoadedAt > 0 &&
      now - systemCommunicatorsLoadedAt <
        SYSTEM_COMMUNICATORS_RUNTIME_CACHE_TTL_MS;

    if (
      !force &&
      isRuntimeCacheFresh &&
      hasLocalCommunicators &&
      hasOfficialCommunicators
    ) {
      return;
    }

    if (fetchSystemCommunicatorsInFlight)
      return fetchSystemCommunicatorsInFlight;

    fetchSystemCommunicatorsInFlight = (async () => {
      try {
        let systemComms: Communicator[] = [];
        try {
          const { data } = await apiClient.get<SystemCommunicatorResponse[]>(
            '/backoffice/system-boards/public/communicators',
          );
          if (Array.isArray(data)) {
            systemComms = data.map((c) => ({
              id: c.id,
              name: c.name,
              description: c.description || '',
              author: 'Komunicare',
              email: 'info@komuni.care',
              rootBoard: c.rootBoard,
              boards: c.boards,
              defaultBoardsIncluded: c.defaultBoardsIncluded || [],
              caption: (c as any).caption,
            }));
          }
        } catch {
          // silent
        }

        if (!systemComms.length) {
          return;
        }

        const normalizedSystemCommunicators = systemComms.map(
          normalizeCommunicatorDefaultBoardsIncluded,
        );
        systemCommunicatorIds = new Set(
          normalizedSystemCommunicators
            .map((communicator) => String(communicator.id || ''))
            .filter(Boolean),
        );
        const nextHash = computeSystemCommunicatorsHash(
          normalizedSystemCommunicators,
        );

        if (nextHash !== systemCommunicatorsHash) {
          set((state: any) => {
            const userComms = state.communicators.filter(
              (communicator: Communicator) =>
                !normalizedSystemCommunicators.some(
                  (systemCommunicator) =>
                    systemCommunicator.id === communicator.id,
                ),
            );
            const merged = [...normalizedSystemCommunicators, ...userComms];
            const currentActiveExists = merged.some(
              (communicator) => communicator.id === state.activeCommunicatorId,
            );
            return {
              communicators: merged,
              activeCommunicatorId: currentActiveExists
                ? state.activeCommunicatorId
                : (normalizedSystemCommunicators[0]?.id ??
                  defaultCommunicatorID),
            };
          });
          persistSystemCommunicators(normalizedSystemCommunicators, nextHash);
          systemCommunicatorsHash = nextHash;
        } else {
          persistSystemCommunicators(normalizedSystemCommunicators, nextHash);
        }

        systemCommunicatorsLoadedAt = Date.now();
      } catch {
        // Silencioso
      } finally {
        fetchSystemCommunicatorsInFlight = null;
      }
    })();

    return fetchSystemCommunicatorsInFlight;
  };
