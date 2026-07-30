import { Board } from '@/types/board';

interface DialogState {
  editBoardDescriptionDialogValue?: string;
  loading?: boolean;
  openBoardInfo?: boolean;
  openDeleteBoard?: boolean;
  openCopyBoard?: boolean;
  openPublishBoard?: boolean;
  reportDialogState?: Record<string, unknown>;
}

type SetState = (updater: (prevState: DialogState) => DialogState) => void;

export const handleBoardPublishOpen = (
  board: Board,
  state: DialogState,
  setState: SetState,
  publishBoard: (board: Board) => void,
): void => {
  if (!board.isPublic && !board.description) {
    setState((prevState) => ({
      ...prevState,
      openPublishBoard: true,
    }));
  } else {
    setState((prevState) => ({
      ...prevState,
      loading: true,
    }));
    if (state.editBoardDescriptionDialogValue) {
      board.description = state.editBoardDescriptionDialogValue;
    }
    publishBoard(board);
    setState((prevState) => ({
      ...prevState,
      loading: false,
    }));
  }
};

export const handleBoardCopy = (
  board: Board,
  setState: SetState,
  copyBoard: (board: Board) => void | Promise<void>,
): void => {
  setState((prevState) => ({
    ...prevState,
    openCopyBoard: false,
    loading: true,
  }));

  Promise.resolve(copyBoard(board)).finally(() => {
    setState((prevState) => ({
      ...prevState,
      loading: false,
    }));
  });
};

export const handleBoardDelete = (
  board: Board,
  setState: SetState,
  deleteMyBoard: (board: Board) => void,
): void => {
  setState((prevState) => ({
    ...prevState,
    openDeleteBoard: false,
    loading: true,
  }));
  deleteMyBoard(board);
  setState((prevState) => ({
    ...prevState,
    loading: false,
  }));
};

export const handleBoardPublish = (
  board: Board,
  state: DialogState,
  setState: SetState,
  updateMyBoard: (board: Board) => void,
  publishBoard: (board: Board) => void,
): void => {
  setState((prevState) => ({
    ...prevState,
    openPublishBoard: false,
    loading: true,
  }));

  if (state.editBoardDescriptionDialogValue) {
    const newBoard: Board = {
      ...board,
      description: state.editBoardDescriptionDialogValue,
    };
    updateMyBoard(newBoard);
    publishBoard(newBoard);
  } else {
    publishBoard(board);
  }
  setState((prevState) => ({
    ...prevState,
    editBoardDescriptionDialogValue: '',
    loading: false,
  }));
};
