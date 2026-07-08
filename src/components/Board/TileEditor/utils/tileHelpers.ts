import shortid from 'shortid';

import { Tile } from '../../../../types/board';

interface TileColors {
  folder: string;
  button: string;
  board: string;
}

type TileType = 'button' | 'folder' | 'board';

interface UpdateTilePropertyResult {
  tiles?: Tile[];
  tile?: Tile;
}

export function getDefaultColor(
  type: TileType,
  defaultTileColors: TileColors,
): string {
  if (type === 'folder') {
    return defaultTileColors.folder;
  }
  if (type === 'button') {
    return defaultTileColors.button;
  }
  if (type === 'board') {
    return defaultTileColors.board;
  }
  return defaultTileColors.button;
}

export function createTileForType(
  type: TileType,
  currentTile: Tile,
  defaultTileColors: TileColors,
): Tile {
  let loadBoard = '';
  if (type === 'folder' || type === 'board') {
    loadBoard = shortid.generate();
  }

  let backgroundColor = defaultTileColors.button;
  if (type === 'board') {
    backgroundColor = defaultTileColors.board;
  }
  if (type === 'folder') {
    backgroundColor = defaultTileColors.folder;
  }

  return {
    ...currentTile,
    linkedBoard: false,
    backgroundColor,
    loadBoard,
    type,
  };
}

export function updateTileProperty(
  tiles: Tile[],
  tile: Tile,
  isEditing: boolean,
  activeStep: number,
  property: keyof Tile,
  value: unknown,
): UpdateTilePropertyResult {
  if (isEditing) {
    const currentTile = tiles[activeStep];
    const updatedTiles = tiles.map((t) =>
      t.id === currentTile.id ? { ...t, [property]: value } : t,
    );
    return { tiles: updatedTiles };
  } else {
    return { tile: { ...tile, [property]: value } };
  }
}
