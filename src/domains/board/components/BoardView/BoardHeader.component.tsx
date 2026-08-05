import React from 'react';
import { IntlShape } from 'react-intl';

import './Styles/BoardHeader.css';
import { EmptyVoiceAlert } from './BoardHeader/EmptyVoiceAlert';
import { OfflineVoiceAlert } from './BoardHeader/OfflineVoiceAlert';
import { PhraseOutputSection } from './BoardHeader/PhraseOutputSection';
import { useImprovePhrase } from './BoardHeader/PhraseOutputSection/hooks/useImprovePhrase';

import { useBoardsStore } from '@/domains/board/stores/boardsStore';

interface DisplaySettings {
  hideOutputActive?: boolean;
  [key: string]: unknown;
}

interface BoardHeaderProps {
  intl: IntlShape;
  displaySettings: DisplaySettings;
  emptyVoiceAlert?: boolean;
  offlineVoiceAlert?: boolean;
  improvedPhrase?: string;
  speak?: (text: string, language?: string) => void;
  onPhraseImproved?: (phrase: string) => void;
}

const BoardHeader: React.FC<BoardHeaderProps> = ({
  intl,
  displaySettings,
  emptyVoiceAlert,
  offlineVoiceAlert,
  improvedPhrase = '',
  speak = () => {},
  onPhraseImproved,
}) => {
  useImprovePhrase();

  const isScreenKeyboardMode = useBoardsStore(
    (state) => state.isScreenKeyboardMode,
  );

  const showOutputBar =
    !displaySettings.hideOutputActive && !isScreenKeyboardMode;

  return (
    <div className="BoardHeader">
      <PhraseOutputSection
        isScreenKeyboardMode={isScreenKeyboardMode}
        showOutputBar={showOutputBar}
        improvedPhrase={improvedPhrase}
        speak={speak}
        onPhraseImproved={onPhraseImproved}
      />
      <EmptyVoiceAlert show={emptyVoiceAlert} intl={intl} />
      <OfflineVoiceAlert show={offlineVoiceAlert} intl={intl} />
    </div>
  );
};

export default BoardHeader;
