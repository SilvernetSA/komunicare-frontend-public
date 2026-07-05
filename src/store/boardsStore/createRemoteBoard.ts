import { apiClient } from '../apiClient';
import { useAppStore } from '../appStore';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type { Board } from '../../types/board';

let inFlightCreations = new Map<string, Promise<Board>>();

const getBoardDeduplicationKey = (board: Board): string => {
  const name = String(board.name || '').trim();
  const boardId = String((board as any).boardId || board.id || '').trim();
  return `${name}::${boardId}`;
};

export const createRemoteBoard = async (board: Board): Promise<Board> => {
  const userData = useAppStore.getState().userData;
  const email = (userData as any)?.email;
  const author = (userData as any)?.name;

  const deduplicationKey = getBoardDeduplicationKey(board);
  const existingRequest = inFlightCreations.get(deduplicationKey);
  if (existingRequest) {
    return existingRequest;
  }

  const request = (async () => {
    try {
      const { data } = await apiClient.post<Board>('/board', {
        ...board,
        email: email || board.email,
        author: author || board.author,
        isPublic: false,
      } as any);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    } finally {
      inFlightCreations.delete(deduplicationKey);
    }
  })();

  inFlightCreations.set(deduplicationKey, request);
  return request;
};
