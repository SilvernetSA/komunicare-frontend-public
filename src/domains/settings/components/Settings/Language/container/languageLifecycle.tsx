import React from 'react';
import { FormattedMessage } from 'react-intl';

import { prepareDownloadablesLanguages } from './languageHelpers';
import { IS_ANDROID } from '@/platform';
import { TtsEngine } from '@/types/language';
import downloadablesTts from '../downloadablesTts.json';
import messages from '../Language.messages';
import { LanguageProps, LanguageComponentState } from '../types';

type RefreshLanguageListProps = Pick<LanguageProps, 'ttsEngines' | 'langs'>;

export const lookDownloadingLang = async (
  state: LanguageComponentState,
  setState: (state: Partial<LanguageComponentState>) => void,
  props: LanguageProps,
  handleSetTtsEngine: (engineName: string) => Promise<void>,
  handleSubmit: (lang: string) => Promise<void>,
): Promise<void> => {
  const { isDiferentTts, engineName, selectedLang } = props.downloadingLang;

  const {
    setDownloadingLang,
    ttsEngines,
    ttsEngine,
    navigate,
    showNotification,
  } = props;

  const ttsEnginesNames = ttsEngines.map((tts: TtsEngine) => tts.name);
  if (!ttsEnginesNames.includes(engineName)) {
    setState({
      downloadingLangError: {
        ...state.downloadingLangError,
        ttsError: true,
      },
    });
    return;
  }
  if (ttsEngine.name !== engineName) {
    try {
      await handleSetTtsEngine(engineName);
    } catch {
      setState({
        downloadingLangError: {
          ttsError: false,
          langError: true,
        },
      });
    }
  }
  const localLangs = props.localLangs;
  if (!localLangs.includes(selectedLang)) {
    setState({
      downloadingLangError: {
        ttsError: false,
        langError: true,
      },
    });
    return;
  }
  const downloadingLangState = {
    isdownloading: false,
  };
  setDownloadingLang(downloadingLangState as any);
  setState({
    downloadingLangError: {
      ttsError: false,
      langError: false,
    },
    selectedLang: selectedLang,
  });
  refreshLanguageList(setState, props);
  if (isDiferentTts) return;
  await handleSubmit(selectedLang);
  showNotification(
    <FormattedMessage {...messages.instaledLangSuccesNotification} />,
  );
  navigate('/settings');
};

export const refreshLanguageList = (
  setState: (state: Partial<LanguageComponentState>) => void,
  props: RefreshLanguageListProps,
): void => {
  setState({
    downloadablesLangs: (IS_ANDROID
      ? prepareDownloadablesLanguages(downloadablesTts, props)
      : {
          avaliableAndDownloadablesLangs: [],
          downloadablesOnly: [],
        }) as any,
  });
};

export const refreshDownloadLanguage = async (
  state: LanguageComponentState,
  setState: (state: Partial<LanguageComponentState>) => void,
  props: LanguageProps,
  handleSetTtsEngine: (engineName: string) => Promise<void>,
  handleSubmit: (lang: string) => Promise<void>,
): Promise<void> => {
  const { isdownloading } = props.downloadingLang;

  if (isdownloading) {
    await lookDownloadingLang(
      state,
      setState,
      props,
      handleSetTtsEngine,
      handleSubmit,
    );
  } else {
    refreshLanguageList(setState, props);
  }
  setState({ downloadLangLoading: false });
};

export const pauseCallback = (props: LanguageProps): void => {
  const downloadingLangState = {
    ...props.downloadingLang,
    firstClick: false,
    continueOnline: false,
  };
  props.setDownloadingLang(downloadingLangState);
};
