import { defineMessages, MessageDescriptor } from 'react-intl';

interface Messages {
  [key: string]: MessageDescriptor;
}

const messages: Messages = defineMessages({
  resetTours: {
    id: 'komunicare.components.ResetToursItem.resetTours',
    defaultMessage: 'Reset all help tours',
  },
  resetToursSecondary: {
    id: 'komunicare.components.ResetToursItem.resetToursSecondary',
    defaultMessage: 'Enable all the help tours across Komunicare again',
  },
  confirmDialog: {
    id: 'komunicare.components.ResetToursItem.confirmDialog',
    defaultMessage: 'Are you sure you want to enable all help tours again?',
  },
  ok: {
    id: 'komunicare.components.ResetToursItem.ok',
    defaultMessage: 'OK',
  },
  cancel: {
    id: 'komunicare.components.ResetToursItem.cancel',
    defaultMessage: 'Cancel',
  },
});

export default messages;
