import React from 'react';
import Tile from '../../Tile/Tile.component';
import Symbol from '../../Symbol/Symbol';
import { Tile as TileData } from '../../../../types/board';

interface TilePreviewProps {
  tile: TileData;
  backgroundColor?: string;
  currentLabel: string;
}

export const TilePreview: React.FC<TilePreviewProps> = ({
  tile,
  backgroundColor,
  currentLabel,
}) => {
  return (
    <div className="TileEditor__preview">
      <Tile
        backgroundColor={backgroundColor || tile.backgroundColor}
        variant={Boolean(tile.loadBoard) ? 'folder' : 'button'}
      >
        <Symbol image={tile.image} label={currentLabel} />
      </Tile>
    </div>
  );
};
