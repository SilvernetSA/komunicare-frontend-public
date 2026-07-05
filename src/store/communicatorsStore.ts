import { create } from 'zustand';

import { applyLoginSuccessFactory } from './communicatorsStore/applyLoginSuccessFactory';
import { createRemoteCommunicatorFactory } from './communicatorsStore/createRemoteCommunicatorFactory';
import { deleteRemoteCommunicatorFactory } from './communicatorsStore/deleteRemoteCommunicatorFactory';
import {
  fetchMyCommunicatorsFactory,
  resetCommunicatorsFetchCache,
} from './communicatorsStore/fetchMyCommunicatorsFactory';
import {
  fetchSystemCommunicatorsFactory,
  initSystemCommunicatorsCache,
  systemCommunicatorIds,
} from './communicatorsStore/fetchSystemCommunicatorsFactory';
import { mergeCommunicators } from './communicatorsStore/mergeCommunicators';
import { updateRemoteCommunicatorFactory } from './communicatorsStore/updateRemoteCommunicatorFactory';
import {
  getCachedSystemCommunicators,
  getCachedSystemHashes,
} from './systemCatalogCache';
import {
  normalizeCommunicatorDefaultBoardsIncluded,
  normalizeDefaultBoardsIncluded,
} from '../utils/defaultBoardsIncluded';

import type { Communicator } from '../types/communicator';

interface DefaultBoardData {
  nameOnJSON: string;
  homeBoard: string;
}

export interface CommunicatorState {
  communicators: Communicator[];
  activeCommunicatorId: string;
  isFetching: boolean;
}

const defaultCommunicatorID = 'komunicare_default';

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

const buildInitialCommunicatorState = (): CommunicatorState => {
  const communicators = cachedSystemCommunicators.map(
    normalizeCommunicatorDefaultBoardsIncluded,
  );
  const activeCommunicatorId = communicators[0]?.id || defaultCommunicatorID;

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
  addBoardCommunicator: (boardId: string) => void;
  deleteBoardCommunicator: (boardId: string) => void;
  replaceBoardCommunicator: (payload: {
    prevBoardId: string;
    nextBoardId: string;
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
  fetchSystemCommunicators: (options?: { force?: boolean }) => Promise<void>;
  createRemoteCommunicator: (payload: {
    communicator: Communicator;
    tempId: string;
  }) => Promise<Communicator>;
  updateRemoteCommunicator: (
    communicator: Communicator,
  ) => Promise<Communicator>;
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
      const exists = get().communicators.find(
        ({ id }) => id === communicatorId,
      );
      if (!exists) return;
      set({ activeCommunicatorId: communicatorId });
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

    addBoardCommunicator: (boardId) => {
      set((state) => {
        const active = state.communicators.find(
          (c) => c.id === state.activeCommunicatorId,
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

    deleteBoardCommunicator: (boardId) => {
      set((state) => {
        const active = state.communicators.find(
          (c) => c.id === state.activeCommunicatorId,
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

    replaceBoardCommunicator: ({ prevBoardId, nextBoardId }) => {
      set((state) => {
        const active = state.communicators.find(
          (c) => c.id === state.activeCommunicatorId,
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
      set((state) => {
        const myCommunicators = mergeSystemWithUserCommunicators(
          state.communicators,
          data,
        );
        const activeCommunicatorId = myCommunicators.some(
          (communicator) => communicator.id === state.activeCommunicatorId,
        )
          ? state.activeCommunicatorId
          : myCommunicators[0]?.id || defaultCommunicatorID;
        return {
          isFetching: false,
          activeCommunicatorId,
          communicators: myCommunicators,
        };
      });
    },

    // ── Delegated async actions ──────────────────────────────────────────────

    applyLoginSuccess: applyLoginSuccessFactory(set),

    fetchSystemCommunicators: fetchSystemCommunicatorsFactory(
      set,
      get,
      defaultCommunicatorID,
    ),

    fetchMyCommunicators: fetchMyCommunicatorsFactory(get),

    createRemoteCommunicator: createRemoteCommunicatorFactory(
      createCommunicatorCache,
      get,
    ),

    updateRemoteCommunicator: updateRemoteCommunicatorFactory(get),

    deleteRemoteCommunicator: deleteRemoteCommunicatorFactory(get, set),

    applyLogout: () => {
      resetCommunicatorsFetchCache();
      set({ ...initialCommunicatorState });
    },
  };
});
