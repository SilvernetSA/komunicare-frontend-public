import { defineMessages } from 'react-intl';

const messages = {
  navigation: {
    id: 'komunicare.components.Settings.Navigation.navigation',
    defaultMessage: 'Navigation & Buttons',
  },
  enable: {
    id: 'komunicare.components.Settings.Navigation.enable',
    defaultMessage: 'Enable context aware back button',
  },
  enableSecondary: {
    id: 'komunicare.components.Settings.Navigation.enableSecondary',
    defaultMessage:
      'Shows big back buttons. Select the desired style in navigation buttons style section.',
  },
  quickUnlock: {
    id: 'komunicare.components.Settings.Navigation.quickUnlock',
    defaultMessage: 'Enable quick settings unlock',
  },
  quickUnlockSecondary: {
    id: 'komunicare.components.Settings.Navigation.quickUnlockSecondary',
    defaultMessage: 'Unlocks the settings with a single click',
  },
  shareShow: {
    id: 'komunicare.components.Settings.Navigation.shareShow',
    defaultMessage: 'Show the share phrase button',
  },
  shareShowSecondary: {
    id: 'komunicare.components.Settings.Navigation.shareShowSecondary',
    defaultMessage:
      'Show a share button (next to backspace button) that allow to share the selected symbols.',
  },
  outputRemove: {
    id: 'komunicare.components.Settings.Navigation.outputRemove',
    defaultMessage: 'Remove symbols from the output bar',
  },
  outputRemoveSecondary: {
    id: 'komunicare.components.Settings.Navigation.outputRemoveSecondary',
    defaultMessage: 'Shows a "x" button on each symbol in order to remove it',
  },
  vocalizeFolders: {
    id: 'komunicare.components.Settings.Navigation.vocalizeFolders',
    defaultMessage: 'Enable folder vocalization',
  },
  vocalizeFoldersSecondary: {
    id: 'komunicare.components.Settings.Navigation.vocalizeFoldersSecondary',
    defaultMessage: "Reads a folder's name out loud when clicked",
  },
  bigScroll: {
    id: 'komunicare.components.Settings.Navigation.bigScroll',
    defaultMessage: 'Enable big scroll buttons',
  },
  bigScrollSecondary: {
    id: 'komunicare.components.Settings.Navigation.bigScrollSecondary',
    defaultMessage:
      'Shows big scroll buttons. Select the desired style in navigation buttons style section',
  },
  navigationButtonsStyle: {
    id: 'komunicare.components.Settings.Navigation.navigationButtonsStyle',
    defaultMessage: 'Navigation buttons style',
  },
  navigationButtonsStyleSecondary: {
    id: 'komunicare.components.Settings.Navigation.navigationButtonsStyleSecondary',
    defaultMessage:
      'Select the style of the context-aware back and big scroll buttons. On the sides is recommended for eye trackers',
  },
  onTheSides: {
    id: 'komunicare.components.Settings.Navigation.onTheSides',
    defaultMessage: 'On the sides',
  },
  onTop: {
    id: 'komunicare.components.Settings.Navigation.onTop',
    defaultMessage: 'On top',
  },
  activePlaySoundOnTouch: {
    id: 'komunicare.components.Settings.Navigation.activePlaySoundOnTouch',
    defaultMessage: 'Autoplay',
  },
  activePlaySoundOnTouchSecondary: {
    id: 'komunicare.components.Settings.Navigation.activePlaySoundOnTouchSecondary',
    defaultMessage:
      'Autoplay allows you to play the sound of the pictogram when you click on it. If it is deactivated, the sentence will only be played when you click the Play button',
  },
};

export default defineMessages(messages);
