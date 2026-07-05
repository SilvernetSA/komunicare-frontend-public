import { DEFAULT_BOARDS } from '../helpers';
import {
  getCanonicalDefaultBoardHomeId,
  normalizeDefaultBoardsIncluded,
} from './defaultBoardsIncluded';
import { persistStartupCommunicatorSelection } from './persistStartupCommunicatorSelection';
import { switchCommunicatorNavigation } from './switchCommunicatorNavigation';
import {
  isProtectedCommunicator,
  findExistingPersonalCopyForBoardWithRefresh,
  prepareCommunicatorCopyDraft,
} from '../components/Board/utils-simple/copyOnWrite';
import { useAppStore } from '../store/appStore';
import { useBoardsStore } from '../store/boardsStore';
import { useCommunicatorsStore } from '../store/communicatorsStore';
import { UserData } from '../types/app';
import { Board } from '../types/board';
import { Communicator } from '../types/communicator';

interface DefaultBoardIncluded {
  nameOnJSON: string;
  homeBoard: string;
}

export type DefaultBoardSelection =
  | {
      type: 'default';
      boardName: string;
    }
  | {
      type: 'custom';
      boardId: string;
    };

interface UpdateDefaultBoardIncludedParams {
  defaultBoardsIncluded: DefaultBoardIncluded[];
  selectedNameOnJson: string;
  homeBoardId: string;
}

type NavigateFn = (path: string, options?: { replace?: boolean }) => void;

const CUSTOM_BOARD_NAME = 'custom';
const findLatestCommunicatorByBoard = (
  boardId: string,
): Communicator | undefined => {
  const communicators = useCommunicatorsStore.getState().communicators;

  for (let index = communicators.length - 1; index >= 0; index -= 1) {
    const communicator = communicators[index];
    if (communicator.rootBoard === boardId) {
      return communicator;
    }
  }

  for (let index = communicators.length - 1; index >= 0; index -= 1) {
    const communicator = communicators[index];
    if (communicator.boards?.includes(boardId)) {
      return communicator;
    }
  }

  return undefined;
};

function getActiveCommunicator(): Communicator | undefined {
  const { communicators, activeCommunicatorId } =
    useCommunicatorsStore.getState();
  const activeCommunicator = communicators.find(
    (communicator) => communicator.id === activeCommunicatorId,
  );
  const activeBoardId = useBoardsStore.getState().activeBoardId;
  const communicatorForActiveBoard = activeBoardId
    ? findLatestCommunicatorByBoard(activeBoardId)
    : undefined;

  if (!communicatorForActiveBoard) {
    return activeCommunicator;
  }

  const activeCommunicatorMatchesBoard =
    activeCommunicator &&
    (activeCommunicator.rootBoard === activeBoardId ||
      activeCommunicator.boards?.includes(activeBoardId));

  return activeCommunicatorMatchesBoard
    ? activeCommunicator
    : communicatorForActiveBoard;
}

const fallbackInitialDefaultBoardsIncluded = (): DefaultBoardIncluded[] => {
  return normalizeDefaultBoardsIncluded();
};

const updateDefaultBoardIncluded = ({
  defaultBoardsIncluded,
  selectedNameOnJson,
  homeBoardId,
}: UpdateDefaultBoardIncludedParams): DefaultBoardIncluded[] => {
  const existingIndex = defaultBoardsIncluded.findIndex(
    ({ nameOnJSON }) => nameOnJSON === selectedNameOnJson,
  );

  const nextIncluded = [...defaultBoardsIncluded];
  if (existingIndex >= 0) {
    nextIncluded[existingIndex] = {
      ...nextIncluded[existingIndex],
      homeBoard: homeBoardId,
    };
  } else {
    nextIncluded.push({
      nameOnJSON: selectedNameOnJson,
      homeBoard: homeBoardId,
    });
  }

  return nextIncluded;
};

const switchActiveBoard = (
  homeBoardId: string,
  navigate?: NavigateFn,
): void => {
  if (!homeBoardId) {
    return;
  }

  useBoardsStore.getState().switchBoard(homeBoardId);
  if (navigate) {
    navigate(`/board/${homeBoardId}`, { replace: true });
  }
};

const replaceHomeBoard = async (
  homeBoardId: string,
  defaultBoardsIncluded: DefaultBoardIncluded[],
  communicatorName: string,
  promptText?: string,
  navigate?: NavigateFn,
): Promise<boolean> => {
  const { communicators, activeCommunicatorId } =
    useCommunicatorsStore.getState();
  const userData = useAppStore.getState().userData as UserData;

  const activeCommunicator = communicators.find(
    (communicator) => communicator.id === activeCommunicatorId,
  );

  if (!activeCommunicator) {
    return false;
  }

  const communicatorWithRootBoardReplaced: Communicator = {
    ...activeCommunicator,
    defaultBoardsIncluded,
    boards: activeCommunicator.boards.includes(homeBoardId)
      ? activeCommunicator.boards
      : [...activeCommunicator.boards, homeBoardId],
    rootBoard: homeBoardId,
  };

  const shouldCloneCommunicator = isProtectedCommunicator(
    activeCommunicator,
    userData,
  );

  if (shouldCloneCommunicator) {
    const existingCopy = await findExistingPersonalCopyForBoardWithRefresh({
      communicators,
      fallbackCommunicators: communicators,
      activeCommunicator,
      userEmail: userData.email,
      boardId: homeBoardId,
      fetchMyCommunicators:
        useCommunicatorsStore.getState().fetchMyCommunicators,
    });

    if (existingCopy) {
      // If the existing copy is the active communicator, just update it instead of creating a new one
      if (existingCopy.id === activeCommunicator.id) {
        // Don't create a new copy, just update the current one
        const updatedCommunicator: Communicator = {
          ...activeCommunicator,
          defaultBoardsIncluded,
          boards: activeCommunicator.boards.includes(homeBoardId)
            ? activeCommunicator.boards
            : [...activeCommunicator.boards, homeBoardId],
          rootBoard: homeBoardId,
        };

        useCommunicatorsStore.getState().editCommunicator(updatedCommunicator);

        try {
          if (userData?.role) {
            const savedCommunicator = await useCommunicatorsStore
              .getState()
              .updateRemoteCommunicator(updatedCommunicator);
            useCommunicatorsStore
              .getState()
              .upsertCommunicator(savedCommunicator);
            switchCommunicatorNavigation({
              communicator: savedCommunicator,
              navigate,
              skipBoardNavigation: true,
            });
          }
        } catch (error) {
          console.error('error', error);
        }

        return true;
      }

      // Notify user that a copy already exists (different from active)
      if (typeof window !== 'undefined') {
        const shouldSwitch = window.confirm(
          `You already have a personal copy of this communicator: "${existingCopy.name}". Would you like to switch to it instead of creating a new copy?`,
        );

        if (shouldSwitch) {
          useCommunicatorsStore.getState().changeCommunicator(existingCopy.id);
          switchCommunicatorNavigation({
            communicator: existingCopy,
            navigate,
            skipBoardNavigation: false,
          });

          if (existingCopy.rootBoard) {
            switchActiveBoard(existingCopy.rootBoard, navigate);
          }
          return true;
        } else {
          return false;
        }
      }
    }

    const preparedCommunicatorCopy = await prepareCommunicatorCopyDraft({
      communicator: activeCommunicator,
      userData,
      boardTitle: communicatorName,
      boardId: homeBoardId,
      promptText: promptText || 'Communicator name',
    });

    if (!preparedCommunicatorCopy) {
      return false;
    }

    const communicatorCopy: Communicator = {
      ...preparedCommunicatorCopy.communicatorDraft,
      defaultBoardsIncluded,
      boards: communicatorWithRootBoardReplaced.boards,
      rootBoard: homeBoardId,
    };

    useCommunicatorsStore.getState().upsertCommunicator(communicatorCopy);
    useCommunicatorsStore.getState().changeCommunicator(communicatorCopy.id);
    switchCommunicatorNavigation({
      communicator: communicatorCopy,
      navigate,
      skipBoardNavigation: true,
    });

    try {
      const createdCommunicator = await useCommunicatorsStore
        .getState()
        .createRemoteCommunicator({
          communicator: communicatorCopy,
          tempId: communicatorCopy.id,
        });
      useCommunicatorsStore.getState().upsertCommunicator(createdCommunicator);
      await persistStartupCommunicatorSelection({
        communicatorId: createdCommunicator.id,
        shouldPersist: preparedCommunicatorCopy.resolution.setAsStartup,
      });
      switchCommunicatorNavigation({
        communicator: createdCommunicator,
        navigate,
        skipBoardNavigation: true,
      });
    } catch (error) {
      console.error('error', error);
    }

    return true;
  }

  useCommunicatorsStore
    .getState()
    .editCommunicator(communicatorWithRootBoardReplaced);

  try {
    let savedCommunicator = communicatorWithRootBoardReplaced;
    if (userData?.role) {
      savedCommunicator = await useCommunicatorsStore
        .getState()
        .updateRemoteCommunicator(communicatorWithRootBoardReplaced);
    }

    useCommunicatorsStore.getState().upsertCommunicator(savedCommunicator);
    switchCommunicatorNavigation({
      communicator: savedCommunicator,
      navigate,
      skipBoardNavigation: true,
    });
  } catch (error) {
    console.error('error', error);
  }

  return true;
};

const resolveDefaultBoardHomeId = (
  selection: Extract<DefaultBoardSelection, { type: 'default' }>,
): string => {
  return getCanonicalDefaultBoardHomeId(selection.boardName);
};

const resolveCustomBoardHomeId = (
  selection: Extract<DefaultBoardSelection, { type: 'custom' }>,
): string => {
  const selectedBoard = useBoardsStore
    .getState()
    .boards.find((board) => board.id === selection.boardId);

  return selectedBoard?.id || '';
};

const resolveCommunicatorName = (
  selection: DefaultBoardSelection,
  activeCommunicator: Communicator,
): string => {
  if (selection.type === 'custom') {
    const selectedBoard = useBoardsStore
      .getState()
      .boards.find((board) => board.id === selection.boardId);

    return (
      selectedBoard?.name ||
      activeCommunicator.name ||
      activeCommunicator.id ||
      'Communicator'
    );
  }

  const selectedBoard =
    (DEFAULT_BOARDS as unknown as Record<string, Board[]>)[
      selection.boardName
    ] || [];

  return (
    selectedBoard[0]?.name ||
    activeCommunicator.name ||
    activeCommunicator.id ||
    'Communicator'
  );
};

export async function changeDefaultBoard(
  selection: string | DefaultBoardSelection,
  navigate?: NavigateFn,
  promptText?: string,
): Promise<void> {
  const normalizedSelection: DefaultBoardSelection =
    typeof selection === 'string'
      ? {
          type: 'default',
          boardName: selection,
        }
      : selection;

  // Dynamic system communicator: not in DEFAULT_BOARDS → switch to it directly
  if (normalizedSelection.type === 'default') {
    const fromStatic = getCanonicalDefaultBoardHomeId(
      normalizedSelection.boardName,
    );
    if (!fromStatic) {
      const allCommunicators = useCommunicatorsStore.getState().communicators;
      const systemComm = allCommunicators.find(
        (c) => String(c.id) === normalizedSelection.boardName,
      );
      if (systemComm) {
        switchCommunicatorNavigation({ communicator: systemComm, navigate });
        return;
      }
    }
  }

  const activeCommunicator = getActiveCommunicator();
  if (!activeCommunicator) {
    return;
  }

  const defaultBoardsIncluded = activeCommunicator.defaultBoardsIncluded?.length
    ? normalizeDefaultBoardsIncluded(activeCommunicator.defaultBoardsIncluded)
    : fallbackInitialDefaultBoardsIncluded();

  const homeBoardId =
    normalizedSelection.type === 'default'
      ? resolveDefaultBoardHomeId(normalizedSelection)
      : resolveCustomBoardHomeId(normalizedSelection);
  const shouldSwitchProtectedDefaultBoardWithoutCopy =
    normalizedSelection.type === 'default' &&
    isProtectedCommunicator(
      activeCommunicator,
      useAppStore.getState().userData as UserData,
    );
  const communicatorName = resolveCommunicatorName(
    normalizedSelection,
    activeCommunicator,
  );

  if (!homeBoardId) {
    return;
  }

  if (shouldSwitchProtectedDefaultBoardWithoutCopy) {
    switchActiveBoard(homeBoardId, navigate);
    return;
  }

  const nextDefaultBoardsIncluded = normalizeDefaultBoardsIncluded(
    updateDefaultBoardIncluded({
      defaultBoardsIncluded,
      selectedNameOnJson:
        normalizedSelection.type === 'default'
          ? normalizedSelection.boardName
          : CUSTOM_BOARD_NAME,
      homeBoardId,
    }),
  );

  const shouldProceed = await replaceHomeBoard(
    homeBoardId,
    nextDefaultBoardsIncluded,
    communicatorName,
    promptText,
    navigate,
  );
  if (!shouldProceed) {
    return;
  }

  switchActiveBoard(homeBoardId, navigate);
}
