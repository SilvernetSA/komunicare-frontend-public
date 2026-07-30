import { defineMessages } from 'react-intl';

interface ResetPasswordMessages {
  [key: string]: {
    id: string;
    defaultMessage: string;
  };
}

const messages: ResetPasswordMessages = defineMessages({
  email: {
    id: 'komunicare.components.ResetPassword.email',
    defaultMessage: 'Email',
  },
  cancel: {
    id: 'komunicare.components.ResetPassword.cancel',
    defaultMessage: 'Cancel',
  },
  send: {
    id: 'komunicare.components.ResetPassword.send',
    defaultMessage: 'Send',
  },
  resetPassword: {
    id: 'komunicare.components.ResetPassword.resetPassword',
    defaultMessage: 'Reset Your Password',
  },
  resetPasswordText: {
    id: 'komunicare.components.ResetPassword.resetPasswordText',
    defaultMessage:
      'Enter your email address and we will send you a link to reset your password.',
  },
  resetPasswordSuccess: {
    id: 'komunicare.components.ResetPassword.resetPasswordSuccess',
    defaultMessage: 'Success!! Check your mail to reset your password.',
  },
  userNotFoundByEmail: {
    id: 'komunicare.components.ResetPassword.userNotFoundByEmail',
    defaultMessage: 'No user found with that email address. Check your input.',
  },
  noConnection: {
    id: 'komunicare.components.ResetPassword.noConnection',
    defaultMessage: 'Unable to contact server. Try in a moment',
  },
});

export default messages;
