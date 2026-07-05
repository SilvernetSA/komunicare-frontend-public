export type { TtsEngine } from './speech';

// LanguageState is defined in src/store/languageStore.ts where it is used.
// LanguageProps and LanguageComponentState are in src/components/Settings/Language/types.ts

export interface Language {
  id?: string;
  name?: string;
  code?: string;
  locale?: string;
}

export interface DownloadingLang {
  isDiferentTts: boolean;
  engineName: string;
  selectedLang: string;
  isdownloading: boolean;
  firstClick?: boolean;
  continueOnline?: boolean;
  lang?: string;
  marketId?: string;
  ttsName?: string;
}

export interface LanguageObject extends Language {
  lang: string;
  marketId: string;
  ttsName: string;
  langCode?: string;
  nativeName?: string;
  ttsAvailable?: boolean;
}

export interface DownloadableTts {
  langs: string[];
  marketId: string;
  name: string;
}
