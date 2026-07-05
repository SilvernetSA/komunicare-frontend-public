import { Dispatch, SetStateAction } from 'react';

import { Board } from '../../../../types/board';

interface FormState {
  editBoardDescriptionDialogValue?: string;
  editBoardTitleDialogValue?: string;
  openEditBoardTitle?: boolean;
  loading?: boolean;
}

type SetState<T extends FormState = FormState> = Dispatch<SetStateAction<T>>;

export const handleBoardDescriptionChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  setState: SetState,
): void => {
  const { value: editBoardDescriptionDialogValue } = event.target;
  setState((prevState) => ({
    ...prevState,
    editBoardDescriptionDialogValue,
  }));
};

export const handleBoardTitleChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  setState: SetState,
): void => {
  const { value: editBoardTitleDialogValue } = event.target;
  setState((prevState) => ({
    ...prevState,
    editBoardTitleDialogValue,
  }));
};

export const handleBoardTitleDesc = (
  board: Board,
  state: FormState,
  setState: SetState,
  updateMyBoard: (board: Board) => void,
): void => {
  setState((prevState) => ({
    ...prevState,
    openEditBoardTitle: false,
    loading: true,
  }));
  const newBoard: Board = {
    ...board,
    description: state.editBoardDescriptionDialogValue
      ? state.editBoardDescriptionDialogValue
      : board.description,
    name: state.editBoardTitleDialogValue
      ? state.editBoardTitleDialogValue
      : board.name,
  };
  updateMyBoard(newBoard);
  setState((prevState) => ({
    ...prevState,
    editBoardDescriptionDialogValue: board.description || '',
    editBoardTitleDialogValue: board.name || '',
    loading: false,
  }));
};
