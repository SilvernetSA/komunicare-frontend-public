import { defineMessages, MessageDescriptor } from 'react-intl';

interface Messages {
  [key: string]: MessageDescriptor;
}

const messages: Messages = defineMessages({
  save: {
    id: 'komunicare.components.App.save',
    defaultMessage: 'Save',
  },
  newContentAvailable: {
    id: 'komunicare.components.App.newContentAvailable',
    defaultMessage: 'New content is available; please refresh.',
  },
  contentIsCached: {
    id: 'komunicare.components.App.contentIsCached',
    defaultMessage: 'Content is cached for offline use.',
  },
});

export default messages;
