import { Typography } from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import { LABEL_POSITION_BELOW } from '../../Settings/Display/Display.constants';
import './Symbol.css';

interface SymbolProps {
  /**
   * Image to display
   */
  image?: string;
  /**
   * Label to display
   */
  label: string | React.ReactNode;
  /**
   * Position of the label
   */
  labelpos?: string;
  /**
   * Type of symbol
   */
  type?: string;
  /**
   * Key path for legacy symbol images
   */
  keyPath?: string;
  /**
   * Additional class name
   */
  className?: string;
  /**
   * Additional props
   */
  [key: string]: unknown;
}

const Symbol: React.FC<SymbolProps> = ({
  className,
  label,
  labelpos = LABEL_POSITION_BELOW,
  keyPath: _keyPath,
  image,
  ...other
}) => {
  const symbolClassName = classNames('Symbol', className);

  return (
    <div className={symbolClassName} {...other}>
      {labelpos === 'Above' && (
        <Typography className="Symbol__label">{label}</Typography>
      )}
      {image && (
        <div className="Symbol__image-container">
          <img
            className="Symbol__image"
            src={image}
            alt=""
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      {labelpos === 'Below' && (
        <Typography className="Symbol__label">{label}</Typography>
      )}
    </div>
  );
};

export default Symbol;
