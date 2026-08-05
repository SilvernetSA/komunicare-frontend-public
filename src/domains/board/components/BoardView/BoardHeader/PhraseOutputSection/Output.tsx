import React from 'react';
import { useIntl } from 'react-intl';

import { useOutputController } from './useOutputController';

import { useAppStore } from '@/domains/app/stores/appStore';
import SymbolOutput from '@/domains/board/components/BoardView/BoardHeader/PhraseOutputSection/Output/SymbolOutput';
import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import { useNotificationStore } from '@/domains/notifications/stores/notificationStore';

interface OutputContainerProps {
  improvedPhrase?: string;
}

const Output: React.FC<OutputContainerProps> = ({ improvedPhrase }) => {
  const intl = useIntl();
  const output = useBoardsStore((state) => state.output);
  const isLiveMode = useBoardsStore((state) => state.isLiveMode);
  const isScreenKeyboardMode = useBoardsStore(
    (state) => state.isScreenKeyboardMode,
  );
  const navigationSettings = useAppStore((state) => state.navigationSettings);
  const increaseOutputButtons = useAppStore(
    (state) => state.displaySettings.increaseOutputButtons,
  );
  const changeOutput = useBoardsStore((state) => state.changeOutput);
  const changeScreenKeyboardMode = useBoardsStore(
    (state) => state.changeScreenKeyboardMode,
  );
  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  const {
    translatedOutput,
    isPlaying,
    tabIndex,
    phrase,
    handleBackspaceClick,
    handleClearClick,
    handleCopyClick,
    handleRemoveClick,
    handleStopOutputClick,
    handlePlayOutputClick,
    handleOutputKeyDown,
    handleSwitchScreenKeyboard,
    handleWriteSymbol,
  } = useOutputController({
    improvedPhrase,
    intl,
    output,
    isLiveMode,
    isScreenKeyboardMode,
    navigationSettings,
    changeOutput,
    changeScreenKeyboardMode,
    showNotification,
  });

  return (
    <SymbolOutput
      playOutput={handlePlayOutputClick}
      stopOutput={handleStopOutputClick}
      isPlaying={isPlaying}
      onBackspaceClick={handleBackspaceClick}
      onClearClick={handleClearClick}
      onCopyClick={handleCopyClick}
      onRemoveClick={handleRemoveClick}
      onKeyDown={handleOutputKeyDown}
      onSwitchScreenKeyboard={handleSwitchScreenKeyboard}
      symbols={translatedOutput}
      isScreenKeyboardMode={isScreenKeyboardMode}
      tabIndex={tabIndex}
      navigationSettings={navigationSettings}
      increaseOutputButtons={increaseOutputButtons}
      phrase={phrase}
      onWriteSymbol={handleWriteSymbol}
    />
  );
};

export default Output;
