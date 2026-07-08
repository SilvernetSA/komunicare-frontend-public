import React from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import messages from './AuthScreen.messages';
import WelcomeScreen from '../WelcomeScreen/WelcomeScreen';
import './AuthScreen.css';

interface AuthScreenProps {
  history?: {
    goBack: () => void;
  };
}

const AuthScreen: React.FC<AuthScreenProps> = ({ history }) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const handleClose = () => {
    if (history && history.goBack) {
      history.goBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="AuthScreen__content">
      <WelcomeScreen
        heading={intl.formatMessage(messages.heading)}
        text={intl.formatMessage(messages.text)}
        onClose={handleClose}
      />
    </div>
  );
};

export default AuthScreen;
export * from './Auth.helpers';
