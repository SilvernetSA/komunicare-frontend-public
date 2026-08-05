import { Board as BoardModel } from '@/types/board';
import { Communicator } from '@/types/communicator';

export const collectCommunicatorScopedBoardIds = (
  communicator?: Communicator,
): Set<string> => {
  const boardIds = new Set<string>();

  const rootBoard = String(communicator?.rootBoard || '').trim();
  if (rootBoard) {
    boardIds.add(rootBoard);
  }

  (Array.isArray(communicator?.boards) ? communicator.boards : []).forEach(
    (boardId) => {
      const normalizedBoardId = String(boardId || '').trim();
      if (normalizedBoardId) {
        boardIds.add(normalizedBoardId);
      }
    },
  );

  (Array.isArray(communicator?.defaultBoardsIncluded)
    ? communicator.defaultBoardsIncluded
    : []
  ).forEach((entry) => {
    const homeBoard = String(entry?.homeBoard || '').trim();
    if (homeBoard) {
      boardIds.add(homeBoard);
    }
  });

  return boardIds;
};

export const findCommunicatorScopedBoardBySourceId = ({
  boards,
  communicator,
  sourceBoardId,
}: {
  boards: BoardModel[];
  communicator?: Communicator;
  sourceBoardId?: string | null;
}): BoardModel | undefined => {
  const normalizedSourceBoardId = String(sourceBoardId || '').trim();
  if (!normalizedSourceBoardId) {
    return undefined;
  }

  const scopedBoardIds = collectCommunicatorScopedBoardIds(communicator);

  return boards.find(
    (board) =>
      scopedBoardIds.has(String(board.id || '').trim()) &&
      String(board.sourceBoardId || '').trim() === normalizedSourceBoardId,
  );
};
