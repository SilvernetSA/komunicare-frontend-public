import { Typography } from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { IntlShape } from 'react-intl';

import { arasaacDB } from '../../../idb/arasaac/arasaacdb';
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
   * Key path for Arasaac image
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
  keyPath,
  type,
  onWrite,
  intl,
  image,
  ...other
}) => {
  const [src, setSrc] = useState<string>('');
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function getSrc() {
      if (keyPath) {
        try {
          const imageData = await arasaacDB.getImageById(keyPath);
          if (imageData && !cancelled) {
            // Revoke the previous ObjectURL to avoid memory leaks.
            if (objectUrlRef.current) {
              URL.revokeObjectURL(objectUrlRef.current);
            }
            const blob = new Blob([imageData.data], { type: imageData.type });
            const url = URL.createObjectURL(blob);
            objectUrlRef.current = url;
            setSrc(url);
            return;
          }
        } catch (error) {
          console.warn('Error loading image from Arasaac DB:', error);
        }
      }

      if (!cancelled) {
        if (image) {
          setSrc(image);
        } else {
          setSrc('');
        }
      }
    }

    getSrc();

    return () => {
      cancelled = true;
    };
  }, [keyPath, image]);

  // Revoke the ObjectURL when the component unmounts.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const symbolClassName = classNames('Symbol', className);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // prevent new line in next textArea
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
      {(src || image) && (
        <div className="Symbol__image-container">
          <img
            className="Symbol__image"
            src={src || image}
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
