import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import React from 'react';
import { IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';

import messages from '../../Messages/Board.messages';

interface OfflineVoiceAlertProps {
  show?: boolean;
  intl: IntlShape;
}

export const OfflineVoiceAlert: React.FC<OfflineVoiceAlertProps> = ({
  show,
  intl,
}) => {
  if (!show) return null;

  return (
    <Alert
      variant="filled"
      severity="warning"
      action={
        <Button
          size="small"
          variant="outlined"
          style={{ color: 'white', borderColor: 'white' }}
          component={Link}
          to="/settings/speech"
        >
          {intl.formatMessage(messages.offlineChangeVoice)}
        </Button>
      }
    >
      {intl.formatMessage(messages.offlineVoiceAlert)}
    </Alert>
  );
};
