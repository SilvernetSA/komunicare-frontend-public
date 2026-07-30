import { defineMessages } from 'react-intl';

interface ColorSelectMessages {
  [key: string]: {
    id: string;
    defaultMessage: string;
  };
}

const messages: ColorSelectMessages = defineMessages({
  color: {
    id: 'komunicare.components.ColorSelect.color',
    defaultMessage: 'Color',
  },
  clearSelection: {
    id: 'komunicare.components.ColorSelect.clearSelection',
    defaultMessage: 'Clear selection',
  },
  colorScheme: {
    id: 'komunicare.components.ColorSelect.colorScheme',
    defaultMessage: 'Color Scheme',
  },
});

export default messages;
