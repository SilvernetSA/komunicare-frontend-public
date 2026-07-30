import ISO6391 from 'iso-639-1';

import {
  DownloadableTts,
  LanguageObject,
  TtsEngine,
} from '@/types/language';
import { APP_LANGS } from '@/domains/app/components/App/App.constants';

interface Props {
  ttsEngines: TtsEngine[];
  langs: string[];
}

export const sortLangs = (
  activeLang: string,
  langs: string[] = [],
  localLangs: string[] = [],
): string[] => {
  const cloudLangs = langs.filter((lang) => !localLangs.includes(lang));
  let sortedLangs = localLangs.concat(cloudLangs);
  const activeLangIndex = sortedLangs.indexOf(activeLang);
  if (activeLangIndex > 0) {
    sortedLangs.splice(activeLangIndex, 1);
    sortedLangs.unshift(activeLang);
  }
  return sortedLangs;
};

export const prepareDownloadablesLanguages = (
  downloadablesTts: DownloadableTts[],
  props: Props,
) => {
  const getDownloadablesLanguages = (
    downloadablesTts: DownloadableTts[],
  ): LanguageObject[] => {
    const formatLangObject = (
      downloadablesLangs: LanguageObject[],
    ): LanguageObject[] => {
      return downloadablesLangs.map((langObject: LanguageObject) => {
        const { lang } = langObject;
        const code = lang.slice(0, 2).toLowerCase();
        langObject.langCode = code;
        langObject.nativeName = ISO6391.getNativeName(code);
        const showLangCode =
          downloadablesLangs.filter(
            (language: LanguageObject) => language.langCode === code,
          ).length > 1;

        const langFullCode = showLangCode ? `(${lang})` : '';
        langObject.nativeName = `${langObject.nativeName} ${langFullCode}`;
        return langObject;
      });
    };
    const downloadablesLangsArray = downloadablesTts.map(
      (tts: DownloadableTts) => {
        return { langs: tts.langs, marketId: tts.marketId, ttsName: tts.name };
      },
    );
    const identifiedLangsArray = downloadablesLangsArray.map(
      (langObject: { langs: string[]; marketId: string; ttsName: string }) =>
        langObject.langs.map((language: string) => {
          return {
            lang: language,
            marketId: langObject.marketId,
            ttsName: langObject.ttsName,
          };
        }),
    );
    const INITIAL_VALUE: LanguageObject[] = [];
    const downloadablesLangs = identifiedLangsArray.reduce(
      (accumulator: LanguageObject[], currentValue: LanguageObject[]) =>
        accumulator.concat(currentValue),
      INITIAL_VALUE,
    );
    const supportedDownloadables = downloadablesLangs.filter(({ lang }) =>
      APP_LANGS.includes(lang),
    );
    return formatLangObject(supportedDownloadables);
  };

  const filterAvailablesAndDownloadablesLangs = (
    downloadablesLangs: LanguageObject[],
  ): LanguageObject[] => {
    const { ttsEngines, langs } = props;
    const ttsEnginesNames = ttsEngines.map((tts: TtsEngine) => tts.name);

    const availableAndDownloadableLang = downloadablesLangs.filter(
      ({ lang }: LanguageObject) => langs.includes(lang),
    );

    return availableAndDownloadableLang.map((item: LanguageObject) => {
      item.ttsAvailable = ttsEnginesNames.includes(item.ttsName);
      return item;
    });
  };

  const filterDownloadablesOnlyLangs = (
    downloadables: LanguageObject[],
    availableAndDownloadables: LanguageObject[],
  ): LanguageObject[] => {
    return downloadables.filter(
      (downloadableLang: LanguageObject) =>
        !availableAndDownloadables.includes(downloadableLang),
    );
  };

  const downloadablesLangsList = getDownloadablesLanguages(downloadablesTts);
  const avaliableAndDownloadablesLangs = filterAvailablesAndDownloadablesLangs(
    downloadablesLangsList,
  );
  const downloadablesOnly = filterDownloadablesOnlyLangs(
    downloadablesLangsList,
    avaliableAndDownloadablesLangs,
  );
  return {
    avaliableAndDownloadablesLangs,
    downloadablesOnly,
  };
};
