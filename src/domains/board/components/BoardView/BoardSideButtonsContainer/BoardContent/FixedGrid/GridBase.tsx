import classNames from 'classnames';
import React from 'react';

import DraggableItem from './DraggableItem/DraggableItem';
import DroppableCell from './DroppableCell/DroppableCell';
import styles from './GridBase.module.css';
import Row from './Row/Row';
import * as utils from './utils';

import { Position } from '@/types/board';

interface GridItem {
  id?: string;
  [key: string]: unknown;
}

interface GridBaseProps {
  className?: string;
  columns: number;
  compactOrder?: boolean;
  dragAndDropEnabled?: boolean;
  items?: GridItem[];
  onItemDrop: (item: GridItem, position: Position) => void;
  order?: (string | null)[][];
  renderEmptyCell?: () => React.ReactNode;
  renderItem: (item: GridItem, index: number) => React.ReactNode;
  rows: number;
  page: number;
  [key: string]: unknown;
}

const GridBase: React.FC<GridBaseProps> = ({
  className,
  columns,
  compactOrder = false,
  dragAndDropEnabled = false,
  items = [],
  onItemDrop,
  order = [],
  renderEmptyCell,
  renderItem,
  rows,
  page,
  ...other
}) => {
  const gridClassName = classNames(styles.root, className);
  const grid = utils.sortGrid({
    columns,
    rows,
    order,
    items: items as any,
    compact: compactOrder,
  });
  let itemIndex = 0;

  return (
    <div className={gridClassName} {...other}>
      {grid.map((row, rowIndex) => (
        <Row key={rowIndex}>
          {row.map((item, columnIndex) => {
            const yPosition = page * rows + rowIndex;
            const idWithPosition = `${columnIndex}-${yPosition}`;
            return (
              <DroppableCell
                key={columnIndex}
                id={idWithPosition}
                accept={'grid-item'}
                onDrop={(droppedItem: GridItem) => {
                  const position = { row: rowIndex, column: columnIndex };
                  onItemDrop(droppedItem, position);
                }}
              >
                {item ? (
                  <DraggableItem
                    type={'grid-item'}
                    id={(item as any).id}
                    disabled={!dragAndDropEnabled}
                  >
                    {renderItem(item as any, itemIndex++)}
                  </DraggableItem>
                ) : (
                  renderEmptyCell && renderEmptyCell()
                )}
              </DroppableCell>
            );
          })}
        </Row>
      ))}
    </div>
  );
};

export default GridBase;
