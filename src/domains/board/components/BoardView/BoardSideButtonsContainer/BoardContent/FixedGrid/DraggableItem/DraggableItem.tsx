import classNames from 'classnames';
import React from 'react';
import { useDrag } from 'react-dnd';

import styles from './DraggableItem.module.css';

interface DraggableItemProps {
  className?: string;
  disabled?: boolean;
  id?: string;
  style?: React.CSSProperties;
  type?: string;
  children?: React.ReactNode;
}

const DraggableItem: React.FC<DraggableItemProps> = ({
  className,
  disabled = false,
  id,
  style,
  type,
  ...other
}) => {
  const [{ opacity }, drag] = useDrag({
    item: { id, type },
    canDrag: () => !disabled,
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    }),
  });

  const cellStyle = { ...style, opacity };
  const cellClassName = classNames(styles.root, className);

  return (
    <div {...other} className={cellClassName} style={cellStyle} ref={drag} />
  );
};

export default DraggableItem;
