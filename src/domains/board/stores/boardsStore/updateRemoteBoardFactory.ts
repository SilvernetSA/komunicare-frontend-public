import { updateRemoteBoardApi } from './updateRemoteBoardApi';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

import type { Board } from '@/types/board';

export const updateRemoteBoardFactory =
  (set: (patch: any) => void, resetCaches: () => void) =>
  async (board: Board): Promise<Board> => {
    set({ isFetching: true });
    try {
      const data = await updateRemoteBoardApi(board);
      resetCaches();
      set({ isFetching: false });
      return data;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to update board');
      set({ isFetching: false });
      throw new Error(message);
    }
  };
