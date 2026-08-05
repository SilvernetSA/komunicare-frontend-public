'use client';

import { Dialog, DialogTitle } from '@mui/material';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import LoginContent, { LoginFormValues } from './components/LoginContent';
import messages from './Login.messages';
import { useAuthStore } from '@/domains/user/stores/authStore';
import { useLanguageStore } from '@/domains/settings/stores/languageStore';
import { useUserStore } from '@/domains/user/stores/userStore';
import BuildInfo from '@/domains/app/components/BuildInfo/BuildInfo';
import { IS_DEV_ENV } from '@/domains/app/components/BuildInfo/buildInfo.constants';
import './Login.css';

interface LoginProps {
  isDialogOpen: boolean;
  onClose: () => void;
  onResetPasswordClick: () => void;
  dialogWithKeyboardStyle?: {
    dialogStyle?: React.CSSProperties;
    dialogContentStyle?: React.CSSProperties;
  };
}

const Login: React.FC<LoginProps> = ({
  isDialogOpen,
  onClose,
  onResetPasswordClick,
  dialogWithKeyboardStyle = {},
}) => {
  const [isLogging, setIsLogging] = useState(false);
  const [loginStatus, setLoginStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const lang = useLanguageStore.getState().lang;
  const resendVerification = useUserStore.getState().resendVerification;

  const handleSubmit = async (values: LoginFormValues): Promise<void> => {
    setIsLogging(true);
    setLoginStatus({});
    try {
      await useAuthStore.getState().login({ ...values, type: 'local' });
    } catch (status: any) {
      setLoginStatus(status);
      if (status?.message?.toLowerCase().includes('expired')) {
        setTimeout(() => {
          onResetPasswordClick();
        }, 1500);
      }
    } finally {
      setIsLogging(false);
    }
  };

  const handleResendConfirmationEmail = async (
    email: string,
  ): Promise<void> => {
    setIsLogging(true);
    try {
      await resendVerification(email, lang || 'en-US');
      setLoginStatus({
        success: true,
        message: 'Confirmation email resent. Please check your inbox.',
      });
    } catch {
      setLoginStatus({
        message: 'Could not resend confirmation email. Try again later.',
      });
    } finally {
      setIsLogging(false);
    }
  };

  const { dialogStyle, dialogContentStyle } = dialogWithKeyboardStyle;
  const isButtonDisabled = isLogging || !!loginStatus.success;

  return (
    <Dialog
      open={isDialogOpen}
      onClose={onClose}
      aria-labelledby="login"
      style={dialogStyle}
    >
      <DialogTitle id="login">
        <FormattedMessage {...messages.login} />
      </DialogTitle>
      <LoginContent
        loginStatus={loginStatus}
        isLogging={isLogging}
        isButtonDisabled={isButtonDisabled}
        dialogContentStyle={dialogContentStyle}
        onSubmit={handleSubmit}
        onClose={onClose}
        onResetPasswordClick={onResetPasswordClick}
        onResendConfirmationEmail={handleResendConfirmationEmail}
      />
      {IS_DEV_ENV && <BuildInfo variant="badge" />}
    </Dialog>
  );
};

export default Login;
