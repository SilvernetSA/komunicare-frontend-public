import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from '../Messages/ErrorBoundary.messages';

export const ErrorBoundaryDescription: React.FC = () => (
  <p style={{ margin: 0, opacity: 0.8 }}>
    <FormattedMessage {...messages.description} />
  </p>
);
