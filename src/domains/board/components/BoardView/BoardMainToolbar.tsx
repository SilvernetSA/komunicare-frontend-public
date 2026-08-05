import React from 'react';

import EditToolbar from './BoardMainToolbar/EditToolbar.component';
import Navbar from './BoardMainToolbar/Navbar';

import CommunicatorToolbar from '@/domains/communicator/components/Communicator/CommunicatorToolbar/CommunicatorToolbar';
import { UserData } from '@/types/app';
import { Board, Tile } from '@/types/board';

interface BoardMainToolbarProps {
  board: Board;
  isLocked?: boolean;
  isSelecting?: boolean;
  isSaving?: boolean;
  isSelectAll?: boolean;
  isLoggedIn: boolean;
  isFixedBoard?: boolean;
  disableBackButton?: boolean;
  shouldShowNavigationButtons: boolean;
  isNavigationButtonsOnTheSide: boolean;
  userData?: UserData;
  selectedTileIds?: string[];
  copiedTiles?: Tile[];
  onBoardTitleClick: () => void;
  onRequestPreviousBoard?: () => void;
  onLockClick?: () => void;
  onLockNotify?: () => void;
  onAddClick?: () => void;
  onDeleteClick?: () => void;
  onEditClick?: () => void;
  onSaveBoardClick?: () => void;
  onSelectAllToggle?: () => void;
  onSelectClick?: () => void;
  onBoardTypeChange?: () => void;
  onCopyTiles?: () => void;
  onPasteTiles?: () => void;
  publishBoard?: () => void;
  showNotification?: (message: string) => void;
}

export const BoardMainToolbar: React.FC<BoardMainToolbarProps> = ({
  board,
  isLocked,
  isSelecting,
  isSaving,
  isSelectAll,
  isLoggedIn,
  isFixedBoard,
  disableBackButton,
  shouldShowNavigationButtons,
  isNavigationButtonsOnTheSide,
  userData,
  selectedTileIds,
  copiedTiles,
  onBoardTitleClick,
  onRequestPreviousBoard,
  onLockClick,
  onLockNotify,
  onAddClick,
  onDeleteClick,
  onEditClick,
  onSaveBoardClick,
  onSelectAllToggle,
  onSelectClick,
  onBoardTypeChange,
  onCopyTiles,
  onPasteTiles,
  publishBoard,
  showNotification,
}) => (
  <div className="Board__main-toolbar">
    <Navbar
      className="Board__navbar"
      disabled={disableBackButton || isSelecting || isSaving}
      showBackButton={!disableBackButton && !shouldShowNavigationButtons}
      isLocked={isLocked}
      showLock={!isNavigationButtonsOnTheSide}
      onBackClick={onRequestPreviousBoard}
      onLockClick={onLockClick}
      onLockNotify={onLockNotify}
      board={board}
      userData={userData as any}
      showNotification={(showNotification || (() => {})) as any}
      publishBoard={publishBoard}
    />
    <CommunicatorToolbar
      className="Board__communicator-toolbar"
      isSelecting={isSelecting || isSaving}
    />
    <EditToolbar
      board={board}
      onBoardTitleClick={onBoardTitleClick}
      className="Board__edit-toolbar"
      isSelectAll={isSelectAll}
      isSelecting={isSelecting}
      isSaving={isSaving}
      isLoggedIn={isLoggedIn}
      onAddClick={onAddClick}
      isFixedBoard={isFixedBoard}
      onDeleteClick={onDeleteClick}
      onEditClick={onEditClick}
      onSaveBoardClick={onSaveBoardClick}
      onSelectAllToggle={onSelectAllToggle}
      onSelectClick={onSelectClick}
      selectedItemsCount={selectedTileIds?.length || 0}
      onBoardTypeChange={onBoardTypeChange}
      onCopyTiles={onCopyTiles}
      onPasteTiles={onPasteTiles}
      copiedTiles={copiedTiles}
    />
  </div>
);
