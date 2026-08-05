import React from 'react';
import { IntlShape } from 'react-intl';

import { SymbolOutputActions } from './SymbolOutput/SymbolOutputActions';
import { SymbolOutputScroll } from './SymbolOutput/SymbolOutputScroll';
import './Styles/SymbolOutput.css';

import { NavigationSettings } from '@/types/app';

interface SymbolItem {
  image?: string;
  label: string | React.ReactNode;
  type?: 'live' | string;
  [key: string]: unknown;
}

interface SymbolOutputProps {
  symbols: SymbolItem[];
  playOutput: () => void;
  stopOutput: () => void;
  isPlaying: boolean;
  onBackspaceClick: () => void;
  onClearClick: () => void;
  onCopyClick: (phrase: string) => void;
  onRemoveClick: (index: number) => (event: React.MouseEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onSwitchScreenKeyboard: () => void;
  onWriteSymbol: (
    index: number,
  ) => (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  navigationSettings: NavigationSettings;
  phrase: string;
  isScreenKeyboardMode?: boolean;
  hideSpeechButton?: boolean;
  increaseOutputButtons?: boolean;
  tabIndex?: string;
  intl?: IntlShape; // kept for backwards-compat; components call useIntl() internally
}

const SymbolOutput: React.FC<SymbolOutputProps> = ({
  symbols = [],
  playOutput,
  stopOutput,
  isPlaying,
  onBackspaceClick,
  onClearClick,
  onCopyClick,
  onRemoveClick,
  onSwitchScreenKeyboard,
  onWriteSymbol,
  navigationSettings,
  phrase,
  isScreenKeyboardMode,
  hideSpeechButton,
  increaseOutputButtons,
}) => {
  const onSpeechActionClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!isPlaying) playOutput();
    if (isPlaying) stopOutput();
  };

  const hasContent = symbols.length > 0;

  return (
    <div className="SymbolOutput">
      <SymbolOutputScroll
        symbols={symbols}
        navigationSettings={navigationSettings}
        onWriteSymbol={onWriteSymbol}
        onRemoveClick={onRemoveClick}
        isScreenKeyboardMode={isScreenKeyboardMode}
      />
      <SymbolOutputActions
        navigationSettings={navigationSettings}
        isScreenKeyboardMode={isScreenKeyboardMode}
        increaseOutputButtons={increaseOutputButtons}
        phrase={phrase}
        isPlaying={isPlaying}
        hideSpeechButton={hideSpeechButton}
        hasContent={hasContent}
        onSpeechActionClick={onSpeechActionClick}
        onSwitchScreenKeyboard={onSwitchScreenKeyboard}
        onCopyClick={onCopyClick}
        onBackspaceClick={onBackspaceClick}
        onClearClick={onClearClick}
      />
    </div>
  );
};

export default SymbolOutput;
