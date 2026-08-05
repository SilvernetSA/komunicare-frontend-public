import React from 'react';
import { IntlShape } from 'react-intl';

import SharePhraseDialog from './PhraseShare/SharePhraseDialog';

import ShareButton from '@/domains/board/components/BoardView/BoardHeader/PhraseOutputSection/Output/SymbolOutput/ShareButton';
import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import './PhraseShare/Styles/PhraseShare.css';

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
  const improvedPhrase = useBoardsStore((state) => state.improvedPhrase);

  const sanitizePhrase = (text: string | undefined): string =>
    text ? text.replace(/["""]/g, '') : '';

  const phrase = sanitizePhrase(improvedPhrase);
  const hasPhrase = !!phrase;

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
        phrase={phrase}
        intl={intl}
        onClose={onShareClose}
        onCopyPhrase={onCopyPhrase}
      />
    </React.Fragment>
  );
};

export default PhraseShare;
