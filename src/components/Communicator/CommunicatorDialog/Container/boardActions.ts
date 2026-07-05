import shortid from 'shortid';

import { UserData } from '../../../../types/app';
import { Board } from '../../../../types/board';
import { Communicator } from '../../../../types/communicator';
import { getBoardDisplayTitle } from '../../../../utils/getBoardDisplayTitle';
import { switchCommunicatorNavigation } from '../../../../utils/switchCommunicatorNavigation';
import { resolveBundleNameForBoard } from '../../../Board/utils-simple/copyOnWrite';
import messages from '../CommunicatorDialog.messages';

type SetState = (
  updater: (prevState: { boards: Board[] }) => { boards: Board[] },
) => void;

interface BoardRecord {
  prev: string;
  next: string;
}

interface BoardActionsProps {
  intl: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  showNotification: (message: string) => void;
  createBoard: (board: Board) => void;
  createRemoteBoard: (payload: {
    board: Board;
    tempId: string;
  }) => Promise<Board>;
  addBoardCommunicator: (boardId: string) => void;
  upsertCommunicator: (communicator: Communicator) => void;
  currentCommunicator: Communicator;
  userData: UserData;
  syncBoardWithCommunicator: (
    board: Board,
    createCommunicator: boolean,
    flag: boolean,
  ) => Promise<string>;
  availableBoards: Board[];
  updateBoard: (board: Board) => void;
  replaceBoard: (oldBoard: Board, newBoard: Board) => void;
  deleteBoard: (boardId: string) => void;
  communicators: Communicator[];
  editCommunicator: (communicator: Communicator) => void;
  deleteApiBoard: (boardId: string) => Promise<void>;
  deleteApiCommunicator: (communicatorId: string) => Promise<void>;
  updateApiBoard: (board: Board) => Promise<Board>;
  updateApiCommunicator: (communicator: Communicator) => Promise<Communicator>;
  fetchBoardById: (boardId: string) => Promise<Board>;
  reportBoard: (data: Record<string, unknown>) => Promise<void>;
  language: { lang: string };
  deleteCommunicator?: (communicatorId: string) => void;
  changeCommunicator?: (communicatorId: string) => void;
}

interface ReportData {
  whistleblower: {
    language?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface CopyBoardOptions {
  addToCommunicator?: boolean;
}

const BUNDLE_TO_COPY_SOURCE: Record<string, Communicator['copySource']> = {
  komunicare: 'komunicare',
};

export const copyBoard = async (
  board: Board,
  props: BoardActionsProps,
): Promise<void> => {
  const { intl, showNotification } = props;
  try {
    await createBoardsRecursively(board, null, props, {
      addToCommunicator: false,
    });
  } catch (err: any) {
    console.log(err.message);
    showNotification(intl.formatMessage(messages.boardCopyError));
  }
};

export const createBoardsRecursively = async (
  board: Board,
  records: BoardRecord[] | null,
  props: BoardActionsProps,
  options: CopyBoardOptions = {},
): Promise<void> => {
  const {
    createBoard,
    createRemoteBoard,
    addBoardCommunicator,
    upsertCommunicator,
    currentCommunicator,
    userData,
    syncBoardWithCommunicator,
    availableBoards,
    intl,
    fetchBoardById,
  } = props;
  const addToCommunicator = options.addToCommunicator ?? true;

  if (!board) {
    return;
  }
  if (records) {
    let nextBoardsRecords = records.map((entry) => entry.next);
    if (nextBoardsRecords.includes(board.id)) {
      return;
    }
  }

  let newBoard: Board = {
    ...board,
    isPublic: false,
    isFixed: false,
    id: shortid.generate(),
    hidden: false,
    author: '',
    email: '',
  };
  if (newBoard.name || newBoard.nameKey) {
    newBoard.name = getBoardDisplayTitle(newBoard, intl as any);
  } else {
    newBoard.name = intl.formatMessage(messages.noTitle);
  }
  if ('name' in userData && 'email' in userData) {
    newBoard = {
      ...newBoard,
      author: userData.name,
      email: userData.email,
    };
  }
  createBoard(newBoard);
  if (!records && addToCommunicator) {
    addBoardCommunicator(newBoard.id);
  }

  if ('name' in userData && 'email' in userData) {
    try {
      if (addToCommunicator) {
        let createCommunicator = false;
        if (currentCommunicator.email !== userData.email) {
          const boardBundle = resolveBundleNameForBoard(
            currentCommunicator,
            board.id,
          );
          const copySource = BUNDLE_TO_COPY_SOURCE[boardBundle];

          const communicatorData: Communicator = {
            ...currentCommunicator,
            author: userData.name,
            email: userData.email,
            id: shortid.generate(),
            boards: [newBoard.id],
            rootBoard: newBoard.id,
            copySource,
            copySourceCommunicatorId: currentCommunicator.id,
          };

          if (boardBundle && currentCommunicator.defaultBoardsIncluded) {
            communicatorData.defaultBoardsIncluded =
              currentCommunicator.defaultBoardsIncluded.filter(
                (item: any) => item.nameOnJSON === boardBundle,
              );
            if (communicatorData.defaultBoardsIncluded.length > 0) {
              communicatorData.defaultBoardsIncluded[0].homeBoard = newBoard.id;
            }
          }

          upsertCommunicator(communicatorData);
          switchCommunicatorNavigation({
            communicator: communicatorData,
            skipBoardNavigation: true,
          });
          createCommunicator = true;
        }

        const boardId = await syncBoardWithCommunicator(
          newBoard,
          createCommunicator,
          true,
        );
        newBoard = {
          ...newBoard,
          id: boardId,
        };
      } else {
        const persistedBoard = await createRemoteBoard({
          board: newBoard,
          tempId: newBoard.id,
        });
        newBoard = {
          ...newBoard,
          id: persistedBoard.id,
        };
      }
    } catch (err: any) {
      console.log(err.message);
    }
  }
  if (!records) {
    records = [{ prev: board.id, next: newBoard.id }];
  } else {
    records.push({ prev: board.id, next: newBoard.id });
  }
  updateBoardReferences(board, newBoard, records, props);

  if (board.tiles.length < 1) {
    return;
  }

  for (const tile of board.tiles) {
    if (tile.loadBoard) {
      try {
        const nextBoard = await fetchBoardById(tile.loadBoard);
        await createBoardsRecursively(nextBoard, records, props, options);
      } catch (err: any) {
        const status = err?.status ?? err?.response?.status;
        if (status === 404) {
          const localBoard = availableBoards.find(
            (b) => b.id === tile.loadBoard,
          );
          if (localBoard) {
            await createBoardsRecursively(localBoard, records, props, options);
          }
        } else {
          const message = err?.message || 'Failed to load linked board';
          console.error(message);
        }
      }
    }
  }
};

export const updateBoardReferences = (
  board: Board,
  newBoard: Board,
  records: BoardRecord[],
  props: BoardActionsProps,
): void => {
  const { availableBoards, updateBoard } = props;
  let prevBoardsRecords = records.map((entry) => entry.prev);
  prevBoardsRecords = prevBoardsRecords.filter((id) => id !== newBoard.id);

  availableBoards.forEach((b) => {
    b.tiles.forEach((tile, index) => {
      if (tile && tile.loadBoard && tile.loadBoard === board.id) {
        b.tiles.splice(index, 1, {
          ...tile,
          loadBoard: newBoard.id,
        });
        try {
          updateBoard(b);
        } catch (err: any) {
          console.log(err.message);
        }
      }
      if (
        tile &&
        tile.loadBoard &&
        prevBoardsRecords.includes(tile.loadBoard)
      ) {
        const el = records.find((e) => e.prev === tile.loadBoard);
        if (el) {
          b.tiles.splice(index, 1, {
            ...tile,
            loadBoard: el.next,
          });
          try {
            updateBoard(b);
          } catch (err: any) {
            console.log(err.message);
          }
        }
      }
    });
  });
};

export const publishBoard = async (
  board: Board,
  props: BoardActionsProps,
  setState: SetState,
): Promise<void> => {
  const { userData, replaceBoard, showNotification, intl, updateApiBoard } =
    props;
  const boardData: Board = {
    ...board,
    isPublic: !board.isPublic,
  };

  replaceBoard(board, boardData);
  setState((prevState) => {
    const sBoards = [...prevState.boards];
    const index = sBoards.findIndex((b: Board) => board.id === b.id);
    sBoards.splice(index, 1, boardData);
    return { boards: sBoards };
  });

  boardData.isPublic
    ? showNotification(intl.formatMessage(messages.boardPublished))
    : showNotification(intl.formatMessage(messages.boardUnpublished));

  if ('name' in userData && 'email' in userData) {
    try {
      const boardResponse = await updateApiBoard(boardData);
      replaceBoard(boardData, boardResponse);
    } catch {}
  }
};

export const deleteMyBoard = async (
  board: Board,
  props: BoardActionsProps,
  setState: SetState,
): Promise<void> => {
  const {
    showNotification,
    deleteBoard,
    communicators,
    editCommunicator,
    deleteApiBoard,
    userData,
    updateApiCommunicator,
    deleteApiCommunicator,
    intl,
    deleteCommunicator,
    changeCommunicator,
    currentCommunicator,
  } = props;
  const deletedCommunicatorIds = new Set<string>();

  for (const communicator of communicators) {
    if (communicator.rootBoard === board.id && communicator.id) {
      deletedCommunicatorIds.add(communicator.id);
    }
  }

  deleteBoard(board.id);

  if ('name' in userData && 'email' in userData) {
    try {
      await deleteApiBoard(board.id);
    } catch {}
  }

  // A MongoDB ObjectId is exactly 24 hex characters.
  // Communicators that were never successfully persisted to the API retain a
  // shortid (< 24 chars) — sending those to the API yields a CastError 400.
  // The backend board-delete endpoint already cascade-deletes linked communicator
  // copies, so skipping the API call for invalid IDs is safe in every scenario.
  const isValidApiId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

  for (const comm of communicators) {
    if (deletedCommunicatorIds.has(String(comm.id || ''))) {
      if (
        'name' in userData &&
        'email' in userData &&
        comm.id &&
        isValidApiId(comm.id)
      ) {
        try {
          await deleteApiCommunicator(comm.id);
        } catch {}
      }
      if (comm.id) {
        deleteCommunicator?.(comm.id);
      }
      continue;
    }

    if (comm.boards.includes(board.id)) {
      const updatedCommunicator = {
        ...comm,
        boards: comm.boards.filter((b) => b !== board.id),
      };

      editCommunicator({
        ...updatedCommunicator,
      });

      if ('name' in userData && 'email' in userData) {
        try {
          await updateApiCommunicator(updatedCommunicator);
        } catch {}
      }
    }
  }

  if (
    currentCommunicator?.id &&
    deletedCommunicatorIds.has(String(currentCommunicator.id))
  ) {
    const fallbackCommunicator =
      communicators.find(
        (communicator) =>
          communicator.id &&
          !deletedCommunicatorIds.has(String(communicator.id)),
      ) || null;
    if (fallbackCommunicator?.id) {
      changeCommunicator?.(fallbackCommunicator.id);
    }
  }

  setState((prevState) => {
    const sBoards = [...prevState.boards];
    const index = sBoards.findIndex((b: Board) => board.id === b.id);
    sBoards.splice(index, 1);
    return { boards: sBoards };
  });

  showNotification(intl.formatMessage(messages.boardDeleted));
};

export const updateMyBoard = async (
  board: Board,
  props: BoardActionsProps,
  setState: SetState,
): Promise<void> => {
  const { updateBoard, updateApiBoard, userData } = props;
  updateBoard(board);

  setState((prevState) => {
    const sBoards = [...prevState.boards];
    const index = sBoards.findIndex((b: Board) => board.id === b.id);
    sBoards.splice(index, 1, board);
    return { boards: sBoards };
  });

  if ('name' in userData && 'email' in userData) {
    try {
      await updateApiBoard(board);
    } catch {}
  }
};

export const boardReport = async (
  reportedBoardData: ReportData,
  props: BoardActionsProps,
): Promise<void> => {
  const {
    reportBoard,
    language: { lang },
  } = props;
  reportedBoardData.whistleblower.language = lang;
  await reportBoard(reportedBoardData);
  return;
};
