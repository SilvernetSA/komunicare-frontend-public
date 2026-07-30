import React, { useState, useEffect, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import {
  downloadableLangClick,
  onDownloadLocalVoiceClick,
  onDialogAccepted,
  langOnAvailableTtsClick,
} from './container/downloadHandlers';
import {
  onErrorDialogAccepted,
  onErrorDialogCancel,
} from './container/errorHandlers';
import { handleSubmit, handleSetTtsEngine } from './container/LanguageHandlers';
import { sortLangs } from './container/languageHelpers';
import {
  refreshDownloadLanguage,
  pauseCallback,
} from './container/languageLifecycle';
import { getInitialState } from './container/LanguageState';
import DownloadDialog from './DownloadDialog';
import DownloadingLangErrorDialog from './downloadingLangErrorDialog';
import Language from './Language.component';
import messages from './Language.messages';
import { LanguageComponentState, LanguageProps } from './types';
import {
  getVoices,
  setTtsEngine,
  updateLangSpeechStatus,
} from '@/providers/SpeechProvider/speechService';
import { useLanguageStore } from '@/domains/settings/stores/languageStore';
import { useNotificationStore } from '@/domains/notifications/stores/notificationStore';
import { useSpeechStore } from '@/domains/settings/stores/voicesStore';

export const LanguageContainer: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const lang = useLanguageStore((state) => state.lang);
  const langs = useLanguageStore((state) => state.langs);
  const localLangs = useLanguageStore((state) => state.localLangs);
  const langsFetched = useLanguageStore((state) => state.langsFetched);
  const downloadingLang = useLanguageStore((state) => state.downloadingLang);
  const ttsEngines = useSpeechStore((state) => state.ttsEngines);
  const ttsEngine = useSpeechStore((state) => state.ttsEngine);
  const setDownloadingLang = useLanguageStore.getState().setDownloadingLang;
  const showNotification = useNotificationStore.getState().showNotification;
  const [state, setState] = useState<LanguageComponentState>(
    getInitialState(lang),
  );

  const setStateWrapper = (updates: Partial<LanguageComponentState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };
  const languageStoreProps: Omit<LanguageProps, 'navigate'> = {
    lang,
    localLangs,
    setDownloadingLang,
    showNotification,
    ttsEngine,
    langs,
    downloadingLang,
    ttsEngines,
  };
  const languageStorePropsWithDefaults: Omit<LanguageProps, 'navigate'> = {
    ...languageStoreProps,
    localLangs: localLangs || [],
    ttsEngines: ttsEngines || [],
  };
  const languageLifecycleProps: LanguageProps = {
    ...languageStoreProps,
    navigate,
  };

  const handleSubmitLocal = async (optionalLang?: string) => {
    const selectedLang = optionalLang || state.selectedLang;
    await handleSubmit(selectedLang, (nextLang: string) =>
      useLanguageStore.getState().changeLang(nextLang),
    );
  };

  const handleSetTtsEngineLocal = async (engineName: string) => {
    await handleSetTtsEngine(engineName, {
      setTtsEngine: (name: string) => setTtsEngine(name),
      getVoices: () => getVoices(),
      updateLangSpeechStatus: async (voices: unknown[]) => {
        await updateLangSpeechStatus(voices as any);
      },
    });
  };

  const refreshDownloadLanguageLocal = async () => {
    await refreshDownloadLanguage(
      state,
      setStateWrapper,
      languageLifecycleProps,
      handleSetTtsEngineLocal,
      handleSubmitLocal,
    );
  };

  const refreshDownloadLanguageRef = useRef(refreshDownloadLanguageLocal);
  refreshDownloadLanguageRef.current = refreshDownloadLanguageLocal;

  useEffect(() => {
    const isdownloading = downloadingLang?.isdownloading;

    if (langsFetched) {
      setState((prev) => ({ ...prev, downloadLangLoading: true }));
      void refreshDownloadLanguageRef.current();
    }
    if (isdownloading) {
      void refreshDownloadLanguageRef.current();
    }
  }, [langsFetched, downloadingLang?.isdownloading]);

  const {
    openDialog,
    downloadingLangError,
    downloadLangLoading,
    downloadablesLangs,
  } = state;

  const { open, downloadingLangData } = openDialog || {
    open: false,
    downloadingLangData: {},
  };
  const { ttsError, langError } = downloadingLangError || {
    ttsError: false,
    langError: false,
  };
  const sortedLangs = sortLangs(lang, langs, localLangs || []);

  return (
    <>
      <Language
        intl={intl}
        selectedLang={state.selectedLang}
        langs={sortedLangs}
        localLangs={localLangs || []}
        ttsEngines={ttsEngines || []}
        ttsEngine={ttsEngine || { name: '' }}
        onLangClick={(selectedLang: string) =>
          setState((prev) => ({ ...prev, selectedLang }))
        }
        onClose={() => {
          if (state.downloadLangLoading) return;
          navigate('/settings');
        }}
        onSubmitLang={handleSubmitLocal}
        onSetTtsEngine={handleSetTtsEngineLocal}
        downloadablesLangs={
          (downloadablesLangs as any) || {
            avaliableAndDownloadablesLangs: [],
            downloadablesOnly: [],
          }
        }
        onDownloadableLangClick={(event, downloadingLangData) =>
          downloadableLangClick(
            event as any,
            downloadingLangData as any,
            state,
            setStateWrapper,
            languageStoreProps,
          )
        }
        onUninstalledLangClick={() =>
          showNotification(
            intl.formatMessage(messages.uninstalledLangNotification),
          )
        }
        langOnAvailableTtsClick={async (
          event,
          downloadingLangData,
          firstClick = false,
        ) =>
          await langOnAvailableTtsClick(
            event as any,
            downloadingLangData as any,
            firstClick,
            state,
            setStateWrapper,
            languageStoreProps,
          )
        }
        onDownloadLocalVoiceClick={(event, downloadingLangData) =>
          onDownloadLocalVoiceClick(
            event as any,
            downloadingLangData as any,
            state,
            setStateWrapper,
            languageStoreProps,
          )
        }
        downloadLangLoading={downloadLangLoading}
        language={{ lang }}
      />
      <DownloadDialog
        onClose={() =>
          setState((prev) => ({
            ...prev,
            openDialog: { open: false, downloadingLangData: {} as any },
          }))
        }
        onDialogAcepted={(dialogData) =>
          onDialogAccepted(
            dialogData as any,
            setStateWrapper,
            languageStoreProps,
            handleSubmitLocal,
            () => pauseCallback(languageStoreProps),
          )
        }
        downloadingLangData={downloadingLangData as any}
        open={open}
      />
      <DownloadingLangErrorDialog
        onClose={() =>
          onErrorDialogCancel(
            state,
            setStateWrapper,
            languageStorePropsWithDefaults,
            (selectedLang: string) =>
              setState((prev) => ({ ...prev, selectedLang })),
          )
        }
        onDialogAcepted={() =>
          onErrorDialogAccepted(
            state,
            setStateWrapper,
            languageStorePropsWithDefaults,
            handleSubmitLocal,
            () => pauseCallback(languageStoreProps),
          )
        }
        downloadingLangData={downloadingLangData as any}
        open={ttsError || langError}
        downloadingLangError={downloadingLangError}
        downloadingLangState={downloadingLang as any}
      />
    </>
  );
};

export default LanguageContainer;
