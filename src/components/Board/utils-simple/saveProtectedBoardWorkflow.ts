import { resolveProtectedBoardCommunicatorCopy } from './copyOnWrite';
import { persistBoardAndSyncNavigation } from '../../../store/boardsStore/persistBoardAndSyncNavigation';
import { prepareBoardForPersistence } from '../../../store/boardsStore/prepareBoardForPersistence';
import { Board } from '../../../types/board';

type CommunicatorCopyParams = Parameters<
  typeof resolveProtectedBoardCommunicatorCopy
>[0];

interface SaveProtectedBoardWorkflowParams {
  board: Board;
  shouldCreateBoardCopy: boolean;
  communicatorCopyParams: CommunicatorCopyParams;
  updateBoard: (board: Board) => void;
  persistBoard: (params: {
    board: Board;
    createCommunicator: boolean;
    createBoard: boolean;
    previousBoardId: string;
  }) => Promise<string>;
  replaceBoard: (payload: { prev: Board; current: Board }) => void;
  switchBoard: (boardId: string) => void;
  navigate: (path: string, options?: { replace?: boolean }) => void;
  getCommunicatorId?: () => string | undefined;
}

type SaveProtectedBoardWorkflowResult =
  | {
      wasAborted: true;
    }
  | {
      wasAborted: false;
      persistedBoardId: string;
    };

export async function saveProtectedBoardWorkflow({
  board,
  shouldCreateBoardCopy,
  communicatorCopyParams,
  updateBoard,
  persistBoard,
  replaceBoard,
  switchBoard,
  navigate,
  getCommunicatorId,
}: SaveProtectedBoardWorkflowParams): Promise<SaveProtectedBoardWorkflowResult> {
  const communicatorCopyState = await resolveProtectedBoardCommunicatorCopy(
    communicatorCopyParams,
  );

  if (communicatorCopyState.shouldAbort) {
    return { wasAborted: true };
  }

  const preparedBoard = prepareBoardForPersistence({
    board,
    shouldCreateBoardCopy,
    updateBoard,
  });

  const persistedBoardId = await persistBoardAndSyncNavigation({
    persistBoard: () =>
      persistBoard({
        board: preparedBoard.board,
        createCommunicator: communicatorCopyState.createCommunicator,
        createBoard: preparedBoard.createBoard,
        previousBoardId: preparedBoard.previousBoardId,
      }),
    board: preparedBoard.board,
    previousBoardId: preparedBoard.previousBoardId,
    shouldReplaceBoard: preparedBoard.createBoard,
    replaceBoard,
    switchBoard,
    navigate,
    communicatorId: getCommunicatorId?.(),
    shouldPersistStartupCommunicator:
      communicatorCopyState.createCommunicator &&
      communicatorCopyState.communicatorCopyResolution?.setAsStartup,
  });

  return {
    wasAborted: false,
    persistedBoardId,
  };
}
