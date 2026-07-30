import { openExternalUrl } from '@/platform/browser';
import { LanguageComponentState, LanguageProps } from '../types';

export const onErrorDialogAccepted = (
  state: LanguageComponentState,
  setState: (newState: Partial<LanguageComponentState>) => void,
  props: LanguageProps,
  handleSubmit: (lang: string) => void,
  _pauseCallback: () => void,
): void => {
  const { ttsError } = state.downloadingLangError;
  const { marketId, continueOnline, lang } = props.downloadingLang;

  const openStorePage = (): void => {
    if (!marketId) {
      return;
    }
    void openExternalUrl(
      `https://play.google.com/store/apps/details?id=${marketId}`,
    );
  };

  if (continueOnline) handleSubmit(lang);
  if (ttsError) {
    setState({
      downloadingLangError: { ttsError: false, langError: false },
    });
    openStorePage();
    return;
  }
  setState({
    downloadingLangError: { ttsError: false, langError: false },
  });
  openStorePage();
};

export const onErrorDialogCancel = (
  state: LanguageComponentState,
  setState: (newState: Partial<LanguageComponentState>) => void,
  props: LanguageProps,
  handleLangClick: (lang: string) => void,
): void => {
  const downloadingLangState = {
    isdownloading: false,
  };

  const { selectedLang, continueOnline } = props.downloadingLang;
  props.setDownloadingLang(downloadingLangState as any);
  if (continueOnline) handleLangClick(selectedLang);

  setState({
    downloadingLangError: {
      ttsError: false,
      langError: false,
    },
  });
};
