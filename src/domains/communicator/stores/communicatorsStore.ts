import { create } from 'zustand';

import type { Communicator } from '@/types/communicator';
import type {
  CommunicatorPageParams,
  CommunicatorPageResponse,
} from '@/types/communicator';

import { useAppStore } from '@/domains/app/stores/appStore';
import {
  getCachedSystemCommunicators,
  getCachedSystemHashes,
} from '@/domains/board/stores/systemCatalogCache';
import { applyLoginSuccessFactory } from '@/domains/communicator/stores/communicatorsStore/applyLoginSuccessFactory';
import { copyOfficialCommunicatorFactory } from '@/domains/communicator/stores/communicatorsStore/copyOfficialCommunicatorFactory';
import { copyPublicCommunicatorFactory } from '@/domains/communicator/stores/communicatorsStore/copyPublicCommunicatorFactory';
import { createRemoteCommunicatorFactory } from '@/domains/communicator/stores/communicatorsStore/createRemoteCommunicatorFactory';
import { deleteRemoteCommunicatorFactory } from '@/domains/communicator/stores/communicatorsStore/deleteRemoteCommunicatorFactory';
import {
  fetchMyCommunicatorsFactory,
  resetCommunicatorsFetchCache,
} from '@/domains/communicator/stores/communicatorsStore/fetchMyCommunicatorsFactory';
import {
  fetchPublicCommunicatorsPage,
  resetPublicCommunicatorsPageCache,
} from '@/domains/communicator/stores/communicatorsStore/fetchPublicCommunicatorsPage';
import {
  fetchSystemCommunicatorsFactory,
  initSystemCommunicatorsCache,
  systemCommunicatorIds,
} from '@/domains/communicator/stores/communicatorsStore/fetchSystemCommunicatorsFactory';
import { mergeCommunicators } from '@/domains/communicator/stores/communicatorsStore/mergeCommunicators';
import { updateRemoteCommunicatorFactory } from '@/domains/communicator/stores/communicatorsStore/updateRemoteCommunicatorFactory';
import {
  normalizeCommunicatorDefaultBoardsIncluded,
  normalizeDefaultBoardsIncluded,
} from '@/utils/defaultBoardsIncluded';

interface DefaultBoardData {
  nameOnJSON: string;
  homeBoard: string;
}

export interface CommunicatorState {
  communicators: Communicator[];
  activeCommunicatorId: string;
  isFetching: boolean;
}

const defaultOfficialCommunicatorId = 'komunicare';

// Bootstrap system communicators from persisted data
const cachedSystemCommunicators = getCachedSystemCommunicators();
const cachedSystemHashes = getCachedSystemHashes();
initSystemCommunicatorsCache(
  cachedSystemCommunicators,
  cachedSystemHashes.communicatorsHash || '',
);

const mergeSystemWithUserCommunicators = (
  currentCommunicators: Communicator[],
  myCommunicatorsFromApi: Communicator[],
): Communicator[] => {
  if (!systemCommunicatorIds.size) {
    return mergeCommunicators(currentCommunicators, myCommunicatorsFromApi);
  }

  const normalizedMyCommunicators = (myCommunicatorsFromApi || []).map(
    normalizeCommunicatorDefaultBoardsIncluded,
  );
  const systemCommunicators = currentCommunicators.filter((communicator) =>
    systemCommunicatorIds.has(String(communicator.id || '')),
  );

  return [...systemCommunicators, ...normalizedMyCommunicators];
};

const getPersistedPreferredCommunicatorId = (
  communicators: Communicator[],
): string | undefined => {
  const userData = (useAppStore.getState().userData as any) || {};
  const candidateIds = [
    userData.activeCommunicatorId,
    userData.settings?.activeCommunicatorId,
    userData.settings?.communicatorId,
  ]
    .map((communicatorId) => String(communicatorId || '').trim())
    .filter(Boolean);

  return candidateIds.find((communicatorId) =>
    communicators.some((communicator) => communicator.id === communicatorId),
  );
};

const syncPreferredCommunicatorInAppStore = (communicatorId: string): void => {
  if (!communicatorId) {
    return;
  }

  const appStore = useAppStore.getState() as {
    updateUserData?: (payload: Record<string, unknown>) => void;
    userData?: Record<string, unknown>;
  };
  const currentUserData = appStore.userData || {};

  if (!currentUserData.email || typeof appStore.updateUserData !== 'function') {
    return;
  }

  appStore.updateUserData({
    ...currentUserData,
    activeCommunicatorId: communicatorId,
    settings: {
      ...((currentUserData.settings as Record<string, unknown>) || {}),
      activeCommunicatorId: communicatorId,
      communicatorId,
    },
  });
};

const buildInitialCommunicatorState = (): CommunicatorState => {
  const communicators = cachedSystemCommunicators.map(
    normalizeCommunicatorDefaultBoardsIncluded,
  );
  const activeCommunicatorId =
    communicators[0]?.id || defaultOfficialCommunicatorId;

  return {
    communicators,
    activeCommunicatorId,
    isFetching: false,
  };
};

const initialCommunicatorState = buildInitialCommunicatorState();

export interface CommunicatorsStore extends CommunicatorState {
  logout: () => void;
  importCommunicator: (communicator: Communicator) => void;
  createCommunicator: (communicator: Communicator) => void;
  upsertCommunicator: (communicator: Communicator) => void;
  deleteCommunicator: (communicatorId: string) => void;
  changeCommunicator: (communicatorId: string) => void;
  setApiFetching: (value: boolean) => void;
  setApiStarted: () => void;
  setApiFailure: () => void;
  editCommunicator: (communicator: Communicator) => void;
  addBoardCommunicator: (boardId: string, communicatorId?: string) => void;
  deleteBoardCommunicator: (boardId: string, communicatorId?: string) => void;
  replaceBoardCommunicator: (payload: {
    prevBoardId: string;
    nextBoardId: string;
    communicatorId?: string;
  }) => void;
  addDefaultBoardIncluded: (payload: DefaultBoardData) => void;
  updateDefaultBoardsIncluded: (payload: DefaultBoardData[]) => void;
  applyLoginSuccess: (payload: unknown) => void;
  createApiCommunicatorSuccess: (payload: {
    communicator: Communicator;
    communicatorId: string;
  }) => void;
  updateApiCommunicatorSuccess: () => void;
  getApiMyCommunicatorsSuccess: (payload: { data: Communicator[] }) => void;
  fetchMyCommunicators: (options?: {
    force?: boolean;
  }) => Promise<Communicator[]>;
  fetchPublicCommunicatorsPage: (
    params?: CommunicatorPageParams,
  ) => Promise<CommunicatorPageResponse>;
  fetchSystemCommunicators: (options?: { force?: boolean }) => Promise<void>;
  createRemoteCommunicator: (payload: {
    communicator: Communicator;
    tempId: string;
  }) => Promise<Communicator>;
  copyOfficialCommunicator: (communicatorId: string) => Promise<Communicator>;
  copyPublicCommunicator: (communicatorId: string) => Promise<Communicator>;
  updateRemoteCommunicator: (
    communicator: Communicator,
  ) => Promise<Communicator>;
  setDefaultCommunicator: (communicatorId: string) => Promise<void>;
  deleteRemoteCommunicator: (communicatorId: string) => Promise<void>;
  applyLogout: () => void;
}

export const useCommunicatorsStore = create<CommunicatorsStore>()((
  set,
  get,
) => {
  const createCommunicatorCache = {
    inFlight: null as Promise<Communicator> | null,
  };

  return {
    ...initialCommunicatorState,

    // ── Simple inline actions ────────────────────────────────────────────────

    logout: () => set({ ...initialCommunicatorState }),

    importCommunicator: (communicator) => {
      set((state) => ({
        communicators: state.communicators.concat(
          normalizeCommunicatorDefaultBoardsIncluded(communicator),
        ),
      }));
    },

    createCommunicator: (communicator) => {
      set((state) => ({
        communicators: state.communicators.concat(
          normalizeCommunicatorDefaultBoardsIncluded(communicator),
        ),
      }));
    },

    upsertCommunicator: (communicator) => {
      const normalizedCommunicator =
        normalizeCommunicatorDefaultBoardsIncluded(communicator);
      set((state) => {
        const index = state.communicators.findIndex(
          (c) => c.id === normalizedCommunicator.id,
        );
        if (index < 0) {
          return {
            communicators: state.communicators.concat(normalizedCommunicator),
          };
        }
        const updated = [...state.communicators];
        updated[index] = normalizedCommunicator;
        return { communicators: updated };
      });
    },

    deleteCommunicator: (communicatorId) => {
      set((state) => ({
        communicators: state.communicators.filter(
          ({ id }) => id !== communicatorId,
        ),
      }));
    },

    changeCommunicator: (communicatorId) => {
      if (get().activeCommunicatorId === communicatorId) return;
      const exists = get().communicators.find(
        ({ id }) => id === communicatorId,
      );
      if (!exists) return;
      set({ activeCommunicatorId: communicatorId });
      syncPreferredCommunicatorInAppStore(communicatorId);
    },

    setApiFetching: (value) => set({ isFetching: Boolean(value) }),
    setApiStarted: () => set({ isFetching: true }),
    setApiFailure: () => set({ isFetching: false }),

    editCommunicator: (communicator) => {
      const normalizedCommunicator =
        normalizeCommunicatorDefaultBoardsIncluded(communicator);
      set((state) => {
        const index = state.communicators.findIndex(
          (c) => c.id === normalizedCommunicator.id,
        );
        if (index < 0) return state;
        const updated = [...state.communicators];
        updated[index] = normalizedCommunicator;
        return { communicators: updated };
      });
    },

    addBoardCommunicator: (boardId, communicatorId) => {
      set((state) => {
        const targetCommunicatorId =
          communicatorId || state.activeCommunicatorId;
        const active = state.communicators.find(
          (c) => c.id === targetCommunicatorId,
        );
        if (!active) return state;
        const index = state.communicators.indexOf(active);
        const boards = active.boards || [];
        if (boards.includes(boardId)) return state;
        const updated = [...state.communicators];
        updated[index] = { ...active, boards: [...boards, boardId] };
        return { communicators: updated };
      });
    },

    deleteBoardCommunicator: (boardId, communicatorId) => {
      set((state) => {
        const targetCommunicatorId =
          communicatorId || state.activeCommunicatorId;
        const active = state.communicators.find(
          (c) => c.id === targetCommunicatorId,
        );
        if (!active || !active.boards) return state;
        const index = state.communicators.indexOf(active);
        const updated = [...state.communicators];
        updated[index] = {
          ...active,
          boards: active.boards.filter((id) => id !== boardId),
        };
        return { communicators: updated };
      });
    },

    replaceBoardCommunicator: ({
      prevBoardId,
      nextBoardId,
      communicatorId,
    }) => {
      set((state) => {
        const targetCommunicatorId =
          communicatorId || state.activeCommunicatorId;
        const active = state.communicators.find(
          (c) => c.id === targetCommunicatorId,
        );
        if (!active || !active.boards) return state;
        const index = state.communicators.indexOf(active);
        const boardIndex = active.boards.indexOf(prevBoardId);
        if (boardIndex === -1) return state;
        const boards = [...active.boards];
        boards[boardIndex] = nextBoardId;
        const updated = [...state.communicators];
        updated[index] = { ...active, boards };
        return { communicators: updated };
      });
    },

    addDefaultBoardIncluded: (payload) => {
      set((state) => {
        const active = state.communicators.find(
          (c) => c.id === state.activeCommunicatorId,
        );
        if (!active) return state;
        const index = state.communicators.indexOf(active);
        const defaultBoardsIncluded = normalizeDefaultBoardsIncluded(
          active.defaultBoardsIncluded
            ? [...active.defaultBoardsIncluded, payload]
            : [payload],
        );
        const updated = [...state.communicators];
        updated[index] = { ...active, defaultBoardsIncluded };
        return { communicators: updated };
      });
    },

    updateDefaultBoardsIncluded: (payload) => {
      set((state) => {
        const active = state.communicators.find(
          (c) => c.id === state.activeCommunicatorId,
        );
        if (!active) return state;
        const index = state.communicators.indexOf(active);
        const updated = [...state.communicators];
        updated[index] = {
          ...active,
          defaultBoardsIncluded: normalizeDefaultBoardsIncluded(payload),
        };
        return { communicators: updated };
      });
    },

    createApiCommunicatorSuccess: ({ communicator, communicatorId }) => {
      resetCommunicatorsFetchCache();
      set((state) => ({
        isFetching: false,
        activeCommunicatorId:
          state.activeCommunicatorId === communicatorId
            ? communicator.id
            : state.activeCommunicatorId,
        communicators: state.communicators.map((c) =>
          c.id === communicatorId ? { ...c, id: communicator.id } : c,
        ),
      }));
    },

    updateApiCommunicatorSuccess: () => {
      resetCommunicatorsFetchCache();
      set({ isFetching: false });
    },

    getApiMyCommunicatorsSuccess: ({ data }) => {
      const state = get();
      const myCommunicators = mergeSystemWithUserCommunicators(
        state.communicators,
        data,
      );
      const persistedPreferredCommunicatorId =
        getPersistedPreferredCommunicatorId(myCommunicators);
      const defaultCommunicatorId = myCommunicators.find(
        (communicator) => communicator.isDefault,
      )?.id;
      const currentActiveExists = myCommunicators.some(
        (communicator) => communicator.id === state.activeCommunicatorId,
      );
      const currentNonSystemCommunicatorId =
        currentActiveExists &&
        !systemCommunicatorIds.has(state.activeCommunicatorId)
          ? state.activeCommunicatorId
          : '';
      let activeCommunicatorId =
        persistedPreferredCommunicatorId ||
        currentNonSystemCommunicatorId ||
        defaultCommunicatorId ||
        '';

      if (
        !activeCommunicatorId &&
        systemCommunicatorIds.has(state.activeCommunicatorId)
      ) {
        // Active communicator is a system one. If the user has a personal
        // copy of it, switch automatically so they always land on their own
        // communicator after login instead of the shared system one.
        const personalCopy = data.find(
          (c) =>
            c.copySource === state.activeCommunicatorId ||
            (c as any).copySourceCommunicatorId === state.activeCommunicatorId,
        );
        if (personalCopy) {
          activeCommunicatorId = personalCopy.id;
        }
      }

      if (!activeCommunicatorId && currentActiveExists) {
        activeCommunicatorId = state.activeCommunicatorId;
      }

      if (!activeCommunicatorId) {
        // Current communicator no longer exists (e.g. deleted zombie); fall back.
        activeCommunicatorId =
          myCommunicators[0]?.id || defaultOfficialCommunicatorId;
      }

      set({
        isFetching: false,
        activeCommunicatorId,
        communicators: myCommunicators,
      });
      syncPreferredCommunicatorInAppStore(activeCommunicatorId);
    },

    // ── Delegated async actions ──────────────────────────────────────────────

    applyLoginSuccess: applyLoginSuccessFactory(set),

    fetchSystemCommunicators: fetchSystemCommunicatorsFactory(
      set,
      get,
      defaultOfficialCommunicatorId,
    ),

    fetchMyCommunicators: fetchMyCommunicatorsFactory(get),

    fetchPublicCommunicatorsPage: (params) =>
      fetchPublicCommunicatorsPage(params),

    createRemoteCommunicator: createRemoteCommunicatorFactory(
      createCommunicatorCache,
      get,
    ),

    copyOfficialCommunicator: copyOfficialCommunicatorFactory(get),

    copyPublicCommunicator: copyPublicCommunicatorFactory(get),

    updateRemoteCommunicator: updateRemoteCommunicatorFactory(get),

    setDefaultCommunicator: async (communicatorId: string) => {
      const target = get().communicators.find((c) => c.id === communicatorId);
      if (!target) return;
      const updated = await get().updateRemoteCommunicator({
        ...target,
        isDefault: true,
      } as Communicator);
      set((state: CommunicatorState) => ({
        communicators: state.communicators.map((c) =>
          c.id === updated.id
            ? { ...c, isDefault: true }
            : { ...c, isDefault: false },
        ),
      }));
    },

    deleteRemoteCommunicator: deleteRemoteCommunicatorFactory(get, set),

    applyLogout: () => {
      resetCommunicatorsFetchCache();
      resetPublicCommunicatorsPageCache();
      set({ ...initialCommunicatorState });
    },
  };
});
