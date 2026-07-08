import { normalizeApiBoard } from './normalizeApiBoard';

import type { BoardPageParams, BoardPageResponse } from './types';
import type { Board } from '../../types/board';

export const normalizeBoardPageResponse = (
  response: Partial<BoardPageResponse> | undefined,
  params: BoardPageParams,
): BoardPageResponse => {
  const data = Array.isArray(response?.data)
    ? (response!.data as Board[]).map((board) => normalizeApiBoard(board))
    : [];
  return {
    data,
    total: typeof response?.total === 'number' ? response.total : data.length,
    page: typeof response?.page === 'number' ? response.page : params.page,
    limit: typeof response?.limit === 'number' ? response.limit : params.limit,
    offset: typeof response?.offset === 'number' ? response.offset : undefined,
  };
};
