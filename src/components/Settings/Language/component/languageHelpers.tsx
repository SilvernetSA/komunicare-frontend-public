import ISO6391 from 'iso-639-1';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from '../Language.messages';

export const loadMarkdownContent = async (
  lang: string,
  setMarkdown: (markdown: string) => void,
): Promise<void> => {
  let markdownPath = '';
  try {
    markdownPath = require(`../../../../translations/moreLanguages/${lang}.md`);
  } catch {
    markdownPath = require(`../../../../translations/moreLanguages/en-US.md`);
  }

  try {
    const response = await fetch(markdownPath);
    const text = await response.text();
    setMarkdown(text);
  } catch {
    setMarkdown('');
  }
};

export const getFormattedName = (lang: string): React.ReactElement => {
  const locale = lang.slice(0, 2).toLowerCase();
  let name = <FormattedMessage {...(messages as any)[locale]} />;

  //handle custom names
  if (lang === 'sr-ME') {
    name = <FormattedMessage {...(messages as any)['srme']} />;
  }
  return name;
};

export const getNativeName = (lang: string, langs: string[]): string => {
  const locale = lang.slice(0, 2).toLowerCase();
  const showLangCode =
    langs.filter((langCode) => langCode.slice(0, 2).toLowerCase() === locale)
      .length > 1;
  const langCode = showLangCode ? `(${lang})` : '';
  let nativeName = `${ISO6391.getNativeName(locale)} ${langCode}`;

  //handle custom native name
  if (lang === 'sr-ME') {
    nativeName = 'Crnogorski jezik';
  } else if (lang === 'sr-SP') {
    nativeName = `Српски језик ${langCode}`;
  } else if (lang === 'sr-RS') {
    nativeName = `Srpski jezik ${langCode}`;
  } else if (lang === 'pt-TL') {
    nativeName = `Tetum`;
  }
  return nativeName;
};
