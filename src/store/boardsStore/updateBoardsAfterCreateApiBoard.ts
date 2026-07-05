import type { BoardState } from './types';
import type { Board } from '../../types/board';

export const updateBoardsAfterCreateApiBoard = (
  state: BoardState,
  boardId: string,
  board: Board,
): BoardState => {
  const updatedBoards = state.boards.map((existing) => {
    if (!existing?.tiles?.length) {
      return existing;
    }
    let hasUpdates = false;
    const nextTiles = existing.tiles.map((tile) => {
      if (tile?.loadBoard === boardId) {
        hasUpdates = true;
        return { ...tile, loadBoard: board.id };
      }
      return tile;
    });

    if (!hasUpdates) {
      return existing;
    }

    const nextBoard = { ...existing, tiles: nextTiles };
    if (
      String(existing.id).length > 14 &&
      Object.prototype.hasOwnProperty.call(existing, 'email')
    ) {
      (nextBoard as any).markToUpdate = true;
    }
    return nextBoard;
  });

  const isSystemBoard = boardId === 'komunicare';

  if (isSystemBoard) {
    return {
      ...state,
      isFetching: false,
      boards: [...updatedBoards, board],
    };
  }

  const hasTempBoard = updatedBoards.some(
    (existing) => existing.id === boardId,
  );

  if (!hasTempBoard) {
    const hasPersistedBoard = updatedBoards.some(
      (existing) => existing.id === board.id,
    );

    return {
      ...state,
      isFetching: false,
      boards: hasPersistedBoard
        ? updatedBoards.map((existing) =>
            existing.id === board.id ? { ...existing, ...board } : existing,
          )
        : [...updatedBoards, board],
    };
  }

  return {
    ...state,
    isFetching: false,
    boards: updatedBoards.map((existing) =>
      existing.id === boardId ? { ...existing, id: board.id } : existing,
    ),
  };
};
