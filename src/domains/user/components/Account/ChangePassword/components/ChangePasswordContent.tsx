import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import { Formik } from 'formik';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import TextField from '@/domains/shared/components/UI/FormItems/TextField';
import LoadingIcon from '@/domains/shared/components/UI/LoadingIcon/LoadingIcon';
import messages from '../ChangePassword.messages';
import validationSchema from '../validationSchema';

interface FormValues {
  password: string;
  passwordRepeat: string;
}

const KNOWN_CHANGE_PASSWORD_ERRORS: Record<
  string,
  typeof messages.userNotFoundById
> = {
  'Expired time to reset password!': messages.expiredResetLink,
  'Error resetting user password.': messages.errorResettingPassword,
  'No user found with that ID.': messages.userNotFoundById,
  'Unable to contact server. Try in a moment': messages.noConnection,
};

export interface ChangePasswordContentProps {
  storePasswordState: { success?: boolean; message?: string };
  redirectMessage: string;
  isSending: boolean;
  isButtonDisabled: boolean;
  onSubmit: (values: FormValues) => Promise<void>;
}

const ChangePasswordContent: React.FC<ChangePasswordContentProps> = ({
  storePasswordState,
  redirectMessage,
  isSending,
  isButtonDisabled,
  onSubmit,
}) => {
  const intl = useIntl();

  return (
    <DialogContent>
      {storePasswordState && !storePasswordState.success && (
        <DialogContentText>
          <FormattedMessage {...messages.changePasswordText} />
        </DialogContentText>
      )}
      <div
        className={classNames('ChangePassword__status', {
          'ChangePassword__status--error': !storePasswordState.success,
          'ChangePassword__status--success': storePasswordState.success,
        })}
      >
        {!!storePasswordState.success ? (
          <Typography color="inherit">
            {intl.formatMessage(messages.changePasswordSuccess)}
          </Typography>
        ) : (
          <Typography color="inherit">
            {KNOWN_CHANGE_PASSWORD_ERRORS[
              (storePasswordState.message ?? '').trim()
            ] ? (
              <FormattedMessage
                {...KNOWN_CHANGE_PASSWORD_ERRORS[
                  (storePasswordState.message ?? '').trim()
                ]}
              />
            ) : (
              storePasswordState.message
            )}
          </Typography>
        )}
      </div>
      {redirectMessage && (
        <div
          className={classNames(
            'ChangePassword__status',
            'ChangePassword__status--success',
          )}
        >
          <Typography color="inherit">
            {intl.formatMessage(messages.redirect)}
          </Typography>
        </div>
      )}
      {storePasswordState && !storePasswordState.success && (
        <Formik
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          initialValues={{ password: '', passwordRepeat: '' }}
        >
          {({ errors, handleChange, handleSubmit }) => (
            <form className="ChangePassword__form" onSubmit={handleSubmit}>
              <TextField
                error={errors.password}
                label={intl.formatMessage(messages.password)}
                type="password"
                name="password"
                onChange={handleChange}
              />
              <TextField
                error={errors.passwordRepeat}
                label={intl.formatMessage(messages.passwordRepeat)}
                type="password"
                name="passwordRepeat"
                onChange={handleChange}
              />
              <DialogActions>
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
  );
};

export default ChangePasswordContent;
