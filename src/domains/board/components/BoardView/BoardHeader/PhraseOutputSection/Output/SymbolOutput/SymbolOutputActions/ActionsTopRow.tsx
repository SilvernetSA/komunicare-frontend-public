import KeyboardAltOutlinedIcon from '@mui/icons-material/KeyboardAltOutlined';
import { IconButton as MUIIconButton, Tooltip } from '@mui/material';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import messages from '../../../../../../Messages/Board.messages';
import PhraseShare from '../PhraseShare.component';

import { NavigationSettings } from '@/types/app';

interface ActionsTopRowProps {
  navigationSettings: NavigationSettings;
  isScreenKeyboardMode?: boolean;
  increaseOutputButtons?: boolean;
  phrase: string;
  onSwitchScreenKeyboard: () => void;
  onCopyClick: (phrase: string) => void;
}

export const ActionsTopRow: React.FC<ActionsTopRowProps> = ({
  navigationSettings,
  isScreenKeyboardMode,
  increaseOutputButtons,
  phrase,
  onSwitchScreenKeyboard,
  onCopyClick,
}) => {
  const intl = useIntl();
  const [openPhraseShareDialog, setOpenPhraseShareDialog] = useState(false);

  return (
    <div className="SymbolOutput__actions__row SymbolOutput__actions__row--top">
      {navigationSettings.liveMode && (
        <Tooltip
          title={intl.formatMessage(messages.screenKeyboard)}
          placement="left"
        >
          <MUIIconButton
            className={`ScreenKeyboard__toggle ${
              increaseOutputButtons
                ? 'Output__button__lg'
                : 'Output__button__sm'
            }`}
            color={isScreenKeyboardMode ? 'primary' : 'inherit'}
            size="large"
            aria-pressed={!!isScreenKeyboardMode}
            aria-label={intl.formatMessage(messages.screenKeyboard)}
            onClick={onSwitchScreenKeyboard}
          >
            <KeyboardAltOutlinedIcon
              className={
                increaseOutputButtons ? 'Output__icon__lg' : 'Output__icon__sm'
              }
            />
          </MUIIconButton>
        </Tooltip>
      )}

      <PhraseShare
        label={intl.formatMessage(messages.share)}
        intl={intl}
        onShareClick={() => setOpenPhraseShareDialog(true)}
        onShareClose={() => setOpenPhraseShareDialog(false)}
        onCopyPhrase={onCopyClick}
        open={openPhraseShareDialog}
        phrase={phrase}
        increaseOutputButtons={increaseOutputButtons}
      />
    </div>
  );
};
