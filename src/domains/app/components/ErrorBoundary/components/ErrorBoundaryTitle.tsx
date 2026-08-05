import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from '../Messages/ErrorBoundary.messages';

export const ErrorBoundaryTitle: React.FC = () => (
  <h1 style={{ fontSize: '1.25rem', margin: 0 }}>
    <FormattedMessage {...messages.title} />
  </h1>
);
