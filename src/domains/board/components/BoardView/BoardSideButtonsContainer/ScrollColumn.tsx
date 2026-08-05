import React from 'react';

import ScrollButtons from '../ScrollColumn/ScrollButtons';

import LockToggle from '@/domains/board/components/LockToggle/LockToggle';
import { Board } from '@/types/board';

interface ScrollColumnProps {
  shouldShowScrollButtons: boolean;
  isScroll: boolean;
  isSaving?: boolean;
  board: Board;
  fixedBoardContainerRef: React.RefObject<HTMLDivElement>;
  boardContainerRef: React.RefObject<HTMLDivElement>;
  totalRows: number;
  isNavigationButtonsOnTheSide: boolean;
  isLocked?: boolean;
  onLockNotify?: () => void;
  onLockClick?: () => void;
}

export const ScrollColumn: React.FC<ScrollColumnProps> = ({
  shouldShowScrollButtons,
  isScroll,
  isSaving,
  board,
  fixedBoardContainerRef,
  boardContainerRef,
  totalRows,
  isNavigationButtonsOnTheSide,
  isLocked,
  onLockNotify,
  onLockClick,
}) => {
  const scrollButtons = (
    <ScrollButtons
      active={shouldShowScrollButtons}
      isScroll={isScroll}
      isSaving={isSaving}
      boardContainer={
        board.isFixed ? fixedBoardContainerRef : boardContainerRef
      }
      totalRows={totalRows}
      boardId={board.id || ''}
      isNavigationButtonsOnTheSide={isNavigationButtonsOnTheSide}
    />
  );

  if (isNavigationButtonsOnTheSide) {
    return (
      <div className="BoardSide__scroll-col">
        <div className="BoardSide__lock" data-dwell="off">
          <LockToggle
            locked={isLocked}
            onLockTick={onLockNotify}
            onClick={onLockClick}
          />
        </div>
        {scrollButtons}
      </div>
    );
  }

  return scrollButtons;
};
