import React from 'react';

import ImprovePhraseOutput from './PhraseOutputSection/ImprovePhraseOutput';

import OutputContainer from '@/domains/board/components/BoardView/BoardHeader/PhraseOutputSection/Output';

interface PhraseOutputSectionProps {
  isScreenKeyboardMode: boolean;
  showOutputBar: boolean;
  improvedPhrase: string;
  speak: (text: string, language?: string) => void;
  onPhraseImproved?: (phrase: string) => void;
}

export const PhraseOutputSection: React.FC<PhraseOutputSectionProps> = ({
  isScreenKeyboardMode,
  showOutputBar,
  improvedPhrase,
  speak,
  onPhraseImproved,
}) => {
  if (isScreenKeyboardMode) {
    return (
      <ImprovePhraseOutput
        improvedPhrase={improvedPhrase}
        speak={speak}
        onPhraseImproved={onPhraseImproved}
      />
    );
  }

  return (
    <div className="BoardHeader__inputs">
      <div className="BoardHeader__lines">
        <ImprovePhraseOutput
          improvedPhrase={improvedPhrase}
          speak={speak}
          onPhraseImproved={onPhraseImproved}
          hidePlayIcon
        />
        {showOutputBar && (
          <div className="Board__output">
            <OutputContainer improvedPhrase={improvedPhrase} />
          </div>
        )}
      </div>
    </div>
  );
};
