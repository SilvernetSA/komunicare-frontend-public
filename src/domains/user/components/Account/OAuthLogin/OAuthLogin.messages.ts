import { defineMessages } from 'react-intl';

interface OAuthLoginMessages {
  [key: string]: {
    id: string;
    defaultMessage: string;
  };
}

const messages: OAuthLoginMessages = defineMessages({
  loading: {
    id: 'komunicare.components.OAuthLogin.loading',
    defaultMessage: 'Loading...',
  },
  errorMessage: {
    id: 'komunicare.components.OAuthLogin.errorMessage',
    defaultMessage: 'An error has occurred...',
  },
});

export default messages;
