import CheckIcon from '@mui/icons-material/Check';
import { Button } from '@mui/material';
import Chip from '@mui/material/Chip';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';
import { FormattedMessage, IntlShape } from 'react-intl';

import { isDownloadable } from './downloadableLanguage';
import { getFormattedName, getNativeName } from './languageHelpers';
import messages from '../Language.messages';

interface DownloadableLang {
  lang: string;
  marketId?: string;
  ttsName: string;
  ttsAvailable?: boolean;
}

interface TtsEngine {
  name: string;
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
  downloadablesLangs: {
    downloadablesOnly: DownloadableLang[];
    avaliableAndDownloadablesLangs: DownloadableLang[];
  };
}

export const createLangItems = (
  langs: string[],
  localLangs: string[],
  selectedLang: string,
  onLangClick: (lang: string) => void,
  avaliableAndDownloadablesLangs: DownloadableLang[],
  downloadableProps: DownloadableProps,
): React.ReactElement[] => {
  return langs.map((lang, index, array) => {
    const isLocalLang = localLangs.includes(lang);

    return (
      <ListItem
        id="language-list-item"
        component="div"
        divider={
          index !== array.length - 1 ||
          downloadableProps.downloadablesLangs.downloadablesOnly.length > 0
        }
        onClick={() => onLangClick(lang)}
        key={index}
        sx={{ cursor: 'pointer' }}
      >
        <div className="Language__LangMenuItemText">
          <ListItemText
            primary={getNativeName(lang, langs)}
            secondary={getFormattedName(lang)}
          />
          {!isLocalLang && (
            <Chip label="online" size="small" color="secondary" />
          )}
        </div>
        <div className="Language__RightContent">
          {avaliableAndDownloadablesLangs?.length >= 1
            ? isDownloadable(lang, downloadableProps as any)
            : null}
          {selectedLang === lang && (
            <CheckIcon className="Language__LangMenuItemCheck" />
          )}
        </div>
      </ListItem>
    );
  });
};

export const createDownloadableLangItems = (
  downloadablesLangsOnly: DownloadableLang[],
  ttsEnginesNames: string[],
  ttsEngine: TtsEngine,
  langOnAvailableTtsClick: (
    event: React.MouseEvent,
    downloadableLang: DownloadableLang,
    flag: boolean,
  ) => Promise<void>,
  onUninstalledLangClick: () => void,
  onDownloadLocalVoiceClick: (
    event: React.MouseEvent,
    downloadableLang: DownloadableLang,
  ) => void,
  onDownloadableLangClick: (
    event: React.MouseEvent,
    downloadableLang: DownloadableLang,
  ) => void,
  intl: IntlShape,
  langs: string[],
): React.ReactElement[] => {
  return (
    downloadablesLangsOnly?.map(({ lang, marketId, ttsName }, index, array) => {
      const availableTts = ttsEnginesNames.includes(ttsName);
      const sameTts = ttsEngine && ttsEngine.name === ttsName;
      return (
        <ListItem
          id="language-list-item"
          component="div"
          divider={index !== array.length - 1}
          onClick={
            availableTts
              ? async (event) =>
                  await langOnAvailableTtsClick(
                    event,
                    {
                      marketId,
                      lang,
                      ttsName,
                    },
                    true,
                  )
              : () => onUninstalledLangClick()
          }
          key={index}
          sx={{ cursor: 'pointer' }}
        >
          <div className="Language__LangMenuItemText">
            <ListItemText
              primary={getNativeName(lang, langs)}
              secondary={getFormattedName(lang)}
              className={'Language__LangListItemText'}
            />
            {(!availableTts || sameTts) && (
              <Chip
                label={<FormattedMessage {...messages.uninstalled} />}
                size="small"
                disabled={false}
              />
            )}
          </div>
          {availableTts && !sameTts && (
            <div className="Language__RightContent">
              <Button
                variant="outlined"
                color="primary"
                onClick={async (event) =>
                  await langOnAvailableTtsClick(
                    event,
                    {
                      marketId,
                      lang,
                      ttsName,
                    },
                    true,
                  )
                }
              >
                {intl.formatMessage(messages.configureLocalVoice)}
              </Button>
            </div>
          )}
          {(!availableTts || sameTts) && (
            <div className="Language__RightContent">
              <Button
                variant="outlined"
                color="primary"
                onClick={(event) =>
                  sameTts
                    ? onDownloadLocalVoiceClick(event, {
                        marketId,
                        lang,
                        ttsName,
                      })
                    : onDownloadableLangClick(event, {
                        marketId,
                        lang,
                        ttsName,
                      })
                }
              >
                <FormattedMessage {...messages.download} />
              </Button>
            </div>
          )}
        </ListItem>
      );
    }) || []
  );
};
