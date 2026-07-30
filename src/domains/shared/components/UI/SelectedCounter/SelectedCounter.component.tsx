import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from './SelectedCounter.messages';
import './SelectedCounter.css';

interface SelectedCounterProps {
  count?: number;
}

const SelectedCounter: React.FC<SelectedCounterProps> = ({ count = 0 }) => (
  <div className="SelectedCounter">
    <span>
      {count} <FormattedMessage {...messages.items} />
    </span>
  </div>
);

export default SelectedCounter;
