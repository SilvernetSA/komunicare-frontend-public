import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import messages from './ResetPassword.messages';
import validationSchema from './validationSchema';
import { useAuthStore } from '../../../store/authStore';
import TextField from '../../UI/FormItems/TextField';
import LoadingIcon from '../../UI/LoadingIcon/LoadingIcon';
import './ResetPassword.css';

interface ResetPasswordProps {
  isDialogOpen: boolean;
  onClose: () => void;
}

interface ForgotState {
  success?: Record<string, unknown>;
  message?: string;
}

const KNOWN_RESET_PASSWORD_ERRORS: Record<
  string,
  typeof messages.userNotFoundByEmail
> = {
  'No user found with that email address. Check your input.':
    messages.userNotFoundByEmail,
  'Unable to contact server. Try in a moment': messages.noConnection,
};

const ResetPassword: React.FC<ResetPasswordProps> = ({
  isDialogOpen,
  onClose,
}) => {
  const intl = useIntl();
  const [isSending, setIsSending] = useState(false);
  const [forgotState, setForgotState] = useState<ForgotState>({});
  const requestPasswordReset = useAuthStore(
    (state) => state.requestPasswordReset,
  );

  const handleSubmit = async (values: { email: string }): Promise<void> => {
    setIsSending(true);
    setForgotState({});

    try {
      const res: any = await requestPasswordReset(values.email);
      setForgotState({
        success: res.response,
      });
    } catch (err: any) {
      setForgotState(err);
    } finally {
      setIsSending(false);
    }
  };

  const isButtonDisabled = isSending || !!forgotState.success;

  return (
    <Dialog open={isDialogOpen} onClose={onClose} aria-labelledby="forgot">
      <DialogTitle id="forgot">
        <FormattedMessage {...messages.resetPassword} />
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <FormattedMessage {...messages.resetPasswordText} />
        </DialogContentText>

        <div
          className={classNames('Forgot__status', {
            'Forgot__status--error': !forgotState.success,
            'Forgot__status--success': forgotState.success,
          })}
        >
          {!!forgotState.success ? (
            <Typography color="inherit">
              {intl.formatMessage(messages.resetPasswordSuccess)}
            </Typography>
          ) : (
            <Typography color="inherit">
              {KNOWN_RESET_PASSWORD_ERRORS[forgotState.message ?? ''] ? (
                <FormattedMessage
                  {...KNOWN_RESET_PASSWORD_ERRORS[forgotState.message ?? '']}
                />
              ) : (
                forgotState.message
              )}
            </Typography>
          )}
        </div>
        {forgotState && !forgotState.success && (
          <Formik
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
            initialValues={{ email: '' }}
          >
            {({ errors, handleChange, handleSubmit }) => (
              <form className="Forgot__form" onSubmit={handleSubmit}>
                <TextField
                  error={errors.email}
                  label={intl.formatMessage(messages.email)}
                  name="email"
                  onChange={handleChange}
                />
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
                    {isSending && <LoadingIcon />}
                    <FormattedMessage {...messages.send} />
                  </Button>
                </DialogActions>
              </form>
            )}
          </Formik>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResetPassword;
