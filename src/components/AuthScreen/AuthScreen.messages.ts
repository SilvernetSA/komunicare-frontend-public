import { defineMessages, MessageDescriptor } from 'react-intl';

interface Messages {
  [key: string]: MessageDescriptor;
}

const messages: Messages = defineMessages({
  heading: {
    id: 'komunicare.components.AuthScreenInformation.heading',
    defaultMessage: 'Komunicare',
  },
  text: {
    id: 'komunicare.components.AuthScreenInformation.text',
    defaultMessage: 'Sign up to sync your settings!',
  },
});

export default messages;
