import { alpha3TToAlpha2 } from '@cospired/i18n-iso-languages';
import { alpha3ToAlpha2 } from 'i18n-iso-countries';

import { APP_LANGS, DEFAULT_LANG } from './domains/app/components/App/App.constants';
import { EMPTY_VOICES } from './providers/SpeechProvider/SpeechProvider.constants';
import { Voice } from './types/speech';

const splitLangRgx: RegExp = /[_-]+/;
const CANONICAL_LANGUAGE_BY_PREFIX: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  it: 'it-IT',
  pt: 'pt-PT',
};

export async function importTranslation(
  lang: string,
): Promise<Record<string, string>> {
  const module = await import(`./translations/${lang}.json`);
  const typedModule = module as { default?: Record<string, string> };
  if (typedModule && typedModule.default) {
    return typedModule.default;
  }
  return module as Record<string, string>;
}

export function normalizeLanguageCode(lang: string): string {
  const splittedLang = lang.split(splitLangRgx);
  return splittedLang.length === 1
    ? splittedLang[0].toLowerCase()
    : `${splittedLang[0].toLowerCase()}-${splittedLang[1].toUpperCase()}`;
}

export function standardizeLanguageCode(lang: string): string {
  const splittedLang = lang.split(splitLangRgx);
  if (splittedLang.length < 1) {
    return lang;
  }
  const standardLang =
    splittedLang[0].length === 3
      ? alpha3TToAlpha2(splittedLang[0]) || splittedLang[0]
      : splittedLang[0];

  if (splittedLang.length === 1) {
    return standardLang;
  }

  const standardCountry =
    splittedLang[1].length === 3
      ? alpha3ToAlpha2(splittedLang[1]) || splittedLang[1]
      : splittedLang[1];

  return `${standardLang}-${standardCountry}`;
}

export function getDefaultLang(langs: string[]): string {
  const fallbackLang = langs.includes(DEFAULT_LANG) ? DEFAULT_LANG : langs[0];
  if (typeof window === 'undefined' || !window.navigator) {
    return fallbackLang;
  }

  const browserLangs =
    window.navigator.languages && window.navigator.languages.length
      ? window.navigator.languages
      : [window.navigator.language];
  const normalizedAppLangs = langs.map((lang) =>
    normalizeLanguageCode(standardizeLanguageCode(lang)),
  );

  for (const browserLang of browserLangs) {
    if (!browserLang) {
      continue;
    }
    const normalizedBrowserLang = normalizeLanguageCode(
      standardizeLanguageCode(browserLang),
    );
    const exactIndex = normalizedAppLangs.indexOf(normalizedBrowserLang);
    if (exactIndex >= 0) {
      return langs[exactIndex];
    }
  }

  for (const browserLang of browserLangs) {
    if (!browserLang) {
      continue;
    }
    const normalizedBrowserLang = normalizeLanguageCode(
      standardizeLanguageCode(browserLang),
    );
    const prefix = normalizedBrowserLang.slice(0, 2);
    const prefixIndex = normalizedAppLangs.findIndex(
      (lang) => lang.slice(0, 2) === prefix,
    );
    if (prefixIndex >= 0) {
      return langs[prefixIndex];
    }
  }

  return fallbackLang;
}

export function getVoicesLangs(voices: Voice[]): string[] {
  let langs = Array.from(new Set(voices.map((voice) => voice.lang))).sort();
  langs = langs.map((lang) =>
    normalizeLanguageCode(standardizeLanguageCode(lang)),
  );
  langs = langs.map((lang) => {
    const prefix = lang.slice(0, 2).toLowerCase();
    return CANONICAL_LANGUAGE_BY_PREFIX[prefix] || lang;
  });
  langs = Array.from(new Set(langs)).sort();
  return langs.filter((lang) => APP_LANGS.includes(lang));
}

export function getSupportedLangs(voices: Voice[]): string[] {
  let supportedLangs: string[] = [];
  if (voices.length) {
    const sLanguages = getVoicesLangs(voices);
    if (sLanguages !== undefined && sLanguages.length) {
      supportedLangs = sLanguages.filter((lang) => APP_LANGS.includes(lang));
    }
  }
  return supportedLangs;
}

export function filterLocalLangs(voices: Voice[]): string[] {
  const localVoices = Array.from(
    new Set(voices.filter((voice) => voice.voiceSource === 'local')),
  ).sort();
  let localLangs = localVoices.map((voice) => voice.lang);
  localLangs = localLangs.map((lang) =>
    normalizeLanguageCode(standardizeLanguageCode(lang)),
  );
  localLangs = localLangs.map((lang) => {
    const prefix = lang.slice(0, 2).toLowerCase();
    return CANONICAL_LANGUAGE_BY_PREFIX[prefix] || lang;
  });
  localLangs = Array.from(new Set(localLangs)).sort();
  return localLangs.filter((lang) => APP_LANGS.includes(lang));
}

export function getVoiceURI(language: string, voices: Voice[]): string {
  const nVoices = voices.map(({ voiceURI, name, lang }) => ({
    voiceURI,
    name,
    lang: normalizeLanguageCode(standardizeLanguageCode(lang)),
  }));

  // special case for tetum-language
  if (language === 'pt-TL') {
    const langs = voices.map((voice) => voice.lang);
    if (langs.includes('pt-PT')) {
      language = 'pt-PT';
    } else if (langs.includes('pt-BR')) {
      language = 'pt-BR';
    }
  }

  const nVoice = nVoices.find(
    (voice) => voice.lang.substring(0, 2) === language.substring(0, 2),
  );
  return typeof nVoice !== 'undefined' ? nVoice.voiceURI : EMPTY_VOICES;
}
