import type { Board } from '@/types/board';
import type { BoardsStore } from '@/domains/board/stores/boardsStore';

export const upsertRemoteBoardFactory =
  (get: () => BoardsStore) =>
  async (board: Board): Promise<Board> => {
    if ((board.id || '').length < 14) {
      return get().createRemoteBoard({ board, tempId: board.id || '' });
    }
    return get().updateRemoteBoard(board);
  };
