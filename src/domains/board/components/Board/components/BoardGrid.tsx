import Grid from '@mui/material/Grid';
import React from 'react';

import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import Tile from '../Tile/Tile.component';

import type { Tile as TileType } from '@/types/board';

interface BoardGridProps {
  tiles: TileType[];
  onTileClick: (tile: TileType) => void;
  onTileEdit?: (tile: TileType) => void;
  isEditMode?: boolean;
  gridSize?: number;
}

const BoardGrid: React.FC<BoardGridProps> = ({
  tiles,
  onTileClick,
  onTileEdit,
  isEditMode = false,
  gridSize = 4,
}) => {
  const isFixed = useBoardsStore((s) => {
    const active = s.boards.find((b) => b.id === s.activeBoardId);
    return Boolean(active?.isFixed);
  });

  if (isFixed) {
    // Render fixed grid layout
    return (
      <div className="Board__FixedGrid">
        {tiles.map((tile, index) => (
          <Tile
            key={tile.id || index}
            tile={tile}
            onClick={() => onTileClick(tile)}
            onEdit={onTileEdit ? () => onTileEdit(tile) : undefined}
            editMode={isEditMode}
          />
        ))}
      </div>
    );
  }

  // Render responsive grid
  return (
    <Grid container spacing={1} className="Board__Grid">
      {tiles.map((tile, index) => (
        <Grid
          size={12 / gridSize}
          key={tile.id || index}
          className="Board__Grid__Item"
        >
          <Tile
            tile={tile}
            onClick={() => onTileClick(tile)}
            onEdit={onTileEdit ? () => onTileEdit(tile) : undefined}
            editMode={isEditMode}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default BoardGrid;
