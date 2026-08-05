import Alert from '@mui/material/Alert';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from '../../../../BoardShare.messages';

export const InsufficientTilesAlert: React.FC = () => (
  <Alert severity="info">
    <FormattedMessage {...messages.insufficientTiles} />
  </Alert>
);
