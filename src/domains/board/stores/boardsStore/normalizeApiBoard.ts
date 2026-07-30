import type { Board, Tile } from '@/types/board';

const DEFAULT_FIXED_GRID_COLUMNS = 5;

const normalizeGridForFixedBoard = (board: Board): Board => {
  if (!board?.isFixed) {
    return board;
  }

  const tiles = Array.isArray(board.tiles) ? board.tiles : [];
  const tileIds = new Set(
    tiles.map((tile) => String(tile?.id || '').trim()).filter(Boolean),
  );
  const loadBoardToTileId = new Map<string, string>();
  tiles.forEach((tile) => {
    const tileId = String(tile?.id || '').trim();
    const loadBoard = String((tile as any)?.loadBoard || '').trim();
    if (!tileId || !loadBoard) return;
    if (!loadBoardToTileId.has(loadBoard)) {
      loadBoardToTileId.set(loadBoard, tileId);
    }
  });

  const sourceGrid = board.grid || ({} as Board['grid']);
  const sourceOrder = Array.isArray(sourceGrid?.order) ? sourceGrid.order : [];
  const orderColumns = sourceOrder.reduce((max, row) => {
    if (!Array.isArray(row)) return max;
    return Math.max(max, row.length);
  }, 0);
  const columns = Math.max(
    1,
    Number(sourceGrid?.columns || 0) ||
      orderColumns ||
      DEFAULT_FIXED_GRID_COLUMNS,
  );
  const minimumRowsToFitTiles = Math.max(1, Math.ceil(tiles.length / columns));
  const baseRows = Math.max(
    1,
    Number(sourceGrid?.rows || 0) ||
      sourceOrder.length ||
      minimumRowsToFitTiles,
  );

  const nextOrder: (string | null)[][] = Array.from(
    { length: baseRows },
    (_row, rowIndex) =>
      Array.from({ length: columns }, (_col, colIndex) => {
        const value = sourceOrder[rowIndex]?.[colIndex];
        if (typeof value !== 'string') return null;
        const normalizedValue = value.trim();
        if (!normalizedValue) return null;

        if (tileIds.has(normalizedValue)) {
          return normalizedValue;
        }

        // Compatibilidad histórica:
        // algunos boards guardaron en grid.order el loadBoard (ej: "hobbiesBoard")
        // en lugar del tile.id (ej: "hobbies"), lo que genera huecos internos.
        return loadBoardToTileId.get(normalizedValue) || null;
      }),
  );

  const orderedIds = new Set<string>();
  nextOrder.forEach((row) =>
    row.forEach((id) => {
      if (id) orderedIds.add(id);
    }),
  );

  const missingTileIds = tiles
    .map((tile) => String(tile?.id || '').trim())
    .filter((id) => id && !orderedIds.has(id));

  let missingIndex = 0;
  for (let rowIndex = 0; rowIndex < nextOrder.length; rowIndex += 1) {
    for (
      let colIndex = 0;
      colIndex < nextOrder[rowIndex].length;
      colIndex += 1
    ) {
      if (
        nextOrder[rowIndex][colIndex] === null &&
        missingIndex < missingTileIds.length
      ) {
        nextOrder[rowIndex][colIndex] = missingTileIds[missingIndex];
        missingIndex += 1;
      }
    }
  }

  while (missingIndex < missingTileIds.length) {
    const newRow: (string | null)[] = Array.from(
      { length: columns },
      () => null,
    );
    for (
      let colIndex = 0;
      colIndex < columns && missingIndex < missingTileIds.length;
      colIndex += 1
    ) {
      newRow[colIndex] = missingTileIds[missingIndex];
      missingIndex += 1;
    }
    nextOrder.push(newRow);
  }

  // Eliminar filas completamente vacías al final para evitar "espacios fantasma"
  // cuando la metadata rows quedó inflada respecto al contenido real.
  while (nextOrder.length > 1) {
    const lastRow = nextOrder[nextOrder.length - 1];
    const hasAnyTile = lastRow.some((cell) => Boolean(cell));
    if (hasAnyTile) break;
    nextOrder.pop();
  }

  return {
    ...board,
    grid: {
      ...(sourceGrid || {}),
      columns,
      rows: nextOrder.length,
      order: nextOrder,
    },
  };
};

interface NormalizeBoardOptions {
  forceSystemBoard?: boolean;
}

export const normalizeApiBoard = (
  rawBoard: any,
  options: NormalizeBoardOptions = {},
): Board => {
  const normalizedTiles: Tile[] = Array.isArray(rawBoard?.tiles)
    ? rawBoard.tiles.filter(Boolean)
    : [];
  const fixedFromApi =
    typeof rawBoard?.isFixed === 'boolean'
      ? rawBoard.isFixed
      : Boolean(rawBoard?.fixed);

  const normalizedBoard: Board = {
    ...rawBoard,
    id: String(rawBoard?.id || rawBoard?.boardId || rawBoard?._id || '').trim(),
    isFixed: fixedFromApi,
    tiles: normalizedTiles,
    ...(options.forceSystemBoard ? { isSystemBoard: true } : {}),
  } as Board;

  return normalizeGridForFixedBoard(normalizedBoard);
};
