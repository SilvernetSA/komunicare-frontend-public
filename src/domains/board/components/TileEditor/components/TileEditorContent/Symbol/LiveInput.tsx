import OutlinedInput from '@mui/material/OutlinedInput';
import React from 'react';
import { IntlShape } from 'react-intl';

import messages from '@/domains/board/messages/Board.messages';

interface LiveInputProps {
  type?: 'live' | string;
  label: string | React.ReactNode;
  intl?: IntlShape;
  suppressNativeKeyboard?: boolean;
  onWrite?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const LiveInput: React.FC<LiveInputProps> = ({
  type,
  label,
  intl,
  suppressNativeKeyboard,
  onWrite,
}) => {
  if (type !== 'live' || !intl) return null;

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  return (
    <OutlinedInput
      id="outlined-live-input"
      margin="none"
      color="primary"
      placeholder={intl.formatMessage(messages.writeAndSay)}
      autoFocus={!suppressNativeKeyboard}
      multiline
      rows={5}
      value={label as string}
      onChange={onWrite}
      fullWidth={true}
      inputProps={suppressNativeKeyboard ? { inputMode: 'none' } : undefined}
      onKeyPress={handleKeyPress}
      style={{
        padding: '0.5em 0.8em 0.5em 0.8em',
        height: '100%',
      }}
      className={'liveInput'}
    />
  );
};
