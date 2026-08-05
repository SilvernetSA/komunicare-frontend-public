import React from 'react';
import { IntlShape } from 'react-intl';

import BoardContent from './BoardSideButtonsContainer/BoardContent.component';
import NavigationButtons from './BoardSideButtonsContainer/NavigationButtons';
import { ScrollColumn } from './BoardSideButtonsContainer/ScrollColumn';

import { DisplaySettings, NavigationSettings } from '@/types/app';
import { Board, Tile } from '@/types/board';

interface BoardSideButtonsContainerProps {
  board: Board;
  intl: IntlShape;
  caBackButtonActive: boolean;
  shouldShowNavigationButtons: boolean;
  shouldShowScrollButtons: boolean;
  isNavigationButtonsOnTheSide: boolean;
  hasBackHistory: boolean;
  hasRootHistory: boolean;
  isSelecting?: boolean;
  isSaving?: boolean;
  isFixedBoard?: boolean;
  isScroll: boolean;
  isLocked?: boolean;
  totalRows?: number;
  selectedTileIds?: string[];
  navHistory?: string[];
  displaySettings: DisplaySettings;
  navigationSettings?: NavigationSettings;
  canAccessToContent?: boolean;
  boardContainerRef: React.RefObject<HTMLDivElement>;
  fixedBoardContainerRef: React.RefObject<HTMLDivElement>;
  onRequestPreviousBoard?: () => void;
  onRequestToRootBoard?: () => void;
  onTileClick: (tile: Tile) => void;
  onTileFocus: (tileId: string) => void;
  onLayoutChange?: () => void;
  onTileDrop?: (
    item: { id: string; type: string },
    position: { x: number; y: number },
  ) => void;
  onAddRemoveRow?: () => void;
  onAddRemoveColumn?: () => void;
  setIsScroll?: (isScroll: boolean, totalRows?: number) => void;
  onBoardKeyUp: (event: React.KeyboardEvent) => void;
  onLockNotify?: () => void;
  onLockClick?: () => void;
}

export const BoardSideButtonsContainer: React.FC<
  BoardSideButtonsContainerProps
> = ({
  board,
  intl,
  caBackButtonActive,
  shouldShowNavigationButtons,
  shouldShowScrollButtons,
  isNavigationButtonsOnTheSide,
  hasBackHistory,
  hasRootHistory,
  isSelecting,
  isSaving,
  isFixedBoard,
  isScroll,
  isLocked,
  totalRows,
  selectedTileIds,
  navHistory,
  displaySettings,
  navigationSettings,
  canAccessToContent,
  boardContainerRef,
  fixedBoardContainerRef,
  onRequestPreviousBoard,
  onRequestToRootBoard,
  onTileClick,
  onTileFocus,
  onLayoutChange,
  onTileDrop,
  onAddRemoveRow,
  onAddRemoveColumn,
  setIsScroll,
  onBoardKeyUp,
  onLockNotify,
  onLockClick,
}) => (
  <div className="BoardSideButtonsContainer">
    {caBackButtonActive && (
      <NavigationButtons
        active={shouldShowNavigationButtons}
        navHistory={navHistory}
        previousBoard={onRequestPreviousBoard}
        toRootBoard={onRequestToRootBoard}
        isSaving={isSaving}
        isNavigationButtonsOnTheSide={isNavigationButtonsOnTheSide}
        hasBackHistory={hasBackHistory}
        hasRootHistory={hasRootHistory}
      />
    )}

    <BoardContent
      board={board}
      intl={intl}
      isSelecting={isSelecting}
      isSaving={isSaving}
      isFixedBoard={isFixedBoard}
      selectedTileIds={selectedTileIds}
      displaySettings={displaySettings}
      navigationSettings={navigationSettings}
      onTileClick={onTileClick}
      onTileFocus={onTileFocus}
      onLayoutChange={onLayoutChange}
      onTileDrop={onTileDrop as any}
      onAddRemoveRow={onAddRemoveRow}
      onAddRemoveColumn={onAddRemoveColumn}
      setIsScroll={setIsScroll}
      boardContainerRef={boardContainerRef}
      fixedBoardContainerRef={fixedBoardContainerRef}
      onBoardKeyUp={onBoardKeyUp}
      canAccessToContent={canAccessToContent}
    />

    <ScrollColumn
      shouldShowScrollButtons={shouldShowScrollButtons}
      isScroll={isScroll}
      isSaving={isSaving}
      board={board}
      fixedBoardContainerRef={fixedBoardContainerRef}
      boardContainerRef={boardContainerRef}
      totalRows={totalRows || 6}
      isNavigationButtonsOnTheSide={isNavigationButtonsOnTheSide}
      isLocked={isLocked}
      onLockNotify={onLockNotify}
      onLockClick={onLockClick}
    />

  </div>
);
