import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import classNames from 'classnames';
import React from 'react';
// @ts-ignore

import './Tile.css';

interface TileProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'style' | 'onMouseDown' | 'onMouseUp' | 'onTouchEnd'
> {
  backgroundColor?: string;
  borderColor?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'button' | 'folder' | 'board';
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
  onTouchEnd?: React.TouchEventHandler<HTMLDivElement>;
}

const Tile = React.forwardRef<HTMLDivElement, TileProps>(
  (
    {
      backgroundColor,
      borderColor,
      children,
      className: containerClassName,
      style: containerStyle,
      variant,
      onMouseDown,
      onMouseUp,
      onTouchEnd,
      ...buttonProps
    },
    ref,
  ) => {
    const folder = variant === 'folder';
    const buttonClassName = classNames('Tile', {
      'Tile--folder': folder,
    });

    const tileShapeClassName = classNames('TileShape', {
      'TileShape--folder': folder,
    });

    const tileShapeStyles: React.CSSProperties = {};

    if (borderColor) {
      tileShapeStyles.borderColor = borderColor;
    }

    if (backgroundColor) {
      tileShapeStyles.backgroundColor = backgroundColor;
    }

    return (
      <div
        ref={ref}
        className={containerClassName}
        style={{
          width: '100%',
          height: '100%',
          ...containerStyle,
        }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
      >
        <button
          className={buttonClassName}
          type="button"
          data-dwell="on"
          {...buttonProps}
        >
          <div className={tileShapeClassName} style={tileShapeStyles} />
          {folder && (
            <span className="Tile__folderBadge" aria-hidden="true">
              <FolderRoundedIcon />
            </span>
          )}
          {children}
        </button>
      </div>
    );
  },
);

Tile.displayName = 'Tile';

export default Tile;
