import { Board } from '../../types/board';

interface ReconcilePersistedBoardParams {
  board: Board;
  previousBoardId: string;
  persistedBoardId: string;
  shouldReplace: boolean;
  replaceBoard: (payload: { prev: Board; current: Board }) => void;
}

export function reconcilePersistedBoard({
  board,
  previousBoardId,
  persistedBoardId,
  shouldReplace,
  replaceBoard,
}: ReconcilePersistedBoardParams): void {
  if (!shouldReplace) {
    return;
  }

  replaceBoard({
    prev: { ...board, id: previousBoardId },
    current: { ...board, id: persistedBoardId },
  });
}
