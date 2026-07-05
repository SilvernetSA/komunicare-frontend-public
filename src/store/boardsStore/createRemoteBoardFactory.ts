import { createRemoteBoard } from './createRemoteBoard';
import { updateBoardsAfterCreateApiBoard } from './updateBoardsAfterCreateApiBoard';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type { BoardState } from './types';
import type { Board } from '../../types/board';

export const createRemoteBoardFactory =
  (set: (patch: any) => void, resetCaches: () => void) =>
  async ({
    board,
    tempId,
  }: {
    board: Board;
    tempId: string;
  }): Promise<Board> => {
    set({ isFetching: true });
    try {
      const data = await createRemoteBoard(board);
      resetCaches();
      set((state: BoardState) =>
        updateBoardsAfterCreateApiBoard(state, tempId, data),
      );
      return data;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to create board');
      set({ isFetching: false });
      throw new Error(message);
    }
  };
