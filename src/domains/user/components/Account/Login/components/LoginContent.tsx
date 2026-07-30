import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Typography,
  Button,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
} from '@mui/material';
import classNames from 'classnames';
import { Formik, FormikProps } from 'formik';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import TextField from '@/domains/shared/components/UI/FormItems/TextField';
import LoadingIcon from '@/domains/shared/components/UI/LoadingIcon/LoadingIcon';
import messages from '../Login.messages';
import validationSchema from '../validationSchema';

export interface LoginFormValues {
  email: string;
  password: string;
}

const KNOWN_LOGIN_ERRORS: Record<string, typeof messages.maxDevicesReached> = {
  'You have reached the maximum number of devices (2).':
    messages.maxDevicesReached,
  'User not found.': messages.userNotFound,
  'Wrong email or password.': messages.wrongCredentials,
  'Your password has expired. Please reset your password.':
    messages.passwordExpired,
  'An unexpected error occurred during login.': messages.unexpectedLoginError,
  'Unable to contact server. Try in a moment': messages.noConnection,
  'Email not confirmed. Please confirm your account first.':
    messages.emailNotConfirmed,
};

const EMAIL_NOT_CONFIRMED_MSG =
  'Email not confirmed. Please confirm your account first.';

export interface LoginContentProps {
  loginStatus: { success?: boolean; message?: string };
  isLogging: boolean;
  isButtonDisabled: boolean;
  dialogContentStyle?: React.CSSProperties;
  onSubmit: (values: LoginFormValues) => Promise<void>;
  onClose: () => void;
  onResetPasswordClick: () => void;
  onResendConfirmationEmail: (email: string) => void;
}

const LoginContent: React.FC<LoginContentProps> = ({
  loginStatus,
  isLogging,
  isButtonDisabled,
  dialogContentStyle,
  onSubmit,
  onClose,
  onResetPasswordClick,
  onResendConfirmationEmail,
}) => {
  const intl = useIntl();
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  const initialValues: LoginFormValues = { email: '', password: '' };

  return (
    <DialogContent style={dialogContentStyle}>
      <div
        className={classNames('Login__status', {
          'Login__status--error': !loginStatus.success,
          'Login__status--success': loginStatus.success,
        })}
      >
        <Typography color="inherit">
          {KNOWN_LOGIN_ERRORS[loginStatus.message ?? ''] ? (
            <FormattedMessage
              {...KNOWN_LOGIN_ERRORS[loginStatus.message ?? '']}
            />
          ) : (
            loginStatus.message
          )}
        </Typography>
      </div>

      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
      >
        {({
          errors,
          values,
          handleChange,
          handleSubmit,
        }: FormikProps<LoginFormValues>) => (
          <form className="Login__form" onSubmit={handleSubmit}>
            <TextField
              error={errors.email}
              label={intl.formatMessage(messages.email)}
              name="email"
              onChange={handleChange}
            />
            <TextField
              error={errors.password}
              label={intl.formatMessage(messages.password)}
              type={isPasswordVisible ? 'text' : 'password'}
              name="password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setIsPasswordVisible((v) => !v)}
                      size="large"
                    >
                      {isPasswordVisible ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onChange={handleChange}
            />
            {loginStatus.message === EMAIL_NOT_CONFIRMED_MSG && (
              <Button
                size="small"
                color="primary"
                disabled={isButtonDisabled}
                onClick={() => onResendConfirmationEmail(values.email)}
              >
                <FormattedMessage {...messages.resendConfirmationEmail} />
              </Button>
            )}
            <DialogActions>
              <Button
                color="primary"
                disabled={isButtonDisabled}
                onClick={onClose}
              >
                <FormattedMessage {...messages.cancel} />
              </Button>
              <Button
                type="submit"
                disabled={isButtonDisabled}
                variant="contained"
                color="primary"
              >
                {isLogging && <LoadingIcon />}
                <FormattedMessage {...messages.login} />
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>

      <Button
        size="small"
        color="primary"
        disabled={isButtonDisabled}
        onClick={onResetPasswordClick}
      >
        <FormattedMessage {...messages.forgotPassword} />
      </Button>
    </DialogContent>
  );
};

export default LoginContent;
