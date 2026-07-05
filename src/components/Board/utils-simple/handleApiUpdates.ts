import { IntlShape } from 'react-intl';

import {
  isOwnedByUser,
  isProtectedBoard,
  isProtectedCommunicator,
  resolveBundleNameForBoard,
  resolveCommunicatorBundle,
  resolveProtectedBoardCommunicatorCopy,
} from './copyOnWrite';
import { nameFromKey } from './nameFromKey';
import { saveProtectedBoardWorkflow } from './saveProtectedBoardWorkflow';
import { prepareBoardForPersistence } from '../../../store/boardsStore/prepareBoardForPersistence';
import { useCommunicatorsStore } from '../../../store/communicatorsStore';
import { UserData } from '../../../types/app';
import { Tile, Board } from '../../../types/board';
import { getBoardDisplayTitle } from '../../../utils/getBoardDisplayTitle';
import messages from '../Board.messages';

interface Communicator {
  id?: string;
  email: string;
  name?: string;
  author?: string;
  [key: string]: unknown;
}

interface HandleApiUpdatesParams {
  tile?: Tile | null;
  deletedTilesiIds?: string[] | null;
  editedTiles?: Tile[] | null;
  processedBoard?: Board | null;
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
  switchBoard: (boardId: string) => void;
  lang: string;
  navigate: (path: string, options?: { replace?: boolean }) => void;
  setSaving: (saving: boolean) => void;
  uploadTileSound: (tile: Tile) => Promise<Tile>;
  showNotification: (message: string) => void;
  communicators?: Communicator[];
  onExistingCopyFound?: (communicator: Communicator) => void;
}

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
      rows: requiredRows,
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
    switchBoard,
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
      switchBoard(parentBoardId);
      navigate(`/board/${parentBoardId}`, { replace: true });
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
        switchBoard,
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
