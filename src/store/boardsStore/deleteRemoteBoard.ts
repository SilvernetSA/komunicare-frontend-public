import { apiClient } from '../apiClient';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type { Board } from '../../types/board';

export const deleteRemoteBoard = async (boardId: string): Promise<Board> => {
  try {
    const { data } = await apiClient.delete<Board>(`/board/${boardId}`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
