import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { ErrorDialog } from './component/ErrorDialog';
import { LanguageHeader } from './component/LanguageHeader';
import {
  createLangItems,
  createDownloadableLangItems,
} from './component/languageListItems';
import {
  LoadingSpinner,
  InlineLoadingSpinner,
} from './component/LoadingSpinner';
import {
  handleTtsEngineChange,
  handleTtsErrorDialogClose,
} from './component/ttsEngineHandlers';
import { TtsEngineSelector } from './component/TtsEngineSelector';
import messages from './Language.messages';
import { IS_ANDROID } from '@/platform';
import { TtsEngine } from '@/types/language';
import FullScreenDialog from '@/domains/app/components/FullScreenDialog/FullScreenDialog';

import './../Settings.css';

interface LanguageProps {
  intl: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  langs: string[];
  localLangs?: string[];
  selectedLang: string;
  onLangClick: (lang: string) => void;
  onClose: () => void;
  onSubmitLang: (lang?: string) => void;
  language: { lang: string };
  ttsEngines: TtsEngine[];
  ttsEngine: TtsEngine;
  onSetTtsEngine: (engineName: string) => Promise<void>;
  downloadablesLangs: {
    avaliableAndDownloadablesLangs: unknown[];
    downloadablesOnly: unknown[];
  };
  onDownloadableLangClick?: (event: unknown, data: unknown) => void;
  langOnAvailableTtsClick?: (
    event: unknown,
    data: unknown,
    firstClick?: boolean,
  ) => Promise<void>;
  onDownloadLocalVoiceClick?: (event: unknown, data: unknown) => void;
  onUninstalledLangClick?: () => void;
  downloadLangLoading: boolean;
}

const Language: React.FC<LanguageProps> = ({
  langs = [],
  localLangs = [],
  selectedLang = '',
  intl,
  ttsEngine,
  ttsEngines,
  onLangClick,
  onClose,
  onSubmitLang,
  onSetTtsEngine,
  downloadablesLangs,
  onDownloadableLangClick,
  onUninstalledLangClick,
  onDownloadLocalVoiceClick,
  langOnAvailableTtsClick,
  downloadLangLoading,
}) => {
  const [loading, setLoading] = useState(false);
  const [ttsEngineState, setTtsEngineState] = useState(ttsEngine?.name || '');
  const [openTtsEngineError, setOpenTtsEngineError] = useState(false);

  useEffect(() => {
    if (ttsEngine?.name !== ttsEngineState) {
      setTtsEngineState(ttsEngine?.name || '');
      setLoading(false);
    }
  }, [ttsEngine?.name, ttsEngineState]);

  const handleTtsEngineChangeLocal = async (event: {
    target: { value: string };
  }): Promise<void> => {
    await handleTtsEngineChange(
      event as any,
      onSetTtsEngine,
      ttsEngine,
      setTtsEngineState,
      setLoading,
      setOpenTtsEngineError,
    );
  };

  const {
    downloadablesOnly: downloadablesLangsOnly,
    avaliableAndDownloadablesLangs,
  } = downloadablesLangs;

  const ttsEnginesNames = ttsEngines.map((tts: TtsEngine) => tts.name);

  const downloadableProps = {
    intl,
    localLangs,
    ttsEngine,
    onDownloadLocalVoiceClick,
    langOnAvailableTtsClick,
    onDownloadableLangClick,
    downloadablesLangs,
  };

  const langItems = createLangItems(
    langs,
    localLangs,
    selectedLang,
    onLangClick,
    avaliableAndDownloadablesLangs as any,
    downloadableProps as any,
  ) as any;

  const downloadableLangItems = createDownloadableLangItems(
    downloadablesLangsOnly as any,
    ttsEnginesNames,
    ttsEngine,
    langOnAvailableTtsClick,
    onUninstalledLangClick,
    onDownloadLocalVoiceClick,
    onDownloadableLangClick,
    intl as any,
    langs,
  ) as any;

  return (
    <FullScreenDialog
      open
      title={<FormattedMessage {...messages.language} />}
      onClose={onClose}
      onSubmit={onSubmitLang}
    >
      {downloadLangLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Paper>
            {IS_ANDROID && (
              <React.Fragment>
                <LanguageHeader
                  intl={intl}
                  messageKey="ttsEnginesSubheader"
                  defaultText="TTS Engines"
                />
                <TtsEngineSelector
                  ttsEngine={ttsEngineState}
                  ttsEngines={ttsEngines}
                  loading={loading}
                  onTtsEngineChange={handleTtsEngineChangeLocal}
                />
              </React.Fragment>
            )}
            {loading ? (
              <InlineLoadingSpinner />
            ) : (
              <>
                {IS_ANDROID && (
                  <LanguageHeader
                    intl={intl}
                    messageKey="availableLangsSubheader"
                    defaultText="Available Languages"
                  />
                )}
                <List>{langItems.map((item) => item)}</List>
                {downloadableLangItems.length > 0 && (
                  <>
                    <LanguageHeader
                      intl={intl}
                      messageKey="downloadLangSubheader"
                      defaultText="Download Languages"
                    />
                    <List>{downloadableLangItems.map((item) => item)}</List>
                  </>
                )}
              </>
            )}
            <ErrorDialog
              open={openTtsEngineError}
              onClose={() =>
                handleTtsErrorDialogClose(
                  onSetTtsEngine,
                  ttsEngine,
                  setOpenTtsEngineError,
                )
              }
              intl={intl}
            />
          </Paper>
        </>
      )}
    </FullScreenDialog>
  );
};

export default Language;
