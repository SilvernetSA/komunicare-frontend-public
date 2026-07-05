import React from 'react';
import classNames from 'classnames';
import { useDrop } from 'react-dnd';

import styles from './DroppableCell.module.css';

interface DroppableCellProps {
  accept: string;
  className?: string;
  id?: string;
  onDrop: (
    item: Record<string, unknown>,
    monitor: Record<string, unknown>,
  ) => void;
  children?: React.ReactNode;
}

const DroppableCell: React.FC<DroppableCellProps> = ({
  accept,
  className,
  onDrop,
  ...other
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept,
    drop: onDrop as any,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;

  const cellClassName = classNames(styles.root, className, {
    [styles.isActive]: isActive,
  });

  return <div {...other} className={cellClassName} ref={drop} />;
};

export default DroppableCell;
