import { defineMessages } from 'react-intl';

import {
  DISPLAY_SIZE_STANDARD,
  DISPLAY_SIZE_LARGE,
  DISPLAY_SIZE_EXTRALARGE,
  LABEL_POSITION_ABOVE,
  LABEL_POSITION_BELOW,
  LABEL_POSITION_HIDDEN,
} from './Devices.constants';

export default defineMessages({
  display: {
    id: 'komunicare.components.Settings.Display.display',
    defaultMessage: 'Display',
  },
  [DISPLAY_SIZE_STANDARD]: {
    id: 'komunicare.components.Settings.Display.StandardSize',
    defaultMessage: 'Standard',
  },
  [DISPLAY_SIZE_LARGE]: {
    id: 'komunicare.components.Settings.Display.LargeSize',
    defaultMessage: 'Large',
  },
  [DISPLAY_SIZE_EXTRALARGE]: {
    id: 'komunicare.components.Settings.Display.ExtraLargeSize',
    defaultMessage: 'Extra Large',
  },
  [LABEL_POSITION_ABOVE]: {
    id: 'komunicare.components.Settings.Display.LabelPositionAbove',
    defaultMessage: 'Above',
  },
  [LABEL_POSITION_BELOW]: {
    id: 'komunicare.components.Settings.Display.LabelPositionBelow',
    defaultMessage: 'Below',
  },
  [LABEL_POSITION_HIDDEN]: {
    id: 'komunicare.components.Settings.Display.LabelPositionHidden',
    defaultMessage: 'Hidden',
  },
  uiSize: {
    id: 'komunicare.components.Settings.Display.uiSize',
    defaultMessage: 'UI Size',
  },
  uiSizeSecondary: {
    id: 'komunicare.components.Settings.Display.uiSizeSecondary',
    defaultMessage: 'Elements size',
  },
  fontFamily: {
    id: 'komunicare.components.Settings.Display.fontFamily',
    defaultMessage: 'Font family',
  },
  fontFamilySecondary: {
    id: 'komunicare.components.Settings.Display.fontFamilySecondary',
    defaultMessage: 'Change the text font used in the entire application',
  },
  fontSize: {
    id: 'komunicare.components.Settings.Display.fontSize',
    defaultMessage: 'Font Size',
  },
  fontSizeSecondary: {
    id: 'komunicare.components.Settings.Display.fontSizeSecondary',
    defaultMessage: 'App font size',
  },
  labelPosition: {
    id: 'komunicare.components.Settings.Display.labelPosition',
    defaultMessage: 'Label Position',
  },
  labelPositionSecondary: {
    id: 'komunicare.components.Settings.Display.labelPositionSecondary',
    defaultMessage:
      'Whether labels on tiles should be visible, or positioned above or below',
  },
  outputHide: {
    id: 'komunicare.components.Settings.Display.outputHide',
    defaultMessage: 'Hide the output bar',
  },
  outputHideSecondary: {
    id: 'komunicare.components.Settings.Display.outputHideSecondary',
    defaultMessage:
      'Hides the white bar on the top where you build a sentence.',
  },
  outputIncreaseButtons: {
    id: 'komunicare.components.Settings.Display.outputIncreaseButtons',
    defaultMessage: 'Increase the size of action buttons on the output bar',
  },
  outputIncreaseButtonsSecondary: {
    id: 'komunicare.components.Settings.Display.outputIncreaseButtonsSecondary',
    defaultMessage:
      'Increase the size of the action buttons that are on the white bar where you build a sentence.',
  },
  darkTheme: {
    id: 'komunicare.components.Settings.Display.darkTheme',
    defaultMessage: 'Enable dark theme',
  },
  devices: {
    id: 'komunicare.components.Settings.Devices',
    defaultMessage: 'Devices',
  },
  device: {
    id: 'komunicare.components.Settings.Device',
    defaultMessage: 'Device',
  },
});
