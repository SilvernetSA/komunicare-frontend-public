import { defineMessages } from 'react-intl';

interface Messages {
  [key: string]: {
    id: string;
    defaultMessage: string;
  };
}

const messages: Messages = defineMessages({
  password: {
    id: 'komunicare.components.ChangePassword.password',
    defaultMessage: 'New Password',
  },
  passwordRepeat: {
    id: 'komunicare.components.ChangePassword.passwordRepeat',
    defaultMessage: 'Repeat New Password',
  },
  send: {
    id: 'komunicare.components.ChangePassword.send',
    defaultMessage: 'Send',
  },
  changePassword: {
    id: 'komunicare.components.ChangePassword.changePassword',
    defaultMessage: 'Save your new password',
  },
  changePasswordText: {
    id: 'komunicare.components.ChangePassword.changePasswordText',
    defaultMessage:
      'Enter two times your new password to access to Komunicare.',
  },
  changePasswordSuccess: {
    id: 'komunicare.components.ChangePassword.changePasswordSuccess',
    defaultMessage: 'Success!! Your password was updated.',
  },
  redirect: {
    id: 'komunicare.components.ChangePassword.redirect',
    defaultMessage: 'Redirecting you to the login page...',
  },
  expiredResetLink: {
    id: 'komunicare.components.ChangePassword.expiredResetLink',
    defaultMessage: 'Expired time to reset password!',
  },
  errorResettingPassword: {
    id: 'komunicare.components.ChangePassword.errorResettingPassword',
    defaultMessage: 'Error resetting user password.',
  },
  userNotFoundById: {
    id: 'komunicare.components.ChangePassword.userNotFoundById',
    defaultMessage: 'No user found with that ID.',
  },
  noConnection: {
    id: 'komunicare.components.ChangePassword.noConnection',
    defaultMessage: 'Unable to contact server. Try in a moment',
  },
});

export default messages;
