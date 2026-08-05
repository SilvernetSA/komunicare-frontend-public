import React from 'react';

import { AddTileButton } from './EditToolbarEndGroup/AddTileButton';
import { SelectionActions } from './EditToolbarEndGroup/SelectionActions';

interface EditToolbarEndGroupProps {
  isSelecting: boolean;
  isSaving: boolean;
  isSelectAll: boolean;
  isItemsSelected: boolean;
  selectedItemsCount: number;
  copiedTiles: unknown[];
  onDeleteClick?: () => void;
  onEditClick?: () => void;
  onSelectAllToggle?: () => void;
  onAddClick?: () => void;
  onCopyTiles?: () => void;
  onPasteTiles?: () => void;
  intl: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
}

export const EditToolbarEndGroup: React.FC<EditToolbarEndGroupProps> = ({
  isSelecting,
  isSaving,
  isSelectAll,
  isItemsSelected,
  selectedItemsCount,
  copiedTiles,
  onDeleteClick,
  onEditClick,
  onSelectAllToggle,
  onAddClick,
  onCopyTiles,
  onPasteTiles,
  intl,
}) => (
  <div className="EditToolbar__group EditToolbar__group--end">
    <SelectionActions
      isSelecting={isSelecting}
      isSelectAll={isSelectAll}
      isItemsSelected={isItemsSelected}
      selectedItemsCount={selectedItemsCount}
      copiedTiles={copiedTiles}
      onDeleteClick={onDeleteClick}
      onEditClick={onEditClick}
      onSelectAllToggle={onSelectAllToggle}
      onCopyTiles={onCopyTiles}
      onPasteTiles={onPasteTiles}
      intl={intl}
    />
    <AddTileButton
      isSelecting={isSelecting}
      isSaving={isSaving}
      onAddClick={onAddClick}
      intl={intl}
    />
  </div>
);
