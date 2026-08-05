import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';

import { EditToolbarEndGroup } from './EditToolbar/EditToolbarEndGroup';
import { EditToolbarStartGroup } from './EditToolbar/EditToolbarStartGroup';
import { EditToolbarTitle } from './EditToolbar/EditToolbarTitle';

import { Board } from '@/types/board';
import { getBoardDisplayTitle } from '@/utils/getBoardDisplayTitle';

import './EditToolbar.css';

interface EditToolbarProps {
  className?: string;
  classes?: object;
  isSelectAll?: boolean;
  isFixedBoard?: boolean;
  isSelecting?: boolean;
  isSaving?: boolean;
  isLoggedIn?: boolean;
  selectedItemsCount: number;
  onSelectClick?: () => void;
  onDeleteClick?: () => void;
  onEditClick?: () => void;
  onSelectAllToggle?: () => void;
  onBoardTitleClick?: () => void;
  onSaveBoardClick?: () => void;
  board: Board;
  onAddClick?: () => void;
  onBoardTypeChange?: () => void;
  onCopyTiles?: () => void;
  onPasteTiles?: () => void;
  copiedTiles?: unknown[];
}

const EditToolbar: React.FC<EditToolbarProps> = ({
  board,
  className,
  classes: _classes,
  isSelectAll = false,
  isSelecting = false,
  isFixedBoard = false,
  isSaving = false,
  isLoggedIn = false,
  selectedItemsCount,
  onSelectClick,
  onDeleteClick,
  onEditClick,
  onSelectAllToggle,
  onBoardTitleClick,
  onSaveBoardClick: _onSaveBoardClick,
  onAddClick,
  onBoardTypeChange,
  onCopyTiles,
  onPasteTiles,
  copiedTiles = [],
}) => {
  const intl = useIntl();
  const isItemsSelected = !!selectedItemsCount;
  const isFixed = !!isFixedBoard;
  const boardTitle = getBoardDisplayTitle(board, intl as any);

  return (
    <div
      className={classNames('EditToolbar', className, {
        'EditToolbar--selecting': isSelecting,
      })}
    >
      <EditToolbarTitle
        isSaving={isSaving}
        isLoggedIn={isLoggedIn}
        boardTitle={boardTitle}
        onBoardTitleClick={onBoardTitleClick}
      />
      <EditToolbarStartGroup
        isSelecting={isSelecting}
        isSaving={isSaving}
        isFixed={isFixed}
        onSelectClick={onSelectClick}
        onBoardTypeChange={onBoardTypeChange}
        intl={intl}
      />
      <EditToolbarEndGroup
        isSelecting={isSelecting}
        isSaving={isSaving}
        isSelectAll={isSelectAll}
        isItemsSelected={isItemsSelected}
        selectedItemsCount={selectedItemsCount}
        copiedTiles={copiedTiles}
        onDeleteClick={onDeleteClick}
        onEditClick={onEditClick}
        onSelectAllToggle={onSelectAllToggle}
        onAddClick={onAddClick}
        onCopyTiles={onCopyTiles}
        onPasteTiles={onPasteTiles}
        intl={intl}
      />
    </div>
  );
};

export default EditToolbar;
