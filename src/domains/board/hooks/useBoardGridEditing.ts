import { useCallback, useRef } from 'react';

import {
  isOwnedByUser,
  isProtectedBoard,
} from './useBoardSaveFlow/useBoardSaveFlow.copyOnWrite';

import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import { UserData } from '@/types/app';
import { Board as BoardModel, Position, Tile } from '@/types/board';

type GridBoardApiUpdatePayload = {
  tile: null;
  deletedTilesiIds: null;
  editedTiles: null;
  processedBoard: BoardModel | null;
};

type BoardLayoutItem = {
  i: string;
  x: number;
  y: number;
};

interface UseBoardGridEditingParams {
  activeBoard?: BoardModel;
  communicatorEmail?: string;
  userEmail?: string;
  updateBoard: (board: BoardModel) => void;
  saveBoardChanges: (payload: GridBoardApiUpdatePayload) => Promise<unknown>;
  updateRemoteBoard?: (board: BoardModel) => Promise<BoardModel>;
}

interface UseBoardGridEditingResult {
  canOrganizeBoard: boolean;
  saveGridToApi: (board: BoardModel) => void;
  handleGridEditOnProtectedBoard: (nextBoard: BoardModel) => Promise<void>;
  handleAddRemoveRow: (isAdd: boolean) => void;
  handleAddRemoveColumn: (isAdd: boolean) => void;
  persistBoardOrder: (nextBoard: BoardModel) => void;
  handleLayoutChange: (layout: unknown[]) => void;
  handleTileDrop: (item: { id: string }, position: Position) => void;
}

export const useBoardGridEditing = ({
  activeBoard,
  communicatorEmail,
  userEmail,
  updateBoard,
  saveBoardChanges,
  updateRemoteBoard,
}: UseBoardGridEditingParams): UseBoardGridEditingResult => {
  // Debounced API save for grid size changes (rows / columns).
  // We keep a ref to the pending timeout so rapid button presses only
  // produce a single network request once the user stops clicking.
  const gridSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveGridToApi = useCallback(
    (board: BoardModel) => {
      if (gridSaveTimerRef.current) clearTimeout(gridSaveTimerRef.current);
      gridSaveTimerRef.current = setTimeout(() => {
        // Only save if the board belongs to the current user (already copied).
        // Use the canonical ownership check: the previous raw === email compare
        // (case-sensitive) plus an id-length heuristic silently skipped the
        // save for legit boards — rows looked changed locally but reverted to
        // the server value on reload.
        if (isOwnedByUser(board.email, userEmail)) {
          const remoteUpdate =
            updateRemoteBoard || useBoardsStore.getState().updateRemoteBoard;
          remoteUpdate(board).catch((err: Error) => {
            console.warn(
              '[Board] Failed to save grid size to API:',
              err.message,
            );
          });
        } else {
          console.warn(
            '[Board] Grid size not saved: board is not owned by the user',
            board.id,
          );
        }
      }, 600);
    },
    [updateRemoteBoard, userEmail],
  );

  // When the user tries to change rows/columns on an official (protected) board,
  // route protected grid edits through the same copy-on-write save flow
  // used by the rest of the board mutations.
  const handleGridEditOnProtectedBoard = useCallback(
    async (nextBoard: BoardModel): Promise<void> => {
      await saveBoardChanges({
        tile: null,
        deletedTilesiIds: null,
        editedTiles: null,
        processedBoard: nextBoard,
      });
    },
    [saveBoardChanges],
  );

  const handleAddRemoveRow = useCallback(
    (isAdd: boolean) => {
      if (!activeBoard?.grid) return;
      const grid = activeBoard.grid;
      const newRows = isAdd ? grid.rows + 1 : Math.max(1, grid.rows - 1);
      const newBoard = { ...activeBoard, grid: { ...grid, rows: newRows } };

      if (isProtectedBoard(activeBoard, { email: userEmail } as UserData)) {
        void handleGridEditOnProtectedBoard(newBoard);
        return;
      }
      updateBoard(newBoard);
      saveGridToApi(newBoard);
    },
    [
      activeBoard,
      userEmail,
      handleGridEditOnProtectedBoard,
      updateBoard,
      saveGridToApi,
    ],
  );

  const handleAddRemoveColumn = useCallback(
    (isAdd: boolean) => {
      if (!activeBoard?.grid) return;
      const grid = activeBoard.grid;
      const newCols = isAdd ? grid.columns + 1 : Math.max(1, grid.columns - 1);
      const newBoard = { ...activeBoard, grid: { ...grid, columns: newCols } };

      if (isProtectedBoard(activeBoard, { email: userEmail } as UserData)) {
        void handleGridEditOnProtectedBoard(newBoard);
        return;
      }
      updateBoard(newBoard);
      saveGridToApi(newBoard);
    },
    [
      activeBoard,
      userEmail,
      handleGridEditOnProtectedBoard,
      updateBoard,
      saveGridToApi,
    ],
  );

  const canOrganizeBoard = Boolean(
    userEmail && communicatorEmail === userEmail,
  );

  const persistBoardOrder = useCallback(
    (nextBoard: BoardModel) => {
      if (!activeBoard) {
        return;
      }

      if (isProtectedBoard(activeBoard, { email: userEmail } as UserData)) {
        void handleGridEditOnProtectedBoard(nextBoard);
        return;
      }

      updateBoard(nextBoard);
      saveGridToApi(nextBoard);
    },
    [
      activeBoard,
      userEmail,
      handleGridEditOnProtectedBoard,
      updateBoard,
      saveGridToApi,
    ],
  );

  const handleLayoutChange = useCallback(
    (layout: unknown[]) => {
      if (
        !activeBoard ||
        !canOrganizeBoard ||
        !Array.isArray(activeBoard.tiles)
      ) {
        return;
      }

      const normalizedLayout = (Array.isArray(layout) ? layout : [])
        .filter(
          (item): item is BoardLayoutItem =>
            Boolean(item) &&
            typeof item === 'object' &&
            'i' in item &&
            'x' in item &&
            'y' in item,
        )
        .map((item) => ({
          i: String(item.i),
          x: Number(item.x),
          y: Number(item.y),
        }))
        .sort((left, right) => left.y - right.y || left.x - right.x);

      if (!normalizedLayout.length) {
        return;
      }

      const orderedIds = normalizedLayout.map((item) => item.i);
      const tilesById = new Map(
        activeBoard.tiles.map((tile) => [String(tile.id || ''), tile]),
      );
      const reorderedTiles = orderedIds
        .map((tileId) => tilesById.get(tileId))
        .filter((tile): tile is Tile => Boolean(tile));

      if (!reorderedTiles.length) {
        return;
      }

      activeBoard.tiles.forEach((tile) => {
        if (!orderedIds.includes(String(tile.id || ''))) {
          reorderedTiles.push(tile);
        }
      });

      const currentIds = activeBoard.tiles.map((tile) => String(tile.id || ''));
      const nextIds = reorderedTiles.map((tile) => String(tile.id || ''));
      if (currentIds.join('|') === nextIds.join('|')) {
        return;
      }

      persistBoardOrder({
        ...activeBoard,
        tiles: reorderedTiles,
      });
    },
    [activeBoard, canOrganizeBoard, persistBoardOrder],
  );

  const handleTileDrop = useCallback(
    (item: { id: string }, position: Position) => {
      if (!activeBoard?.grid || !canOrganizeBoard) {
        return;
      }

      const columns = Math.max(1, Number(activeBoard.grid.columns || 0));
      const rows = Math.max(1, Number(activeBoard.grid.rows || 0));
      const tileIds = Array.isArray(activeBoard.tiles)
        ? activeBoard.tiles.map((tile) => String(tile.id || '')).filter(Boolean)
        : [];
      // Cover the RENDERED rows: overflow rows exist when tiles exceed
      // rows*columns, and drops onto them (or drags from them) must not
      // fall outside the matrix.
      const renderedRows = Math.max(
        rows,
        Math.ceil(tileIds.length / columns),
        Math.floor(Number(position.row) || 0) + 1,
      );
      const currentOrder: (string | null)[][] = Array.from(
        { length: renderedRows },
        (_, rowIndex) =>
          Array.from({ length: columns }, (_, columnIndex) => {
            const existing = activeBoard.grid?.order?.[rowIndex]?.[columnIndex];
            if (typeof existing === 'string') {
              return existing;
            }

            const fallbackIndex = rowIndex * columns + columnIndex;
            return tileIds[fallbackIndex] || null;
          }),
      );

      const draggedId = String(item.id || '').trim();
      if (!draggedId) {
        return;
      }

      let sourceRow = -1;
      let sourceColumn = -1;
      currentOrder.forEach((row, rowIndex) => {
        row.forEach((cellId, columnIndex) => {
          if (cellId === draggedId) {
            sourceRow = rowIndex;
            sourceColumn = columnIndex;
          }
        });
      });

      if (sourceRow < 0 || sourceColumn < 0) {
        return;
      }

      const targetRow = position.row;
      const targetColumn = position.column;
      if (sourceRow === targetRow && sourceColumn === targetColumn) {
        return;
      }

      const nextOrder = currentOrder.map((row) => [...row]);
      const displacedId = nextOrder[targetRow]?.[targetColumn] || null;
      nextOrder[targetRow][targetColumn] = draggedId;
      nextOrder[sourceRow][sourceColumn] = displacedId;

      persistBoardOrder({
        ...activeBoard,
        grid: {
          ...activeBoard.grid,
          order: nextOrder,
        },
      });
    },
    [activeBoard, canOrganizeBoard, persistBoardOrder],
  );

  return {
    canOrganizeBoard,
    saveGridToApi,
    handleGridEditOnProtectedBoard,
    handleAddRemoveRow,
    handleAddRemoveColumn,
    persistBoardOrder,
    handleLayoutChange,
    handleTileDrop,
  };
};
