import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import { Formik, ErrorMessage } from 'formik';
import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import messages from './SignUp.messages';
import validationSchema from './validationSchema';
import { useLanguageStore } from '../../../store/languageStore';
import { useUserStore } from '../../../store/userStore';
import { DEFAULT_LANG } from '../../App/App.constants';
import TextField from '../../UI/FormItems/TextField';
import LoadingIcon from '../../UI/LoadingIcon/LoadingIcon';
import './SignUp.css';

interface SignUpProps {
  isDialogOpen: boolean;
  onClose: () => void;
  isKeyboardOpen?: boolean;
  dialogWithKeyboardStyle?: {
    dialogStyle?: React.CSSProperties;
    dialogContentStyle?: React.CSSProperties;
  };
}

interface SignUpStatus {
  success?: boolean;
  message?: string;
  code?: string;
}

interface SignUpFormValues {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  isTermsAccepted: boolean;
  gender?: string;
}

const SignUp: React.FC<SignUpProps> = ({
  isDialogOpen,
  onClose,
  isKeyboardOpen: _isKeyboardOpen,
  dialogWithKeyboardStyle = {},
}) => {
  const intl = useIntl();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signUpStatus, setSignUpStatus] = useState<SignUpStatus>({});
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const lang = useLanguageStore((state) => state.lang);

  useEffect(() => {
    if (isDialogOpen) {
      setSignUpStatus({});
    }
  }, [isDialogOpen]);

  const signUp = useUserStore((state) => state.signUp);
  const resendVerification = useUserStore((state) => state.resendVerification);

  const handleSubmit = async (values: SignUpFormValues): Promise<void> => {
    const { passwordConfirm: _passwordConfirm, ...formValues } = values;
    const locale = lang || DEFAULT_LANG;

    setIsSigningUp(true);
    setSignUpStatus({});
    setSignUpEmail(formValues.email);

    try {
      const status = await signUp({ ...formValues, locale });
      setSignUpStatus(status);
    } catch (error: any) {
      const responseCode = error?.response?.data?.code;
      const responseMessage = error?.response?.data?.message;
      const directMessage = error?.message;
      let message =
        responseMessage ||
        directMessage ||
        intl.formatMessage(messages.noConnection);

      if (responseCode === 'TEMPORARY_USER_EXISTS') {
        message = intl.formatMessage(messages.temporaryUserExists);
      } else if (
        responseMessage ===
        'You have already signed up and confirmed your account. Did you forget your password?'
      ) {
        message = intl.formatMessage(messages.accountAlreadyConfirmed);
      }

      setSignUpStatus({
        success: false,
        message: message,
        code: responseCode,
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleResend = async () => {
    setIsSigningUp(true);
    setSignUpStatus({});
    try {
      await resendVerification(signUpEmail, lang || DEFAULT_LANG);
      setSignUpStatus({
        success: true,
        message: intl.formatMessage(messages.emailResentSuccess),
      });
    } catch (error: any) {
      setSignUpStatus({
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          intl.formatMessage(messages.noConnection),
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const { dialogStyle, dialogContentStyle } = dialogWithKeyboardStyle ?? {};
  const isButtonDisabled = isSigningUp || !!signUpStatus.success;

  return (
    <Dialog
      open={isDialogOpen}
      onClose={onClose}
      aria-labelledby="sign-up"
      style={dialogStyle}
    >
      <DialogTitle id="sign-up">
        <FormattedMessage {...messages.signUp} />
      </DialogTitle>
      <DialogContent style={dialogContentStyle}>
        <div
          className={classNames('SignUp__status', {
            'SignUp__status--error': !signUpStatus.success,
            'SignUp__status--success': signUpStatus.success,
          })}
        >
          <Typography color="inherit">{signUpStatus.message}</Typography>
        </div>
        {signUpStatus && !signUpStatus.success && (
          <Formik<SignUpFormValues>
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
            initialValues={{
              name: '',
              email: '',
              password: '',
              passwordConfirm: '',
              isTermsAccepted: false,
              gender: '',
            }}
          >
            {({ errors, handleChange, handleSubmit, values }) => (
              <form className="SignUp__form" onSubmit={handleSubmit}>
                <TextField
                  name="name"
                  label={intl.formatMessage(messages.name)}
                  error={errors.name}
                  onChange={handleChange}
                />
                <TextField
                  name="email"
                  label={intl.formatMessage(messages.email)}
                  error={errors.email}
                  onChange={handleChange}
                />
                <TextField
                  type="password"
                  name="password"
                  label={intl.formatMessage(messages.createYourPassword)}
                  error={errors.password}
                  onChange={handleChange}
                />
                <TextField
                  type="password"
                  name="passwordConfirm"
                  label={intl.formatMessage(messages.confirmYourPassword)}
                  error={errors.passwordConfirm}
                  onChange={handleChange}
                />
                <FormControl fullWidth margin="dense">
                  <InputLabel id="gender-label">
                    {intl.formatMessage(messages.gender)}
                  </InputLabel>
                  <Select
                    labelId="gender-label"
                    name="gender"
                    value={values.gender || ''}
                    label={intl.formatMessage(messages.gender)}
                    onChange={handleChange}
                  >
                    <MenuItem value="">
                      <em>-</em>
                    </MenuItem>
                    <MenuItem value="male">
                      {intl.formatMessage(messages.genderMale)}
                    </MenuItem>
                    <MenuItem value="female">
                      {intl.formatMessage(messages.genderFemale)}
                    </MenuItem>
                    <MenuItem value="other">
                      {intl.formatMessage(messages.genderOther)}
                    </MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isTermsAccepted"
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label={
                    <FormattedMessage
                      {...messages.agreement}
                      values={{
                        terms: (
                          <a
                            href="https://www.komuni.care/terms-of-use/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {intl.formatMessage(messages.termsAndConditions)}
                          </a>
                        ),
                        privacy: (
                          <a
                            href="https://www.komuni.care/privacy/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {intl.formatMessage(messages.privacy)}
                          </a>
                        ),
                      }}
                    />
                  }
                />
                <ErrorMessage
                  name="isTermsAccepted"
                  component="p"
                  className="SignUp__status--error SignUp__termsError"
                />

                <DialogActions>
                  {signUpStatus.code === 'TEMPORARY_USER_EXISTS' && (
                    <Button
                      color="secondary"
                      disabled={isSigningUp}
                      onClick={handleResend}
                      variant="outlined"
                    >
                      <FormattedMessage {...messages.resendConfirmationEmail} />
                    </Button>
                  )}
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
                    {isSigningUp && <LoadingIcon />}
                    <FormattedMessage {...messages.signMeUp} />
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

export default SignUp;
