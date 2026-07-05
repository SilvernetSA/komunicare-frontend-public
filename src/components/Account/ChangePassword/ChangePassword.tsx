import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams, useNavigate } from 'react-router-dom';

import messages from './ChangePassword.messages';
import ChangePasswordContent from './components/ChangePasswordContent';
import { useAuthStore } from '../../../store/authStore';
import './ChangePassword.css';

interface StorePasswordState {
  success?: boolean;
  message?: string;
}

interface FormValues {
  password: string;
  passwordRepeat: string;
}

const ChangePassword: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { userid, url } = useParams<{ userid: string; url: string }>();

  const [isSending, setIsSending] = useState(false);
  const [storePasswordState, setStorePasswordState] =
    useState<StorePasswordState>({});
  const [redirectMessage, setRedirectMessage] = useState('');

  const changePassword = useAuthStore((state) => state.changePassword);

  const handleSubmit = async (values: FormValues): Promise<void> => {
    if (!userid || !url) return;

    setIsSending(true);
    setStorePasswordState({});

    try {
      const res: any = await changePassword(userid, values.password, url);
      setStorePasswordState(res);
      setRedirectMessage(intl.formatMessage(messages.redirect));
      await new Promise((resolve) => setTimeout(resolve, 2000));
      navigate('/login-signup', { replace: true });
    } catch (err: any) {
      setStorePasswordState(err);
    } finally {
      setIsSending(false);
    }
  };

  const isButtonDisabled = isSending || !!storePasswordState.success;

  return (
    <div className="ChangePassword">
      <Dialog open={true} aria-labelledby="changePassword">
        <DialogTitle id="changePassword">
          <FormattedMessage {...messages.changePassword} />
        </DialogTitle>
        <ChangePasswordContent
          storePasswordState={storePasswordState}
          redirectMessage={redirectMessage}
          isSending={isSending}
          isButtonDisabled={isButtonDisabled}
          onSubmit={handleSubmit}
        />
      </Dialog>
    </div>
  );
};

export default ChangePassword;
