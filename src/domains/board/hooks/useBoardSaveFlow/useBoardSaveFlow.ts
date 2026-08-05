import { useCallback } from 'react';
import { IntlShape } from 'react-intl';

import {
  isOwnedByUser,
  isProtectedBoard,
  isProtectedCommunicator,
  resolveBundleNameForBoard,
  resolveCommunicatorBundle,
  resolveProtectedBoardCommunicatorCopy,
} from './useBoardSaveFlow.copyOnWrite';
import { saveProtectedBoardWorkflow } from './useBoardSaveFlow.workflow';
import messages from '../../components/Messages/Board.messages';

import { prepareBoardForPersistence } from '@/domains/board/stores/boardsStore/prepareBoardForPersistence';
import { useCommunicatorsStore } from '@/domains/communicator/stores/communicatorsStore';
import { UserData } from '@/types/app';
import { Tile, Board } from '@/types/board';
import { Communicator } from '@/types/communicator';
import { boardUrl } from '@/utils/boardUrl';
import { getBoardDisplayTitle } from '@/utils/getBoardDisplayTitle';

export interface BoardMutationPayload {
  tile?: Tile | null;
  deletedTilesiIds?: string[] | null;
  editedTiles?: Tile[] | null;
  processedBoard?: Board | null;
}

export interface HandleApiUpdatesParams extends BoardMutationPayload {
  userData: UserData;
  communicator: Communicator;
  board: Board;
  intl: IntlShape;
  upsertCommunicator: (communicator: Communicator) => void;
  syncBoardWithCommunicator: (args: {
    parentBoard: Board;
    createCommunicator?: boolean;
    createParentBoard?: boolean;
    previousBoardId?: string;
  }) => Promise<string>;
  syncBoardsWithCommunicator: (args: {
    childBoard: Board;
    parentBoard: Board;
    createCommunicator?: boolean;
    createParentBoard?: boolean;
    previousParentBoardId?: string;
  }) => Promise<string>;
  replaceBoard: (payload: { prev: Board; current: Board }) => void;
  updateBoard: (board: Board) => void;
  syncActiveBoardAfterSave: (boardId: string) => void;
  lang: string;
  navigate: (path: string, options?: { replace?: boolean }) => void;
  setSaving: (saving: boolean) => void;
  uploadTileSound: (tile: Tile) => Promise<Tile>;
  showNotification: (message: string) => void;
  communicators?: Communicator[];
  onExistingCopyFound?: (communicator: Communicator) => void;
}

export interface UseBoardSaveFlowParams extends Omit<
  HandleApiUpdatesParams,
  keyof BoardMutationPayload | 'board' | 'communicator'
> {
  board?: Board;
  communicator?: Communicator;
}

const nameFromKey = (board: Board): string | undefined => {
  if (!board.nameKey) {
    return undefined;
  }

  const nameKeyArray = board.nameKey.split('.');
  return nameKeyArray[nameKeyArray.length - 1];
};

export const useBoardSaveFlow = ({
  userData,
  communicator,
  board,
  intl,
  upsertCommunicator,
  syncBoardWithCommunicator,
  syncBoardsWithCommunicator,
  replaceBoard,
  updateBoard,
  syncActiveBoardAfterSave,
  lang,
  navigate,
  setSaving,
  uploadTileSound,
  showNotification,
  communicators,
  onExistingCopyFound,
}: UseBoardSaveFlowParams) => {
  const saveBoardChanges = useCallback(
    (payload: BoardMutationPayload) => {
      if (!board || !communicator) {
        return Promise.resolve(false);
      }

      return handleApiUpdates({
        ...payload,
        userData,
        communicator,
        board,
        intl,
        upsertCommunicator,
        syncBoardWithCommunicator,
        syncBoardsWithCommunicator,
        replaceBoard,
        updateBoard,
        syncActiveBoardAfterSave,
        lang,
        navigate,
        setSaving,
        uploadTileSound,
        showNotification,
        communicators,
        onExistingCopyFound,
      });
    },
    [
      board,
      communicator,
      communicators,
      intl,
      lang,
      navigate,
      onExistingCopyFound,
      replaceBoard,
      setSaving,
      showNotification,
      syncActiveBoardAfterSave,
      syncBoardWithCommunicator,
      syncBoardsWithCommunicator,
      updateBoard,
      uploadTileSound,
      upsertCommunicator,
      userData,
    ],
  );

  return { saveBoardChanges };
};

const ensureFixedGridCapacity = (boardData: Board): Board => {
  if (
    !boardData.isFixed ||
    !boardData.grid ||
    !Array.isArray(boardData.tiles)
  ) {
    return boardData;
  }

  const columns = Math.max(1, Number(boardData.grid.columns || 0));
  const currentRows = Math.max(1, Number(boardData.grid.rows || 0));
  const requiredRows = Math.max(
    currentRows,
    Math.ceil(boardData.tiles.length / columns),
  );

  const currentOrder = Array.isArray(boardData.grid.order)
    ? boardData.grid.order.map((row) => [...row])
    : [];
  const nextOrder: (string | null)[][] = Array.from(
    { length: requiredRows },
    (_, rowIndex) =>
      Array.from(
        { length: columns },
        (_, columnIndex) => currentOrder[rowIndex]?.[columnIndex] ?? null,
      ),
  );

  const knownIds = new Set<string>();
  nextOrder.forEach((row) =>
    row.forEach((id) => {
      if (typeof id === 'string') {
        knownIds.add(id);
      }
    }),
  );

  const missingTileIds = boardData.tiles
    .map((tile) => tile.id)
    .filter((id) => id && !knownIds.has(id));

  let lastOccupiedFlatIndex = -1;
  for (let rowIndex = 0; rowIndex < nextOrder.length; rowIndex += 1) {
    for (
      let columnIndex = 0;
      columnIndex < nextOrder[rowIndex].length;
      columnIndex += 1
    ) {
      if (nextOrder[rowIndex][columnIndex] !== null) {
        lastOccupiedFlatIndex = rowIndex * columns + columnIndex;
      }
    }
  }

  let missingIndex = 0;
  const totalFlatCells = nextOrder.length * columns;

  for (
    let flatIndex = lastOccupiedFlatIndex + 1;
    flatIndex < totalFlatCells && missingIndex < missingTileIds.length;
    flatIndex += 1
  ) {
    const rowIndex = Math.floor(flatIndex / columns);
    const columnIndex = flatIndex % columns;
    if (nextOrder[rowIndex]?.[columnIndex] === null) {
      nextOrder[rowIndex][columnIndex] = missingTileIds[missingIndex];
      missingIndex += 1;
    }
  }

  if (missingIndex < missingTileIds.length) {
    for (let rowIndex = 0; rowIndex < nextOrder.length; rowIndex += 1) {
      for (
        let columnIndex = 0;
        columnIndex < nextOrder[rowIndex].length;
        columnIndex += 1
      ) {
        if (
          nextOrder[rowIndex][columnIndex] === null &&
          missingIndex < missingTileIds.length
        ) {
          nextOrder[rowIndex][columnIndex] = missingTileIds[missingIndex];
          missingIndex += 1;
        }
      }
    }
  }

  return {
    ...boardData,
    grid: {
      ...boardData.grid,
      // Keep the user's chosen row count: tiles beyond rows*columns render on
      // scrollable overflow rows now. Persisting requiredRows here silently
      // reset a 2x3 grid to 7 rows on every save (e.g. after deleting a
      // communicator triggered a board sync).
      rows: currentRows,
      columns,
      order: nextOrder,
    },
  };
};

let protectedBoardCopyInFlight: Promise<boolean> | null = null;

export async function handleApiUpdates(
  params: HandleApiUpdatesParams,
): Promise<boolean> {
  const {
    tile = null,
    deletedTilesiIds = null,
    editedTiles = null,
    processedBoard = null,
    userData,
    communicator,
    board,
    intl,
    upsertCommunicator,
    syncBoardWithCommunicator,
    syncBoardsWithCommunicator,
    replaceBoard,
    updateBoard,
    syncActiveBoardAfterSave,
    lang,
    navigate,
    setSaving,
    uploadTileSound,
    showNotification,
    communicators = [],
    onExistingCopyFound,
  } = params;

  if (!userData.email) {
    return false;
  }

  setSaving(true);

  let processedTile = tile;
  if (tile && tile.sound && tile.sound.startsWith('data')) {
    processedTile = await uploadTileSound(tile);
  }

  let processedEditedTiles = editedTiles;
  if (editedTiles) {
    const _editedTiles: Tile[] = [];
    for (const _tile of editedTiles) {
      _editedTiles.push(await uploadTileSound(_tile));
    }
    processedEditedTiles = _editedTiles;
  }

  let createChildBoard = false;
  let childBoardData: Board | null = null;

  let uTiles: Tile[] = [];
  if (deletedTilesiIds) {
    uTiles = board.tiles.filter(
      (cTile) => !deletedTilesiIds.includes(cTile.id),
    );
  }
  if (processedEditedTiles) {
    uTiles = board.tiles.map(
      (cTile) => processedEditedTiles!.find((s) => s.id === cTile.id) || cTile,
    );
  }
  if (processedTile) {
    uTiles = board.tiles.find((t) => t.id === processedTile!.id)
      ? [...board.tiles]
      : [...board.tiles, processedTile];
  }

  let parentBoardData: Board = processedBoard
    ? processedBoard
    : {
        ...board,
        name:
          board.name ||
          nameFromKey(board) ||
          intl.formatMessage(messages.myBoardTitle),
        tiles: uTiles,
        author: userData.name || board.author,
        email: userData.email,
        hidden: false,
        locale: lang,
      };
  parentBoardData = {
    ...parentBoardData,
    name:
      getBoardDisplayTitle(parentBoardData, intl as any) ||
      intl.formatMessage(messages.myBoardTitle),
  };
  parentBoardData = ensureFixedGridCapacity(parentBoardData);

  const sourceBoardForOwnershipCheck = processedBoard || board;
  let shouldCreateParentBoardCopy = isProtectedBoard(
    sourceBoardForOwnershipCheck,
    userData,
  );
  const sourceBoardId = String(
    sourceBoardForOwnershipCheck?.id || board?.id || '',
  );
  const isOfficialRootBoard = sourceBoardId === 'komunicare';
  const activeCommunicatorRootBoard = String(
    (communicator as any)?.rootBoard || '',
  );
  const isEditingCanonicalRootBoard =
    isOfficialRootBoard && sourceBoardId === activeCommunicatorRootBoard;
  const activeOwnedByUser = isOwnedByUser(
    String((communicator as any)?.email || ''),
    userData.email,
  );
  const isEditingCanonicalRootOfOfficialCommunicator =
    isEditingCanonicalRootBoard && !activeOwnedByUser;
  if (isOfficialRootBoard || isEditingCanonicalRootOfOfficialCommunicator) {
    shouldCreateParentBoardCopy = true;
  }
  let shouldCloneCommunicator =
    shouldCreateParentBoardCopy &&
    (isProtectedCommunicator(communicator as any, userData) ||
      isOfficialRootBoard);
  const sourceBundle = resolveBundleNameForBoard(
    communicator as any,
    sourceBoardId,
  );
  const activeCommunicatorBundle = resolveCommunicatorBundle(
    communicator as any,
  );
  const isAlreadyInPersonalCommunicatorForBundle =
    activeOwnedByUser &&
    Boolean(sourceBundle) &&
    sourceBundle === activeCommunicatorBundle;

  if (
    shouldCloneCommunicator &&
    isAlreadyInPersonalCommunicatorForBundle &&
    !isOfficialRootBoard
  ) {
    shouldCloneCommunicator = false;
  }

  if (
    isOfficialRootBoard &&
    shouldCreateParentBoardCopy &&
    (communicator as any)?.name
  ) {
    parentBoardData = { ...parentBoardData, name: (communicator as any).name };
  }

  const communicatorState = useCommunicatorsStore.getState();
  const availableCommunicators =
    (communicators && communicators.length
      ? communicators
      : communicatorState.communicators) || [];
  const activeIsBundleCopyForCanonicalBoard =
    isOfficialRootBoard &&
    activeOwnedByUser &&
    Boolean(sourceBundle) &&
    sourceBundle === activeCommunicatorBundle &&
    Boolean(activeCommunicatorRootBoard) &&
    activeCommunicatorRootBoard !== sourceBoardId;

  const communicatorCopyParams = {
    shouldResolveCommunicatorCopy: shouldCloneCommunicator,
    existingCopy: activeIsBundleCopyForCanonicalBoard
      ? (communicator as any)
      : null,
    communicators: availableCommunicators as any,
    fallbackCommunicators: communicatorState.communicators as any,
    activeCommunicator: communicator as any,
    userEmail: userData.email,
    boardId: sourceBoardId,
    fetchMyCommunicators: communicatorState.fetchMyCommunicators,
    userData,
    boardTitle: parentBoardData.name,
    promptText: intl.formatMessage(messages.originalCommunicatorCopyNamePrompt),
    noticeMessage: intl.formatMessage(messages.originalCommunicatorCopyNotice),
    upsertCommunicator: upsertCommunicator as any,
    navigate,
    showNotification,
    onExistingCopy: (existingCopy) => {
      const activeCommunicatorId = String(
        (communicator as any)?.id || '',
      ).trim();
      const existingCopyId = String((existingCopy as any)?.id || '').trim();

      if (
        activeCommunicatorId &&
        existingCopyId &&
        activeCommunicatorId === existingCopyId
      ) {
        return false;
      }

      onExistingCopyFound?.(existingCopy as any);
      return true;
    },
  };

  if (processedTile && processedTile.loadBoard && !processedTile.linkedBoard) {
    const boardData: Board = {
      id: processedTile.loadBoard,
      name: processedTile.label || '',
      nameKey: processedTile.labelKey,
      hidden: false,
      tiles: [],
      isPublic: false,
      author: userData.name || board.author,
      email: userData.email,
      locale: lang,
      caption: processedTile.image,
    };
    childBoardData = { ...boardData };
    createChildBoard = true;
    updateBoard(childBoardData);
  }

  const shouldUseSpecialBoardTileBranch = Boolean(
    processedTile &&
    processedTile.type === 'board' &&
    shouldCreateParentBoardCopy,
  );

  try {
    if (shouldUseSpecialBoardTileBranch) {
      const communicatorCopyState = await resolveProtectedBoardCommunicatorCopy(
        communicatorCopyParams,
      );

      if (communicatorCopyState.shouldAbort) {
        return false;
      }

      prepareBoardForPersistence({
        board: parentBoardData,
        shouldCreateBoardCopy: shouldCreateParentBoardCopy,
        updateBoard,
      });

      const parentBoardId = await syncBoardWithCommunicator({
        parentBoard: childBoardData!,
        createCommunicator: communicatorCopyState.createCommunicator,
        createParentBoard: true,
      });
      syncActiveBoardAfterSave(parentBoardId);
      navigate(
        boardUrl(
          parentBoardId,
          useCommunicatorsStore.getState().activeCommunicatorId,
        ),
        { replace: true },
      );
      return true;
    }

    if (shouldCreateParentBoardCopy && protectedBoardCopyInFlight) {
      return protectedBoardCopyInFlight;
    }

    const workflowPromise = (async () => {
      const saveResult = await saveProtectedBoardWorkflow({
        board: parentBoardData,
        shouldCreateBoardCopy: shouldCreateParentBoardCopy,
        communicatorCopyParams,
        updateBoard,
        persistBoard: ({
          board: preparedParentBoard,
          createCommunicator,
          createBoard,
          previousBoardId,
        }) =>
          createChildBoard
            ? syncBoardsWithCommunicator({
                childBoard: childBoardData!,
                parentBoard: preparedParentBoard,
                createCommunicator,
                createParentBoard: createBoard,
                previousParentBoardId: previousBoardId,
              })
            : syncBoardWithCommunicator({
                parentBoard: preparedParentBoard,
                createCommunicator,
                createParentBoard: createBoard,
                previousBoardId,
              }),
        replaceBoard,
        syncActiveBoardAfterSave,
        navigate,
        getCommunicatorId: () =>
          useCommunicatorsStore.getState().activeCommunicatorId,
      });

      return !saveResult.wasAborted;
    })();

    if (shouldCreateParentBoardCopy) {
      protectedBoardCopyInFlight = workflowPromise;
      try {
        return await workflowPromise;
      } finally {
        protectedBoardCopyInFlight = null;
      }
    }

    return await workflowPromise;
  } catch (error) {
    console.error('Error updating board in API', error);
    return false;
  } finally {
    setSaving(false);
  }
}
