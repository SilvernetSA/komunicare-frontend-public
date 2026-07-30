import React from 'react';
import { useIntl } from 'react-intl';

import messages from './AuthScreen.messages';
import WelcomeScreen from '../WelcomeScreen/WelcomeScreen';
import './AuthScreen.css';

const AuthScreen: React.FC = () => {
  const intl = useIntl();

  return (
    <div className="AuthScreen__content">
      <WelcomeScreen
        heading={intl.formatMessage(messages.heading)}
        text={intl.formatMessage(messages.text)}
      />
    </div>
  );
};

export default AuthScreen;
export * from './Auth.helpers';
