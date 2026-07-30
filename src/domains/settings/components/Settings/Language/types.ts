import type { DownloadingLang, DownloadableTts } from '@/types/language';
import type { TtsEngine } from '@/types/speech';
import type { ReactNode } from 'react';

export interface LanguageProps {
  downloadingLang: DownloadingLang;
  setDownloadingLang: (data: DownloadingLang) => void;
  ttsEngines: TtsEngine[];
  ttsEngine: TtsEngine;
  navigate?: (path: string) => void;
  showNotification: (message: ReactNode) => void;
  localLangs: string[];
  langs: string[];
  lang: string;
}

export interface LanguageComponentState {
  downloadingLangError: {
    ttsError: boolean;
    langError: boolean;
  };
  selectedLang?: string;
  downloadablesLangs?: DownloadableTts[];
  downloadLangLoading?: boolean;
  openDialog?: {
    open: boolean;
    downloadingLangData: DownloadingLang;
  };
}
