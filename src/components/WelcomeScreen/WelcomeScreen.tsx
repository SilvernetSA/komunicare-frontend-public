import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Information from './Information/Information';
import KomunicareLogo from './KomunicareLogo/KomunicareLogo.component';
import messages from './WelcomeScreen.messages';
import Login from '../Account/Login/Login.component';
import ResetPassword from '../Account/ResetPassword/ResetPassword.component';
import SignUp from '../Account/SignUp/SignUp.component';

import './WelcomeScreen.css';

interface Props {
  heading?: string;
  text?: string;
}

// Self-signup hidden until the subscription flow is fully validated.
const SIGN_UP_ENABLED = false;

interface DialogWithKeyboardStyle {
  dialogStyle: React.CSSProperties;
  dialogContentStyle: React.CSSProperties;
}

const WelcomeScreen: React.FC<Props> = ({ heading, text }) => {
  const [activeView, setActiveView] = useState<string>('');
  const [dialogWithKeyboardStyle] = useState<DialogWithKeyboardStyle>({
    dialogStyle: {},
    dialogContentStyle: {},
  });

  return (
    <div className="WelcomeScreen">
      <div className="WelcomeScreen__container">
        <div className="WelcomeScreen__content">
          <Information heading={heading} text={text} />
        </div>
        <div className="WelcomeScreen__logo">
          <KomunicareLogo />
        </div>
        <footer className="WelcomeScreen__footer">
          <Button
            className="WelcomeScreen__button WelcomeScreen__button--login"
            variant="contained"
            onClick={() => setActiveView('login')}
          >
            <FormattedMessage {...messages.login} />
          </Button>
          {SIGN_UP_ENABLED && (
            <Button
              className="WelcomeScreen__button WelcomeScreen__button--signup"
              variant="contained"
              color="primary"
              onClick={() => setActiveView('signup')}
            >
              <FormattedMessage {...messages.signUp} />
            </Button>
          )}
        </footer>
        <div className="WelcomeScreen__links">
          <Link href="#" rel="noopener noreferrer" color="inherit">
            <FormattedMessage {...messages.privacy} />
          </Link>
          <Link href="#" rel="noopener noreferrer" color="inherit">
            <FormattedMessage {...messages.terms} />
          </Link>
        </div>
      </div>
      <Login
        isDialogOpen={activeView === 'login'}
        onResetPasswordClick={() => setActiveView('forgot')}
        onClose={() => setActiveView('')}
      />
      <ResetPassword
        isDialogOpen={activeView === 'forgot'}
        onClose={() => setActiveView('')}
      />
      {SIGN_UP_ENABLED && (
        <SignUp
          isDialogOpen={activeView === 'signup'}
          onClose={() => setActiveView('')}
          dialogWithKeyboardStyle={dialogWithKeyboardStyle}
        />
      )}
    </div>
  );
};

export default WelcomeScreen;
