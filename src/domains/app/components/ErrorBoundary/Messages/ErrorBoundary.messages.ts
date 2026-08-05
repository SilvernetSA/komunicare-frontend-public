import { defineMessages } from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'ErrorBoundary.title',
    defaultMessage: 'An error occurred while loading the application',
  },
  description: {
    id: 'ErrorBoundary.description',
    defaultMessage: 'Something went wrong. Please reload the page.',
  },
  reloadButton: {
    id: 'ErrorBoundary.reloadButton',
    defaultMessage: 'Reload',
  },
});

export default messages;
