import Alert from '@mui/material/Alert';
import React from 'react';
import { IntlShape } from 'react-intl';

import messages from '../../Messages/Board.messages';

interface EmptyVoiceAlertProps {
  show?: boolean;
  intl: IntlShape;
}

export const EmptyVoiceAlert: React.FC<EmptyVoiceAlertProps> = ({
  show,
  intl,
}) => {
  if (!show) return null;

  return (
    <Alert variant="filled" severity="error">
      {intl.formatMessage(messages.emptyVoiceAlert)}
    </Alert>
  );
};
