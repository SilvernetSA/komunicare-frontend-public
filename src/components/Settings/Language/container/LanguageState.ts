import { LanguageComponentState } from '../types';

export const getInitialState = (lang: string): LanguageComponentState => ({
  selectedLang: lang,
  openDialog: { open: false, downloadingLangData: {} as any },
  downloadablesLangs: {
    avaliableAndDownloadablesLangs: [],
    downloadablesOnly: [],
  } as any,
  downloadLangLoading: true,
  downloadingLangError: { ttsError: false, langError: false },
});
