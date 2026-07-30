import { defineMessages, MessageDescriptor } from 'react-intl';

interface Messages {
  [key: string]: MessageDescriptor;
}

const messages: Messages = defineMessages({
  analytics: {
    id: 'komunicare.components.Analytics.analytics',
    defaultMessage: 'Analytics',
  },
  mostUsedBoards: {
    id: 'komunicare.components.Analytics.mostUsedBoards',
    defaultMessage: 'Most Used Boards',
  },
  topUsedButtons: {
    id: 'komunicare.components.Analytics.topUsedButtons',
    defaultMessage: 'Top Used Buttons',
  },
  symbolSources: {
    id: 'komunicare.components.Analytics.symbolSources',
    defaultMessage: 'Symbol Sources',
  },
  tenDaysUsage: {
    id: 'komunicare.components.Analytics.tenDaysUsage',
    defaultMessage: 'Ten Days Usage',
  },
  twentyDaysUsage: {
    id: 'komunicare.components.Analytics.twentyDaysUsage',
    defaultMessage: 'Twenty Days Usage',
  },
  thirtyDaysUsage: {
    id: 'komunicare.components.Analytics.thirtyDaysUsage',
    defaultMessage: 'Thirty Days Usage',
  },
  sixtyDaysUsage: {
    id: 'komunicare.components.Analytics.sixtyDaysUsage',
    defaultMessage: 'Sixty Days Usage',
  },
  close: {
    id: 'komunicare.components.Analytics.close',
    defaultMessage: 'Close',
  },
  loadingError: {
    id: 'komunicare.components.Analytics.loadingError',
    defaultMessage: 'There was an error loading your data. Please refresh.',
  },
  totalWords: {
    id: 'komunicare.components.Analytics.totalWords',
    defaultMessage: 'Total Words',
  },
  totalPhrases: {
    id: 'komunicare.components.Analytics.totalPhrases',
    defaultMessage: 'Total phrases',
  },
  boardsUsed: {
    id: 'komunicare.components.Analytics.boardsUsed',
    defaultMessage: 'Boards used',
  },
  tilesEdited: {
    id: 'komunicare.components.Analytics.tilesEdited',
    defaultMessage: 'Tiles edited',
  },
  editingEvents: {
    id: 'komunicare.components.Analytics.editingEvents',
    defaultMessage: 'Editing Events',
  },
  speechEvents: {
    id: 'komunicare.components.Analytics.speechEvents',
    defaultMessage: 'Speech Events',
  },
  navigationEvents: {
    id: 'komunicare.components.Analytics.navigationEvents',
    defaultMessage: 'Navigation Events',
  },
  name: {
    id: 'komunicare.components.Analytics.name',
    defaultMessage: 'Name',
  },
  timesClicked: {
    id: 'komunicare.components.Analytics.timesClicked',
    defaultMessage: 'Times Clicked',
  },
  action: {
    id: 'komunicare.components.Analytics.action',
    defaultMessage: 'Action',
  },
});

export default messages;
