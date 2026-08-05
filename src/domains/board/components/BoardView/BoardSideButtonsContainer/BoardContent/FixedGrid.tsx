import classNames from 'classnames';
import React, { useEffect, useState } from 'react';

import styles from './FixedGrid.module.css';

import GridBase from '@/domains/board/components/BoardView/BoardSideButtonsContainer/BoardContent/FixedGrid/GridBase';
import { Position } from '@/types/board';

interface GridItem {
  id?: string;
  [key: string]: any;
}

interface FixedGridProps {
  order?: (string | null)[][];
  items?: GridItem[];
  columns: number;
  rows: number;
  compactOrder?: boolean;
  dragAndDropEnabled?: boolean;
  renderItem: (item: GridItem, index: number) => React.ReactNode;
  onItemDrop?: (item: any, position: Position) => void;
  fixedRef?: React.RefObject<HTMLDivElement>;
  setIsScroll?: (isScroll: boolean, totalRows?: number) => void;
  isBigScrollBtns?: boolean;
  isNavigationButtonsOnTheSide?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const focusPosition = {
  x: 0,
  y: 0,
};

const FixedGrid: React.FC<FixedGridProps> = ({
  order = [],
  items = [],
  columns,
  rows,
  compactOrder = false,
  dragAndDropEnabled = false,
  renderItem,
  onItemDrop,
  fixedRef,
  setIsScroll,
  isBigScrollBtns = false,
  isNavigationButtonsOnTheSide = false,
  className,
  style,
}) => {
  const [pages, setPages] = useState<GridItem[][]>([items]);

  useEffect(() => {
    // Keep a single visual page so the rendered row count matches the selected
    // board grid rows. Extra items are handled by grid ordering logic.
    setPages([items]);
  }, [items]);

  const gridClassName = classNames(styles.grid, className);

  const findPressedArrow = (event: KeyboardEvent) => {
    const code = event.code;
    const right = code === 'ArrowRight';
    const left = code === 'ArrowLeft';
    const up = code === 'ArrowUp';
    const down = code === 'ArrowDown';

    if (!(right || left || up || down)) return null;
    event.preventDefault();
    if (event.repeat) return null;
    return { right, left, up, down };
  };

  const setFocusPositionFromFocusedButton = (buttonElement: Element | null) => {
    const setFocusPositionFromId = (id: string) => {
      const divider = '-';
      const positionArrayXY = id.split(divider);
      const xPosition = parseInt(positionArrayXY[0]);
      const yPosition = parseInt(positionArrayXY[1]);
      focusPosition.x = xPosition;
      focusPosition.y = yPosition;
    };
    if (buttonElement) {
      const activeDraggableItem = buttonElement.parentNode;
      const activeDroppableCellId =
        activeDraggableItem?.parentNode &&
        'id' in activeDraggableItem.parentNode
          ? (activeDraggableItem.parentNode as unknown as Element).id
          : undefined;
      if (activeDroppableCellId) setFocusPositionFromId(activeDroppableCellId);
    }
  };

  const handleOnKeyDown = (event: React.KeyboardEvent) => {
    const keycode = event.code;

    const manageArrows = (event: any) => {
      const setFocusPosition = (pressedArrow: any) => {
        const totalRows = pages.length * rows;
        const { right, left, up, down } = pressedArrow;
        const rightLimit = focusPosition.x >= columns - 1;
        const leftLimit = focusPosition.x <= 0;
        const topLimit = focusPosition.y <= 0;
        const bottomLimit = focusPosition.y >= totalRows - 1;

        if (right) {
          if (rightLimit) {
            focusPosition.x = 0;
            return;
          }
          focusPosition.x = focusPosition.x + 1;
          return;
        }
        if (left) {
          if (leftLimit) {
            focusPosition.x = columns - 1;
            return;
          }
          focusPosition.x = focusPosition.x - 1;
          return;
        }
        if (up) {
          if (topLimit) {
            focusPosition.y = totalRows - 1;
            return;
          }
          focusPosition.y = focusPosition.y - 1;
          return;
        }
        if (down) {
          if (bottomLimit) {
            focusPosition.y = 0;
            return;
          }
          focusPosition.y = focusPosition.y + 1;
          return;
        }
      };

      const pressedArrow = findPressedArrow(event);
      if (!pressedArrow) return;
      setFocusPosition(pressedArrow);

      const currentId = `${focusPosition.x}-${focusPosition.y}`;
      const currentTile = document.getElementById(currentId);

      if (currentTile) {
        const isAvailableTile = () => {
          if (currentTile?.firstChild) {
            const button = (
              currentTile.firstChild as unknown as HTMLElement
            ).querySelector('button');
            if (button) {
              button.focus();
              return true;
            }
          }
          return false;
        };

        if (isAvailableTile()) return;
      }
      manageArrows({
        code: keycode,
        preventDefault: event.preventDefault,
        repeat: false,
      });
    };

    const manageTabs = () => {
      const tabIsPressed = () => {
        const tab = keycode === 'Tab';
        if (tab) return true;
        return false;
      };
      if (tabIsPressed()) {
        const awaitTabSetNewFocus = () => {
          const refreshFocusPosition = () => {
            const activeButtonElement = document.activeElement;
            setFocusPositionFromFocusedButton(activeButtonElement);
          };
          setTimeout(refreshFocusPosition, 0);
        };
        awaitTabSetNewFocus();
      }
    };

    manageArrows(event);
    manageTabs();
  };

  useEffect(() => {
    const manageKeyDown = (event: KeyboardEvent) => {
      if (findPressedArrow(event)) {
        const focusIsNotOnTile = () => {
          const activeElement = document.activeElement;
          const activeElementChildsArray = Array.from(
            activeElement?.childNodes || [],
          );
          if (
            activeElementChildsArray.find(
              (element) =>
                (element as unknown as HTMLElement).className === 'Symbol',
            )
          )
            return false;
          return true;
        };

        if (focusIsNotOnTile()) {
          const focusFirstTile = () => {
            const firstTile = document.getElementsByClassName('Tile')[0];
            if (!firstTile) return;
            (firstTile as HTMLElement).focus();
            setFocusPositionFromFocusedButton(firstTile);
          };

          focusFirstTile();
        }
      }
    };

    window.addEventListener('keydown', manageKeyDown);

    return () => {
      window.removeEventListener('keydown', manageKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!isBigScrollBtns || !setIsScroll) {
      return;
    }

    const evaluateScroll = () => {
      const container = fixedRef?.current;
      if (!container) {
        setIsScroll(false, rows);
        return;
      }

      const hasVerticalScroll =
        Math.ceil(container.scrollHeight - container.clientHeight) > 1;
      setIsScroll(hasVerticalScroll, rows);
    };

    // Wait for layout to settle before measuring scrollability.
    const timer = window.setTimeout(evaluateScroll, 0);
    window.addEventListener('resize', evaluateScroll);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', evaluateScroll);
    };
  }, [items, rows, isBigScrollBtns, setIsScroll, fixedRef, columns, order]);

  // order ya viene en el formato correcto (string | null)[][]
  const orderMatrix = order || [];

  return (
    <div
      className={classNames(styles.root, {
        FixedGridScrollButtonsOnTheSides:
          isNavigationButtonsOnTheSide && isBigScrollBtns,
      })}
      style={
        {
          ...style,
          // Rows split the visible height evenly (consumed in Row.module.css).
          '--fixed-grid-rows': rows,
        } as React.CSSProperties
      }
      onKeyDown={handleOnKeyDown}
      ref={fixedRef}
    >
      {pages.length > 0 ? (
        pages.map((pageItems, i) => (
          <GridBase
            className={gridClassName}
            columns={columns}
            compactOrder={compactOrder}
            rows={rows}
            dragAndDropEnabled={dragAndDropEnabled}
            items={pageItems}
            onItemDrop={onItemDrop || (() => {})}
            order={orderMatrix}
            renderItem={renderItem}
            page={i}
            key={i}
          />
        ))
      ) : (
        <GridBase
          className={gridClassName}
          columns={columns}
          rows={rows}
          dragAndDropEnabled={dragAndDropEnabled}
          items={[]}
          onItemDrop={onItemDrop || (() => {})}
          order={orderMatrix}
          renderItem={renderItem}
          page={0}
        />
      )}
    </div>
  );
};

export default FixedGrid;
