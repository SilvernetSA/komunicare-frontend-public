import { defineMessages } from 'react-intl';

interface SignUpMessages {
  [key: string]: {
    id: string;
    defaultMessage: string;
  };
}

const messages: SignUpMessages = defineMessages({
  signUp: {
    id: 'komunicare.components.SignUp.signUp',
    defaultMessage: 'Sign Up',
  },
  name: {
    id: 'komunicare.components.SignUp.name',
    defaultMessage: 'Name',
  },
  email: {
    id: 'komunicare.components.SignUp.email',
    defaultMessage: 'Email',
  },
  createYourPassword: {
    id: 'komunicare.components.SignUp.createYourPassword',
    defaultMessage: 'Create your password',
  },
  confirmYourPassword: {
    id: 'komunicare.components.SignUp.confirmYourPassword',
    defaultMessage: 'Confirm your password',
  },
  cancel: {
    id: 'komunicare.components.SignUp.cancel',
    defaultMessage: 'Cancel',
  },
  signMeUp: {
    id: 'komunicare.components.SignUp.signMeUp',
    defaultMessage: 'Sign me up',
  },
  agreement: {
    id: 'komunicare.components.SignUp.agreement',
    defaultMessage: 'I agree with the {terms} and the {privacy}',
  },
  termsAndConditions: {
    id: 'komunicare.components.SignUp.termsAndConditions',
    defaultMessage: 'Terms',
  },
  privacy: {
    id: 'komunicare.components.SignUp.privacy',
    defaultMessage: 'Privacy Policy',
  },
  temporaryUserExists: {
    id: 'komunicare.components.SignUp.temporaryUserExists',
    defaultMessage:
      'You have already signed up. Please check your email to verify your account.',
  },
  resendConfirmationEmail: {
    id: 'komunicare.components.SignUp.resendConfirmationEmail',
    defaultMessage: 'Resend confirmation email',
  },
  emailResentSuccess: {
    id: 'komunicare.components.SignUp.emailResentSuccess',
    defaultMessage: 'Confirmation email resent successfully',
  },
  accountAlreadyConfirmed: {
    id: 'komunicare.components.SignUp.accountAlreadyConfirmed',
    defaultMessage:
      'You have already signed up and confirmed your account. Did you forget your password?',
  },
  noConnection: {
    id: 'komunicare.components.SignUp.noConnection',
    defaultMessage: 'Unable to contact server. Try in a moment',
  },
  gender: {
    id: 'komunicare.components.SignUp.gender',
    defaultMessage: 'Gender (optional)',
  },
  genderMale: {
    id: 'komunicare.components.SignUp.genderMale',
    defaultMessage: 'Male',
  },
  genderFemale: {
    id: 'komunicare.components.SignUp.genderFemale',
    defaultMessage: 'Female',
  },
  genderOther: {
    id: 'komunicare.components.SignUp.genderOther',
    defaultMessage: 'Other',
  },
});

export default messages;
