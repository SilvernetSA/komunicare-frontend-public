import { useAppStore } from '@/domains/app/stores/appStore';
import { isMarkedBoardForApiUpdate } from './isMarkedBoardForApiUpdate';

import type { Board } from '@/types/board';

export const updateApiMarkedBoards = async (
  getBoards: () => Board[],
  updateRemoteBoard: (board: Board) => Promise<Board>,
  unmarkBoard: (boardId: string) => void,
): Promise<void> => {
  const boards = getBoards();
  const userEmail = (useAppStore.getState().userData as any)?.email;
  if (!userEmail) {
    return;
  }

  for (const currentBoard of boards) {
    const shouldUpdate = isMarkedBoardForApiUpdate(currentBoard, userEmail);

    if (!shouldUpdate) continue;

    try {
      await updateRemoteBoard(currentBoard);
      unmarkBoard(currentBoard.id);
    } catch (err) {
      console.error('Failed to update marked board', err);
    }
  }
};
