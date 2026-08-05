import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from '../Messages/ErrorBoundary.messages';

interface ErrorBoundaryReloadButtonProps {
  onReload: () => void;
}

export const ErrorBoundaryReloadButton: React.FC<
  ErrorBoundaryReloadButtonProps
> = ({ onReload }) => (
  <button
    type="button"
    onClick={onReload}
    style={{
      padding: '10px 20px',
      fontSize: '1rem',
      borderRadius: '8px',
      border: 'none',
      color: '#fff',
      background: '#1e88e5',
      cursor: 'pointer',
    }}
  >
    <FormattedMessage {...messages.reloadButton} />
  </button>
);
