// SettingsState is defined in src/store/settingsStore.ts where it is used.

import type { Device } from './device';
export type { Device } from './device';

export interface NavigationConfig {
  active: boolean;
  shareShowActive: boolean;
  bigScrollButtonsActive: boolean;
  navigationButtonsStyle: string;
  caBackButtonActive: boolean;
  quickUnlockActive: boolean;
  removeOutputActive: boolean;
  vocalizeFolders: boolean;
  liveMode: boolean;
  improvePhraseActive: boolean;
}

export interface NavigationSettings {
  caBackButtonActive?: boolean;
  bigScrollButtonsActive?: boolean;
  quickUnlockActive?: boolean;
  shareShowActive?: boolean;
  removeOutputActive?: boolean;
  vocalizeFolders?: boolean;
  liveMode?: boolean;
  playSoundOnTouchActive?: boolean;
  navigationButtonsStyle?: string;
}

export interface DisplaySettings {
  hideOutputActive?: boolean;
  increaseOutputButtons?: boolean;
  darkThemeActive?: boolean;
  uiSize: string;
  fontFamily?: string;
  fontSize?: string;
  labelPosition: string;
  [key: string]: unknown;
}

export interface Settings {
  id?: string;
  language?: Record<string, unknown>;
  speech?: Record<string, unknown>;
  display?: Record<string, unknown>;
  faceTracking?: Record<string, unknown>;
  navigation?: NavigationConfig;
  user?: string;
  devices?: Device[];
  selectedKeyboard?: 'EYE' | 'POINTER';
  keyboardDistribution?: 'VERTICAL' | 'HORIZONTAL';
  displaySettings?: DisplaySettings;
  navigationSettings?: NavigationSettings;
}
