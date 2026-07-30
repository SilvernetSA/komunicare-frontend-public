// Define types for your action constants
export const FINISH_FIRST_VISIT: string = 'komunicare/App/FINISH_FIRST_VISIT';
export const DISABLE_TOUR: string = 'komunicare/App/DISABLE_TOUR';
export const ENABLE_ALL_TOURS: string = 'komunicare/App/ENABLE_ALL_TOURS';
export const UPDATE_CONNECTIVITY: string = 'komunicare/App/UPDATE_CONNECTIVITY';
export const UPDATE_DISPLAY_SETTINGS: string =
  'komunicare/App/UPDATE_DISPLAY_SETTINGS';
export const UPDATE_DEVICES_SETTINGS: string =
  'komunicare/App/UPDATE_DEVICES_SETTINGS';
export const UPDATE_NAVIGATION_SETTINGS: string =
  'komunicare/App/UPDATE_NAVIGATION_SETTINGS';
export const UPDATE_USER_DATA: string = 'komunicare/App/UPDATE_USER_DATA';
export const SET_UNLOGGED_USER_LOCATION: string =
  'komunicare/App/SET_UNLOGGED_USER_LOCATION';
export const UPDATE_IMPROVED_PHRASE: string =
  'komunicare/App/UPDATE_IMPROVED_PHRASE';

// Type definition for language codes
type LanguageCode = string;

// Define the default language and available languages
export const DEFAULT_LANG: LanguageCode = 'es-ES';
// export const DEFAULT_LANG: LanguageCode = 'en-US';
export const APP_LANGS: LanguageCode[] = [
  'en-US',
  'es-ES',
  'fr-FR',
  'it-IT',
  'pt-PT',
];
