import { UserData } from '@/types/app';
import { Board } from '@/types/board';
import { Communicator } from '@/types/communicator';
import { switchCommunicatorNavigation } from '@/utils/switchCommunicatorNavigation';
import { buildBoardPath } from '@/utils/buildBoardPath';
import { TAB_INDEXES } from '../CommunicatorDialog.constants';
import messages from '../CommunicatorDialog.messages';

interface DialogState {
  selectedTab: number;
  [key: string]: unknown;
}

interface CommunicatorActionsProps {
  communicatorBoards: Board[];
  intl: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  showNotification: (message: string) => void;
  availableBoards: Board[];
  addBoards: (boards: Board[]) => void;
  userData: UserData;
  communicators: Communicator[];
  currentCommunicator: Communicator;
  switchBoard: (boardId: string) => void;
  navigate?: (path: string, options?: { replace?: boolean }) => void;
  editCommunicator: (communicator: Communicator) => void;
  updateApiCommunicator: (communicator: Communicator) => Promise<Communicator>;
  fetchBoardById: (boardId: string) => Promise<Board>;
}

interface BoardsResult {
  boards: Board[];
}

export const addOrRemoveBoard = async (
  board: Board,
  state: DialogState,
  props: CommunicatorActionsProps,
): Promise<BoardsResult | void> => {
  const BOARD_ACTIONS_MAP: Record<number, string> = {
    [TAB_INDEXES.COMMUNICATOR_BOARDS]: 'communicatorBoardsAction',
    [TAB_INDEXES.MY_BOARDS]: 'addOrRemoveAction',
  };
  const action = BOARD_ACTIONS_MAP[state.selectedTab];

  if (action === 'communicatorBoardsAction') {
    return communicatorBoardsAction(board, props);
  } else {
    return addOrRemoveAction(board, props);
  }
};

export const communicatorBoardsAction = async (
  board: Board,
  props: CommunicatorActionsProps,
): Promise<BoardsResult> => {
  const communicatorBoards = props.communicatorBoards.filter(
    (cb) => cb.id !== board.id,
  );

  const { userData, communicators, currentCommunicator, editCommunicator } =
    props;

  const updatedCommunicatorData: Communicator = {
    ...currentCommunicator,
    boards: (currentCommunicator.boards || []).filter((id) => id !== board.id),
    defaultBoardsIncluded: currentCommunicator.defaultBoardsIncluded?.filter(
      (includedBoard) => includedBoard.homeBoard !== board.id,
    ),
  };

  if (communicators.findIndex((c) => c.id === currentCommunicator.id) >= 0) {
    editCommunicator(updatedCommunicatorData);
    switchCommunicatorNavigation({
      communicator: updatedCommunicatorData,
      skipBoardNavigation: true,
    });

    if ('name' in userData && 'email' in userData) {
      try {
        await props.updateApiCommunicator(updatedCommunicatorData);
      } catch {}
    }
  }

  return { boards: communicatorBoards };
};

export const addOrRemoveAction = async (
  board: Board,
  props: CommunicatorActionsProps,
): Promise<void> => {
  let communicatorBoards = [...props.communicatorBoards];
  const boardIndex = communicatorBoards.findIndex((b) => b.id === board.id);

  if (boardIndex >= 0) {
    communicatorBoards.splice(boardIndex, 1);
    props.showNotification(
      props.intl.formatMessage(messages.boardRemovedFromCommunicator),
    );
  } else {
    communicatorBoards.push(board);
    props.showNotification(
      props.intl.formatMessage(messages.boardAddedToCommunicator),
    );
  }

  await updateCommunicatorBoards(communicatorBoards, props);

  if (
    boardIndex < 0 &&
    props.availableBoards.findIndex((b) => b.id === board.id) < 0
  ) {
    let boards: Board[] = [];
    try {
      const boardData = await props.fetchBoardById(board.id);
      boards.push(boardData);
    } catch {}
    props.addBoards(boards);
  }
};

export const updateCommunicatorBoards = async (
  boards: Board[],
  props: CommunicatorActionsProps,
): Promise<void> => {
  const { userData, communicators, currentCommunicator, editCommunicator } =
    props;

  const updatedCommunicatorData: Communicator = {
    ...currentCommunicator,
    boards: boards.map((cb) => cb.id),
  };

  if (communicators.findIndex((c) => c.id === currentCommunicator.id) >= 0) {
    editCommunicator(updatedCommunicatorData);
    switchCommunicatorNavigation({
      communicator: updatedCommunicatorData,
      skipBoardNavigation: true,
    });

    if ('name' in userData && 'email' in userData) {
      try {
        await props.updateApiCommunicator(updatedCommunicatorData);
      } catch {}
    }
  }
};

export const setRootBoard = async (
  board: Board,
  props: CommunicatorActionsProps,
): Promise<void> => {
  const {
    userData,
    communicators,
    currentCommunicator,
    switchBoard,
    navigate,
    editCommunicator,
  } = props;

  const updatedCommunicatorData: Communicator = {
    ...currentCommunicator,
    rootBoard: board.id,
  };

  if (communicators.findIndex((c) => c.id === currentCommunicator.id) >= 0) {
    editCommunicator(updatedCommunicatorData);
    switchCommunicatorNavigation({
      communicator: updatedCommunicatorData,
      skipBoardNavigation: true,
    });
    switchBoard(board.id);
    if (navigate) {
      navigate(buildBoardPath(board.id), { replace: true });
    }

    if ('name' in userData && 'email' in userData) {
      try {
        await props.updateApiCommunicator(updatedCommunicatorData);
      } catch {}
    }
  }
};
