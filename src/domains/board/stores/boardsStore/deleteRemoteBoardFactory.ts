import { reconcileActiveBoardState } from './boardStateHelpers';
import { deleteRemoteBoard } from './deleteRemoteBoard';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { BoardState } from './types';
import type { Board } from '@/types/board';

export const deleteRemoteBoardFactory =
  (set: (patch: any) => void, resetCaches: () => void) =>
  async (boardId: string): Promise<Board> => {
    set({ isFetching: true });
    try {
      const data = await deleteRemoteBoard(boardId);
      resetCaches();
      set((state: BoardState) => {
        const nextBoards = state.boards.filter((board) => board.id !== data.id);
        return {
          ...state,
          isFetching: false,
          boards: nextBoards,
          ...reconcileActiveBoardState(
            nextBoards,
            state.activeBoardId!,
            state.navHistory,
          ),
        };
      });
      return data;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to delete board');
      set({ isFetching: false });
      throw new Error(message);
    }
  };
