import { defineMessages, MessageDescriptor } from 'react-intl';

interface Messages {
  [key: string]: MessageDescriptor;
}

const messages: Messages = defineMessages({
  male: {
    id: 'komunicare.components.SpeechProvider.male',
    defaultMessage: 'Male',
  },
  female: {
    id: 'komunicare.components.SpeechProvider.female',
    defaultMessage: 'Female',
  },
});

export default messages;
