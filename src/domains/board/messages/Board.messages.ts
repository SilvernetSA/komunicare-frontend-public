import { defineMessages, MessageDescriptor } from 'react-intl';

interface Messages {
  [key: string]: MessageDescriptor;
}

const messages: Messages = defineMessages({
  deleteTilesFailed: {
    id: 'komunicare.components.Board.deleteTilesFailed',
    defaultMessage:
      'The pictograms could not be deleted. Check your connection and try again.',
  },
  tilesDeleted: {
    id: 'komunicare.components.Board.tilesDeleted',
    defaultMessage: 'Tiles deleted',
  },
  rootBoardNotDeleted: {
    id: 'komunicare.components.Board.rootBoardNotDeleted',
    defaultMessage: 'Root Board cannot be deleted',
  },
  tilesCreated: {
    id: 'komunicare.components.Board.tilesCreated',
    defaultMessage: 'Tiles created',
  },
  boardSavedNotification: {
    id: 'komunicare.components.Board.boardSavedNotification',
    defaultMessage: 'Board changes were saved',
  },
  boardNotSavedNotification: {
    id: 'komunicare.components.Board.boardNotSavedNotification',
    defaultMessage:
      'There was an error updating your board on the cloud. Check your connection',
  },
  editTitle: {
    id: 'komunicare.components.Board.editTitle',
    defaultMessage: 'Edit Board Title',
  },
  boardTitle: {
    id: 'komunicare.components.Board.boardTitle',
    defaultMessage: 'Board Title',
  },
  boardEditTitleCancel: {
    id: 'komunicare.components.Board.boardEditTitleCancel',
    defaultMessage: 'Cancel',
  },
  boardEditTitleAccept: {
    id: 'komunicare.components.Board.boardEditTitleAccept',
    defaultMessage: 'Accept',
  },
  share: {
    id: 'komunicare.components.Board.share',
    defaultMessage: 'Share',
  },
  notifications: {
    id: 'komunicare.components.Board.notifications',
    defaultMessage: 'Notifications',
  },
  notificationsWithUnreadCount: {
    id: 'komunicare.components.Board.notificationsWithUnreadCount',
    defaultMessage:
      'Notifications, {count, plural, one {# unread} other {# unread}}',
  },
  copyMessage: {
    id: 'komunicare.components.Board.copyMessage',
    defaultMessage: 'Copied to clipboard!',
  },
  clicksToUnlock: {
    id: 'komunicare.components.Board.clicksToUnlock',
    defaultMessage: 'clicks to unlock',
  },
  scannerHowToDeactivate: {
    id: 'komunicare.components.Board.scannerHowToDeactivate',
    defaultMessage: 'Press Escape 4 times to deactivate Scanner.',
  },
  scannerManualStrategy: {
    id: 'komunicare.components.Board.scannerManualStrategy',
    defaultMessage:
      'Scanner advances with space bar key, press enter to select an item.',
  },
  scannerAutomaticStrategy: {
    id: 'komunicare.components.Board.scannerAutomaticStrategy',
    defaultMessage:
      'Scanner will iterate over elements, press any key to select them.',
  },
  userProfileLocked: {
    id: 'komunicare.components.Board.userProfileLocked',
    defaultMessage:
      'User Profile is locked, please unlock settings to see your user profile.',
  },
  boardMissed: {
    id: 'komunicare.components.Board.boardMissed',
    defaultMessage:
      'We are sorry but we have missed this folder / board. We recommend you to create it again.',
  },
  copyPublicBoardTitle: {
    id: 'komunicare.components.Board.copyPublicBoardTitle',
    defaultMessage: 'Do you want to copy a public board?',
  },
  copyPublicBoardDesc: {
    id: 'komunicare.components.Board.copyPublicBoardDesc',
    defaultMessage:
      'You are trying to open a public shared board. In order to use and edit this board you have to copy it into your communicator boards.',
  },
  blockedPrivateBoardTitle: {
    id: 'komunicare.components.Board.blockedPrivateBoardTitle',
    defaultMessage: 'Private board!',
  },
  blockedPrivateBoardDesc: {
    id: 'komunicare.components.Board.blockedPrivateBoardDesc',
    defaultMessage:
      'You are trying to open a private board. In order to use and edit this board you have to ask author to publish the board.',
  },
  boardCopyCancel: {
    id: 'komunicare.components.Board.boardCopyCancel',
    defaultMessage: 'Cancel',
  },
  boardCopyAccept: {
    id: 'komunicare.components.Board.boardCopyAccept',
    defaultMessage: 'Accept',
  },
  boardCopiedSuccessfully: {
    id: 'komunicare.components.Board.boardCopiedSuccessfully',
    defaultMessage: 'Board successfully added to your Communicator.',
  },
  boardCopyError: {
    id: 'komunicare.components.Board.boardCopyError',
    defaultMessage: 'ERROR: There was an error trying to get the board.',
  },
  originalCommunicatorCopyNotice: {
    id: 'komunicare.components.Board.originalCommunicatorCopyNotice',
    defaultMessage:
      'You are editing an original communicator. A personal copy was created for your changes.',
  },
  originalCommunicatorCopyNamePrompt: {
    id: 'komunicare.components.Board.originalCommunicatorCopyNamePrompt',
    defaultMessage: 'Name your new communicator',
  },
  originalCommunicatorCopyDialogTitle: {
    id: 'komunicare.components.Board.originalCommunicatorCopyDialogTitle',
    defaultMessage: 'Create a personal copy of this communicator',
  },
  originalCommunicatorCopyDialogDescription: {
    id: 'komunicare.components.Board.originalCommunicatorCopyDialogDescription',
    defaultMessage:
      'You are editing a default communicator. Komunicare will create a personal copy so your changes are saved without modifying the original.',
  },
  originalCommunicatorCopySetAsStartup: {
    id: 'komunicare.components.Board.originalCommunicatorCopySetAsStartup',
    defaultMessage: 'Use this copy as my main communicator when I sign in',
  },
  deleteTilesConfirmTitle: {
    id: 'komunicare.components.Board.deleteTilesConfirmTitle',
    defaultMessage: 'Delete selected pictograms?',
  },
  deleteTilesConfirmDesc: {
    id: 'komunicare.components.Board.deleteTilesConfirmDesc',
    defaultMessage:
      'This action will remove the selected pictograms from this board.',
  },
  existingCopyFoundTitle: {
    id: 'komunicare.components.Board.existingCopyFoundTitle',
    defaultMessage: 'You already have a personal copy',
  },
  existingCopyFoundDesc: {
    id: 'komunicare.components.Board.existingCopyFoundDesc',
    defaultMessage:
      'You already have a copy of this communicator. We will redirect you there so you can make the change on your copy.',
  },
  emptyVoiceAlert: {
    id: 'komunicare.components.Board.emptyVoiceAlert',
    defaultMessage:
      'WARNING: we did not detect an available Text to Speech voice! Komunicare cannot work properly.',
  },
  offlineVoiceAlert: {
    id: 'komunicare.components.Board.offlineVoiceAlert',
    defaultMessage:
      'WARNING: you are using an online voice, but it looks you are offline!',
  },
  offlineChangeVoice: {
    id: 'komunicare.components.Board.offlineChangeVoice',
    defaultMessage: 'Change voice',
  },
  myBoardTitle: {
    id: 'komunicare.components.Board.myBoardTitle',
    defaultMessage: 'My Board',
  },
  noTitle: {
    id: 'komunicare.components.CommunicatorDialog.noTitle',
    defaultMessage: 'No title',
  },
  failedToCopy: {
    id: 'komunicare.components.Board.failedToCopy',
    defaultMessage: 'Failed to copy to clipboard',
  },
  walkthroughWelcome: {
    id: 'komunicare.components.Board.walkthroughWelcome',
    defaultMessage: 'Welcome to Komunicare!',
  },
  walkthroughChooseABoard: {
    id: 'komunicare.components.Board.walkthroughChooseABoard',
    defaultMessage: 'Choose a board to start',
  },
  walkthroughUnlock: {
    id: 'komunicare.components.Board.walkthroughUnlock',
    defaultMessage:
      'Press the lock button four times to unlock your options and settings.',
  },
  walkthroughStart: {
    id: 'komunicare.components.Board.walkthroughStart',
    defaultMessage:
      'Are you ready for a tour across Komunicare app and its awesome features?',
  },
  walkthroughSignInUp: {
    id: 'komunicare.components.Board.walkthroughSignInUp',
    defaultMessage: 'Sign in to personalise your communicator.',
  },
  walkthroughEditBoard: {
    id: 'komunicare.components.Board.walkthroughEditBoard',
    defaultMessage: 'Use this to edit the current board.',
  },
  walkthroughBoardName: {
    id: 'komunicare.components.Board.walkthroughBoardName',
    defaultMessage: 'Here you can change the name of the current board.',
  },
  walkthroughAddTile: {
    id: 'komunicare.components.Board.walkthroughAddTile',
    defaultMessage:
      'Here you can add a tile to the board. This tile can be a button, a folder or an empty board.',
  },
  walkthroughChangeBoard: {
    id: 'komunicare.components.Board.walkthroughChangeBoard',
    defaultMessage:
      'This is a dropdown menu from where you can go to another board in your communicator.',
  },
  walkthroughBuildCommunicator: {
    id: 'komunicare.components.Board.walkthroughBuildCommunicator',
    defaultMessage:
      'Here you can access your communicator, edit it and enrich it with more boards.',
  },
  walkthroughDefaultBoardsSelector: {
    id: 'komunicare.components.Board.walkthroughDefaultBoardsSelector',
    defaultMessage: 'Here you can switch back to the official Komunicare board',
  },
  walkthroughEndTour: {
    id: 'komunicare.components.Board.walkthroughEndTour',
    defaultMessage: 'End Tour',
  },
  walkthroughCloseTour: {
    id: 'komunicare.components.Board.walkthroughCloseTour',
    defaultMessage: 'Close Tour',
  },
  walkthroughBack: {
    id: 'komunicare.components.Board.walkthroughBack',
    defaultMessage: 'Back',
  },
  walkthroughNext: {
    id: 'komunicare.components.Board.walkthroughNext',
    defaultMessage: 'Next',
  },
  tilesCopiedSuccessfully: {
    id: 'komunicare.components.Board.tilesCopiedSuccessfully',
    defaultMessage: 'Tiles copied successfully.',
  },
  tilesPastedSuccessfully: {
    id: 'komunicare.components.Board.tilesPastedSuccessfully',
    defaultMessage: 'Tiles pasted successfully.',
  },
  tilesPastedError: {
    id: 'komunicare.components.Board.tilesPastedError',
    defaultMessage: 'WARNING: There was an error on tiles paste.',
  },
  live: {
    id: 'komunicare.components.Board.live',
    defaultMessage: 'LIVE',
  },
  writeAndSay: {
    id: 'komunicare.components.Board.writeAndSay',
    defaultMessage: 'Write and say',
  },
  screenKeyboard: {
    id: 'cboard.components.Board.screenKeyboard',
    defaultMessage: 'Screen keyboard',
  },
  //TODO, transtale to french
  outputPlaySpeech: {
    id: 'komunicare.components.Output.playSpeech',
    defaultMessage: 'Play Speech',
  },
  outputStopSpeech: {
    id: 'komunicare.components.Output.stopSpeech',
    defaultMessage: 'Stop Speech',
  },
  outputCleanSpeech: {
    id: 'komunicare.components.Output.cleanSpeech',
    defaultMessage: 'Clean Speech',
  },
  needSubscribe: {
    id: 'komunicare.components.Output.needSubscribe',
    defaultMessage: 'To continue using Komunicare, you have to subscribe',
  },
  subscribe: {
    id: 'komunicare.components.Output.subscribe',
    defaultMessage: 'Subscribe',
  },
});

export default messages;
