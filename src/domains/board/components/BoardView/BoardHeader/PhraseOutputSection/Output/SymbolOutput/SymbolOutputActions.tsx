import React from 'react';

import { ActionsBottomRow } from './SymbolOutputActions/ActionsBottomRow';
import { ActionsTopRow } from './SymbolOutputActions/ActionsTopRow';

import { NavigationSettings } from '@/types/app';

interface SymbolOutputActionsProps {
  navigationSettings: NavigationSettings;
  isScreenKeyboardMode?: boolean;
  increaseOutputButtons?: boolean;
  phrase: string;
  isPlaying: boolean;
  hideSpeechButton?: boolean;
  hasContent: boolean;
  onSpeechActionClick: (event: React.MouseEvent) => void;
  onSwitchScreenKeyboard: () => void;
  onCopyClick: (phrase: string) => void;
  onBackspaceClick: () => void;
  onClearClick: () => void;
}

export const SymbolOutputActions: React.FC<SymbolOutputActionsProps> = ({
  navigationSettings,
  isScreenKeyboardMode,
  increaseOutputButtons,
  phrase,
  isPlaying,
  hideSpeechButton,
  hasContent,
  onSpeechActionClick,
  onSwitchScreenKeyboard,
  onCopyClick,
  onBackspaceClick,
  onClearClick,
}) => (
  <div
    className={`SymbolOutput__actions${
      increaseOutputButtons ? ' SymbolOutput__actions--lg' : ''
    }`}
  >
    <ActionsTopRow
      navigationSettings={navigationSettings}
      isScreenKeyboardMode={isScreenKeyboardMode}
      increaseOutputButtons={increaseOutputButtons}
      phrase={phrase}
      onSwitchScreenKeyboard={onSwitchScreenKeyboard}
      onCopyClick={onCopyClick}
    />
    <ActionsBottomRow
      navigationSettings={navigationSettings}
      isPlaying={isPlaying}
      hideSpeechButton={hideSpeechButton}
      hasContent={hasContent}
      increaseOutputButtons={increaseOutputButtons}
      onSpeechActionClick={onSpeechActionClick}
      onBackspaceClick={onBackspaceClick}
      onClearClick={onClearClick}
    />
  </div>
);
