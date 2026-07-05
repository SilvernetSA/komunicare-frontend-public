import { syncPersistedBoardNavigation } from './syncPersistedBoardNavigation';
import { Board } from '../../types/board';

interface PersistBoardAndSyncNavigationParams {
  persistBoard: () => Promise<string>;
  board: Board;
  previousBoardId: string;
  shouldReplaceBoard: boolean;
  replaceBoard: (payload: { prev: Board; current: Board }) => void;
  switchBoard: (boardId: string) => void;
  navigate: (path: string, options?: { replace?: boolean }) => void;
  communicatorId?: string;
  shouldPersistStartupCommunicator?: boolean;
}

export async function persistBoardAndSyncNavigation(
  params: PersistBoardAndSyncNavigationParams,
): Promise<string> {
  const { persistBoard, ...syncParams } = params;
  const persistedBoardId = await persistBoard();

  await syncPersistedBoardNavigation({
    ...syncParams,
    persistedBoardId,
  });

  return persistedBoardId;
}
