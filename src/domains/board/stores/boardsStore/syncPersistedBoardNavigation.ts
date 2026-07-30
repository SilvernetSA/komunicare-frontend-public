import { reconcilePersistedBoard } from './reconcilePersistedBoard';
import { Board } from '@/types/board';
import { persistStartupCommunicatorSelection } from '@/utils/persistStartupCommunicatorSelection';
import { buildBoardPath } from '@/utils/buildBoardPath';

interface SyncPersistedBoardNavigationParams {
  board: Board;
  previousBoardId: string;
  persistedBoardId: string;
  shouldReplaceBoard: boolean;
  replaceBoard: (payload: { prev: Board; current: Board }) => void;
  switchBoard: (boardId: string) => void;
  navigate: (path: string, options?: { replace?: boolean }) => void;
  communicatorId?: string;
  shouldPersistStartupCommunicator?: boolean;
}

export async function syncPersistedBoardNavigation(
  params: SyncPersistedBoardNavigationParams,
): Promise<void> {
  const {
    board,
    previousBoardId,
    persistedBoardId,
    shouldReplaceBoard,
    replaceBoard,
    switchBoard,
    navigate,
    communicatorId,
    shouldPersistStartupCommunicator,
  } = params;

  await persistStartupCommunicatorSelection({
    communicatorId,
    shouldPersist: shouldPersistStartupCommunicator,
  });

  reconcilePersistedBoard({
    board,
    previousBoardId,
    persistedBoardId,
    shouldReplace: shouldReplaceBoard,
    replaceBoard,
  });

  switchBoard(persistedBoardId);
  navigate(buildBoardPath(persistedBoardId, communicatorId), { replace: true });
}
