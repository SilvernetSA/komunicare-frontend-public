import classNames from 'classnames';
import React from 'react';
import { IntlShape } from 'react-intl';

import { LiveInput } from './Symbol/LiveInput';
import { SymbolImage } from './Symbol/SymbolImage';
import { SymbolLabelAbove } from './Symbol/SymbolLabelAbove';
import { SymbolLabelBelow } from './Symbol/SymbolLabelBelow';

import { LABEL_POSITION_BELOW } from '@/domains/settings/components/Settings/Display/Display.constants';

import './Symbol.css';

interface SymbolProps {
  /** Image to display */
  image?: string;
  /** Label to display */
  label: string | React.ReactNode;
  /** Position of the label */
  labelpos?: string;
  /** Type of symbol */
  type?: 'live' | string;
  /** Function to handle writing in live mode */
  onWrite?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /**
   * Avoid opening the OS on-screen keyboard while the app's own
   * Screen Keyboard is the input method (mobile/Capacitor)
   */
  suppressNativeKeyboard?: boolean;
  /** Internationalization object */
  intl?: IntlShape;
  /** Key path for legacy symbol images */
  keyPath?: string;
  /** Additional class name */
  className?: string;
  /** Additional props */
  [key: string]: unknown;
}

const Symbol: React.FC<SymbolProps> = ({
  className,
  label,
  labelpos = LABEL_POSITION_BELOW,
  keyPath: _keyPath,
  type,
  onWrite,
  suppressNativeKeyboard,
  intl,
  image,
  ...other
}) => {
  const symbolClassName = classNames('Symbol', className);

  return (
    <div className={symbolClassName} {...other}>
      <LiveInput
        type={type}
        label={label}
        intl={intl}
        suppressNativeKeyboard={suppressNativeKeyboard}
        onWrite={onWrite}
      />
      <SymbolLabelAbove type={type} labelpos={labelpos} label={label} />
      <SymbolImage image={image} />
      <SymbolLabelBelow type={type} labelpos={labelpos} label={label} />
    </div>
  );
};

export default Symbol;
