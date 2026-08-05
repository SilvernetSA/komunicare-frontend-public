import { Tooltip } from '@mui/material';
import React from 'react';
import { useIntl } from 'react-intl';

import BackspaceButton from './ActionsBottomRow/BackspaceButton';
import ClearButton from './ActionsBottomRow/ClearButton';
import SpeechButton from './ActionsBottomRow/SpeechButton';
import messages from '../../../../../../Messages/Board.messages';

import { NavigationSettings } from '@/types/app';

interface ActionsBottomRowProps {
  navigationSettings: NavigationSettings;
  isPlaying: boolean;
  hideSpeechButton?: boolean;
  hasContent: boolean;
  increaseOutputButtons?: boolean;
  onSpeechActionClick: (event: React.MouseEvent) => void;
  onBackspaceClick: () => void;
  onClearClick: () => void;
}

export const ActionsBottomRow: React.FC<ActionsBottomRowProps> = ({
  navigationSettings,
  isPlaying,
  hideSpeechButton,
  hasContent,
  increaseOutputButtons,
  onSpeechActionClick,
  onBackspaceClick,
  onClearClick,
}) => {
  const intl = useIntl();

  return (
    <div className="SymbolOutput__actions__row">
      {!hideSpeechButton && (
        <Tooltip
          title={intl.formatMessage(
            isPlaying ? messages.outputStopSpeech : messages.outputPlaySpeech,
          )}
          placement="left"
        >
          <span className="SymbolOutput__play">
            <SpeechButton
              color="inherit"
              onClick={onSpeechActionClick}
              isPlaying={isPlaying}
              disabled={!hasContent}
              increaseOutputButtons={increaseOutputButtons}
            />
          </span>
        </Tooltip>
      )}

      {!navigationSettings.removeOutputActive && (
        <BackspaceButton
          onClick={onBackspaceClick}
          disabled={!hasContent}
          increaseOutputButtons={increaseOutputButtons}
        />
      )}

      <Tooltip
        title={intl.formatMessage(messages.outputCleanSpeech)}
        placement="left"
      >
        <span>
          <ClearButton
            color="inherit"
            onClick={onClearClick}
            disabled={!hasContent}
            increaseOutputButtons={increaseOutputButtons}
          />
        </span>
      </Tooltip>
    </div>
  );
};
