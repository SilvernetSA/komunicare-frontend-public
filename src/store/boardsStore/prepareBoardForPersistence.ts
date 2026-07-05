import shortid from 'shortid';

import { Board } from '../../types/board';

interface PrepareBoardForPersistenceParams {
  board: Board;
  shouldCreateBoardCopy: boolean;
  updateBoard: (board: Board) => void;
  generateId?: () => string;
}

interface PrepareBoardForPersistenceResult {
  board: Board;
  createBoard: boolean;
  previousBoardId: string;
}

export const prepareBoardForPersistence = ({
  board,
  shouldCreateBoardCopy,
  updateBoard,
  generateId = shortid.generate,
}: PrepareBoardForPersistenceParams): PrepareBoardForPersistenceResult => {
  const previousBoardId = board.id;
  const createBoard = board.id.length < 14 || shouldCreateBoardCopy;

  if (!createBoard) {
    updateBoard(board);
    return {
      board,
      createBoard: false,
      previousBoardId,
    };
  }

  let preparedBoard: Board = {
    ...board,
    isPublic: false,
  };

  if (shouldCreateBoardCopy && board.id.length >= 14) {
    preparedBoard = {
      ...preparedBoard,
      id: generateId(),
    };
  }

  return {
    board: preparedBoard,
    createBoard: true,
    previousBoardId,
  };
};
