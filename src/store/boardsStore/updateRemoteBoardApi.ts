import { apiClient } from '../apiClient';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type { Board } from '../../types/board';

export const updateRemoteBoardApi = async (board: Board): Promise<Board> => {
  try {
    const { data } = await apiClient.put<Board>(
      `/board/${board.id}`,
      board as any,
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
