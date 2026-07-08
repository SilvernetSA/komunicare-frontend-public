import { Typography } from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import classNames from 'classnames';
import React from 'react';
import { IntlShape } from 'react-intl';

import { LABEL_POSITION_BELOW } from '../../Settings/Display/Display.constants';
import messages from '../Board.messages';
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
  type?: 'live' | string;
  /**
   * Function to handle writing in live mode
   */
  onWrite?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /**
   * Internationalization object
   */
  intl?: IntlShape;
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
  type,
  onWrite,
  intl,
  image,
  ...other
}) => {
  const symbolClassName = classNames('Symbol', className);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      return;
    }
  };

  return (
    <div className={symbolClassName} {...other}>
      {type === 'live' && intl && (
        <OutlinedInput
          id="outlined-live-input"
          margin="none"
          color="primary"
          placeholder={intl.formatMessage(messages.writeAndSay)}
          autoFocus={true}
          multiline
          rows={5}
          value={label as string}
          onChange={onWrite}
          fullWidth={true}
          onKeyPress={handleKeyPress}
          style={{
            padding: '0.5em 0.8em 0.5em 0.8em',
            height: '100%',
          }}
          className={'liveInput'}
        />
      )}
      {type !== 'live' && labelpos === 'Above' && (
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
      {type !== 'live' && labelpos === 'Below' && (
        <Typography className="Symbol__label">{label}</Typography>
      )}
    </div>
  );
};

export default Symbol;
