import React from 'react';
import { IntlShape } from 'react-intl';

import SharePhraseDialog from './components/SharePhraseDialog';
import ShareButton from '../SymbolOutput/ShareButton/ShareButton';
import './PhraseShare.css';

interface PhraseShareProps {
  label: string;
  phrase: string;
  intl: IntlShape;
  open?: boolean;
  fullScreen?: boolean;
  onShareClick: () => void;
  onShareClose?: () => void;
  onCopyPhrase?: (phrase: string) => void;
  style?: React.CSSProperties;
  hidden?: boolean;
  increaseOutputButtons?: boolean;
}

const PhraseShare: React.FC<PhraseShareProps> = ({
  label,
  phrase,
  intl,
  open = false,
  fullScreen,
  onShareClick,
  onShareClose = () => {},
  onCopyPhrase = () => {},
  style,
  hidden,
  increaseOutputButtons,
}) => {
  const sanitizePhrase = (text: string | undefined): string =>
    text ? text.replace(/["""]/g, '').trim() : '';

  const sanitizedPhrase = sanitizePhrase(phrase);
  const hasPhrase = !!sanitizedPhrase;

  const shareStyle: React.CSSProperties = {
    ...style,
    opacity: hasPhrase ? 1 : 0.4,
    pointerEvents: hasPhrase ? 'auto' : 'none',
  };

  return (
    <React.Fragment>
      <ShareButton
        label={label}
        color="inherit"
        onClick={hasPhrase ? onShareClick : undefined}
        style={shareStyle}
        hidden={hidden}
        className={
          increaseOutputButtons ? 'Output__button__lg' : 'Output__button__sm'
        }
      />
      <SharePhraseDialog
        open={open}
        fullScreen={fullScreen}
        phrase={sanitizedPhrase}
        intl={intl}
        onClose={onShareClose}
        onCopyPhrase={onCopyPhrase}
      />
    </React.Fragment>
  );
};

export default PhraseShare;
