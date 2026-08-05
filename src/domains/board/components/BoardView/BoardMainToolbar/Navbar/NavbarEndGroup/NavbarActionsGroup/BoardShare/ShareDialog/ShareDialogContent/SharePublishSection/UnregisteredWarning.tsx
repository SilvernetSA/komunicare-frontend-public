import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import messages from '../../../../BoardShare.messages';

export const UnregisteredWarning: React.FC = () => (
  <React.Fragment>
    <Alert severity="warning">
      <FormattedMessage {...messages.unregisteredWarning} />
    </Alert>
    <Button
      color="primary"
      variant="contained"
      component={Link}
      to="/login-signup"
    >
      <FormattedMessage {...messages.loginSignUp} />
    </Button>
  </React.Fragment>
);
