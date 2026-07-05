import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import React, { useEffect, useRef, useState } from 'react';

import '../NavigationButtons/NavigationButtons.css';

const BOTTOM_OFFSET = 7;
const TOP_OFFSET = 5;

interface ScrollButtonsProps {
  active?: boolean;
  isSaving?: boolean;
  boardContainer: React.RefObject<HTMLElement>;
  totalRows?: number;
  boardId?: string;
  isScroll?: boolean;
  isNavigationButtonsOnTheSide?: boolean;
}

const ScrollButtons: React.FC<ScrollButtonsProps> = ({
  active,
  isSaving: _isSaving,
  boardContainer,
  totalRows,
  boardId,
  isScroll: _isScroll,
  isNavigationButtonsOnTheSide,
}) => {
  // true  = at the top   → UP button disabled
  // false = not at top   → UP button enabled
  const [isAtTop, setAtTop] = useState(true);
  // true  = at the bottom → DOWN button disabled
  // false = not at bottom → DOWN button enabled
  const [isAtBottom, setAtBottom] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const bc = boardContainer.current;
    if (!bc) return;

    const checkScrollLimits = () => {
      setAtTop(bc.scrollTop <= TOP_OFFSET);
      setAtBottom(
        Math.round(bc.scrollHeight - bc.scrollTop - bc.clientHeight) <=
          BOTTOM_OFFSET,
      );
    };

    // Defer check to after the current paint so react-grid-layout has time
    // to render tiles and the DOM has the correct scrollHeight.
    const scheduleCheck = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(checkScrollLimits);
      });
    };

    // Re-check whenever the scrollable content changes size (tiles load/resize).
    const resizeObserver = new ResizeObserver(scheduleCheck);
    const content = bc.firstElementChild;
    if (content) resizeObserver.observe(content as Element);
    resizeObserver.observe(bc);

    scheduleCheck();
    bc.addEventListener('scroll', checkScrollLimits, { passive: true });

    return () => {
      bc.removeEventListener('scroll', checkScrollLimits);
      resizeObserver.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [boardId, boardContainer, totalRows]);

  const scroll = (stepValue: number) => {
    const bc = boardContainer.current;
    if (bc) {
      bc.scrollBy({ top: stepValue, behavior: 'smooth' });
    }
  };

  if (!active) {
    return null;
  }

  const classScrollUp = isNavigationButtonsOnTheSide
    ? `SideNavigationButton SideButtonScrollUp ${isAtTop ? 'disable' : ''}`
    : `NavigationButton top`;

  const classScrollDown = isNavigationButtonsOnTheSide
    ? `SideNavigationButton SideButtonScrollDown ${isAtBottom ? 'disable' : ''}`
    : 'NavigationButton bottom';

  return (
    <div
      className={
        isNavigationButtonsOnTheSide
          ? `SideNavigationButtonsContainer ScrollButtons`
          : ''
      }
    >
      {(!isAtTop || isNavigationButtonsOnTheSide) && (
        <div className={classScrollUp}>
          <button onClick={() => scroll(-100)}>
            <KeyboardArrowUpIcon />
          </button>
        </div>
      )}
      {(!isAtBottom || isNavigationButtonsOnTheSide) && (
        <div className={classScrollDown}>
          <button onClick={() => scroll(100)}>
            <KeyboardArrowDownIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default ScrollButtons;
