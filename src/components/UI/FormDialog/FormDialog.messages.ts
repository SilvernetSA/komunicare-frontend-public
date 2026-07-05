import { defineMessages, MessageDescriptor } from 'react-intl';

interface Messages {
  [key: string]: MessageDescriptor;
}

const messages: Messages = defineMessages({
  save: {
    id: 'komunicare.components.FormDialog.save',
    defaultMessage: 'Save',
  },
  cancel: {
    id: 'komunicare.components.FormDialog.cancel',
    defaultMessage: 'Cancel',
  },
});

export default messages;
