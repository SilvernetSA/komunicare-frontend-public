import { Button } from '@mui/material';
import React from 'react';
import { IntlShape } from 'react-intl';

import messages from '../Language.messages';

interface DownloadableLang {
  lang: string;
  ttsName: string;
  ttsAvailable: boolean;
  marketId?: string;
}

interface TtsEngine {
  name: string;
}

interface DownloadablesLangs {
  avaliableAndDownloadablesLangs: DownloadableLang[];
}

interface DownloadableProps {
  intl: IntlShape;
  localLangs: string[];
  ttsEngine: TtsEngine;
  onDownloadLocalVoiceClick: (
    event: React.MouseEvent,
    downloadableLang: DownloadableLang,
  ) => void;
  langOnAvailableTtsClick: (
    event: React.MouseEvent,
    downloadableLang: DownloadableLang,
    flag: boolean,
  ) => Promise<void>;
  onDownloadableLangClick: (
    event: React.MouseEvent,
    downloadableLang: DownloadableLang,
  ) => void;
  downloadablesLangs: DownloadablesLangs;
}

export const isDownloadable = (
  lang: string,
  props: DownloadableProps,
): React.ReactElement | null => {
  const {
    intl,
    localLangs,
    ttsEngine,
    onDownloadLocalVoiceClick,
    langOnAvailableTtsClick,
    onDownloadableLangClick,
    downloadablesLangs,
  } = props;

  const { avaliableAndDownloadablesLangs } = downloadablesLangs;

  const downloadableLang = avaliableAndDownloadablesLangs.find(
    (downloadableLang) => downloadableLang.lang === lang,
  );

  const sameTts = ttsEngine && downloadableLang?.ttsName === ttsEngine.name;

  if (downloadableLang && !localLangs.includes(lang)) {
    return (
      <Button
        variant="outlined"
        color="primary"
        onClick={
          sameTts
            ? (event) => onDownloadLocalVoiceClick(event, downloadableLang)
            : downloadableLang.ttsAvailable
              ? async (event) =>
                  await langOnAvailableTtsClick(event, downloadableLang, true)
              : (event) => onDownloadableLangClick(event, downloadableLang)
        }
      >
        {!sameTts && downloadableLang?.ttsAvailable
          ? intl.formatMessage(messages.configureLocalVoice)
          : intl.formatMessage(messages.download)}
      </Button>
    );
  }

  return null;
};
