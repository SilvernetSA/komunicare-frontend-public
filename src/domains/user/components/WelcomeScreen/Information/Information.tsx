import React, { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

import messages from './Information.messages';

interface InformationProps {
  heading?: ReactNode;
  text?: ReactNode;
}

const Information: React.FC<InformationProps> = ({ heading }) => (
  <>
    <h2 style={{ textAlign: 'center' }} className="WelcomeScreen__heading">
      {heading ? heading : <FormattedMessage {...messages.heading} />}
    </h2>
  </>
);

export default Information;
