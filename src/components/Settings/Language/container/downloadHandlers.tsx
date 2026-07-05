import React from 'react';

import { openExternalUrl } from '../../../../platform/browser';
import { DownloadingLang } from '../../../../types/language';
import { LanguageComponentState, LanguageProps } from '../types';

export const downloadableLangClick = (
  event: React.MouseEvent,
  downloadingLangData: DownloadingLang,
  state: LanguageComponentState,
  setState: (newState: Partial<LanguageComponentState>) => void,
  props: LanguageProps,
): void => {
  const { avaliableAndDownloadablesLangs } = state.downloadablesLangs as any;
  const { lang: appLang, localLangs } = props;
  const continueOnline = !!(
    avaliableAndDownloadablesLangs
      .map((langTtsData) => langTtsData.lang)
      .filter((availableLang) => !localLangs.includes(availableLang))
      .includes(downloadingLangData.lang) &&
    appLang !== downloadingLangData.lang
  );
  setState({
    openDialog: {
      open: true,
      downloadingLangData: { ...downloadingLangData, continueOnline },
    },
  });
  event.stopPropagation();
};

export const onDownloadLocalVoiceClick = (
  event: React.MouseEvent,
  downloadingLangData: DownloadingLang,
  state: LanguageComponentState,
  setState: (newState: Partial<LanguageComponentState>) => void,
  props: LanguageProps,
): void => {
  const { avaliableAndDownloadablesLangs } = state.downloadablesLangs as any;
  const { localLangs, lang: appLang, setDownloadingLang } = props;
  const continueOnline = !!(
    avaliableAndDownloadablesLangs
      .map((langTtsData) => langTtsData.lang)
      .filter((availableLang) => !localLangs.includes(availableLang))
      .includes(downloadingLangData.lang) &&
    appLang !== downloadingLangData.lang
  );
  const { marketId, lang, ttsName } = downloadingLangData;
  const downloadingLangState = {
    isdownloading: true,
    isDiferentTts: false,
    engineName: ttsName,
    marketId: marketId,
    selectedLang: lang,
    firstClick: true,
    continueOnline,
  };
  setDownloadingLang(downloadingLangState);
  setState({
    downloadingLangError: {
      ttsError: false,
      langError: true,
    },
  });
};

export const onDialogAccepted = (
  downloadingLangData: DownloadingLang,
  setState: (newState: Partial<LanguageComponentState>) => void,
  props: LanguageProps,
  handleSubmit: (lang: string) => void,
  _pauseCallback: () => void,
): void => {
  const { marketId, lang, ttsName, continueOnline } = downloadingLangData;
  const { setDownloadingLang } = props;
  setState({ openDialog: { open: false, downloadingLangData: {} as any } });
  const downloadingLangState = {
    isdownloading: true,
    isDiferentTts: false,
    engineName: ttsName,
    marketId: marketId,
    selectedLang: lang,
  };
  setDownloadingLang(downloadingLangState);
  if (continueOnline) handleSubmit(lang);
  if (marketId) {
    void openExternalUrl(
      `https://play.google.com/store/apps/details?id=${marketId}`,
    );
  }
};

export const langOnAvailableTtsClick = async (
  event: React.MouseEvent,
  downloadingLangData: DownloadingLang,
  firstClick: boolean = false,
  state: LanguageComponentState,
  setState: (newState: Partial<LanguageComponentState>) => void,
  props: LanguageProps,
): Promise<void> => {
  const { setDownloadingLang, ttsEngine, localLangs, lang: appLang } = props;
  const { ttsName, lang, marketId } = downloadingLangData;
  const { avaliableAndDownloadablesLangs } = state.downloadablesLangs as any;

  const continueOnline = !!(
    avaliableAndDownloadablesLangs
      .map((langTtsData) => langTtsData.lang)
      .filter((availableLang) => !localLangs.includes(availableLang))
      .includes(downloadingLangData.lang) && appLang !== lang
  );

  if (ttsEngine.name === ttsName) {
    const downloadingLangState = {
      isdownloading: true,
      isDiferentTts: false,
      engineName: ttsName,
      marketId: marketId,
      selectedLang: lang,
      continueOnline,
      firstClick,
    };
    setDownloadingLang(downloadingLangState);
    setState({
      downloadingLangError: {
        ttsError: false,
        langError: true,
      },
    });
    return;
  }
  setState({ downloadLangLoading: true } as any);
  const downloadingLangState = {
    isdownloading: true,
    isDiferentTts: true,
    engineName: ttsName,
    marketId: marketId,
    selectedLang: lang,
    continueOnline,
    firstClick,
  };
  setDownloadingLang(downloadingLangState);
};
