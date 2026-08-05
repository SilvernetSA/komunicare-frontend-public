import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { IntlProvider } from 'react-intl';

import { useNotificationStore } from '@/domains/notifications/stores/notificationStore';
import { DEFAULT_LANG } from '@/domains/settings/stores/language.constants';
import { useLanguageStore } from '@/domains/settings/stores/languageStore';
import { useSpeechStore } from '@/domains/settings/stores/voicesStore';
import { importTranslation } from '@/i18n';
// Bundled with the entry chunk so the app can always render — even if the
// dynamically-imported translation chunk fails to load (e.g. a stale
// service-worker cache after a deploy). DEFAULT_LANG is 'es-ES'.
import defaultMessages from '@/translations/es-ES.json';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const lang = useLanguageStore((state) => state.lang);
  const platformLangs = useSpeechStore((state) => state.langs);
  const [messages, setMessages] = useState<Record<string, string> | null>(null);

  const fetchMessages = useCallback(
    async (language: string): Promise<void> => {
      setMessages(null);

      try {
        const msgs = await importTranslation(language);
        setMessages(msgs);
      } catch {
        // Never leave the app blank: fall back to the bundled default
        // translation immediately. If the failure was a non-default language,
        // also switch the stored language so the rest of the app stays
        // consistent (which re-fetches and replaces these messages).
        setMessages(defaultMessages as Record<string, string>);
        if (!platformLangs?.includes(DEFAULT_LANG)) {
          useLanguageStore.getState().setLangs({
            langs: [...(platformLangs || []), DEFAULT_LANG],
            localLangs: [],
          });
        }
        if (language !== DEFAULT_LANG) {
          useLanguageStore.getState().changeLang(DEFAULT_LANG);
        }
        useNotificationStore
          .getState()
          .showNotification(
            `A ${language} translation was not found!. Go to Settings if you want to change language.`,
          );
      }
    },
    [platformLangs],
  );

  useEffect(() => {
    if (lang) {
      void fetchMessages(lang);
    } else {
      void fetchMessages(DEFAULT_LANG);
    }
  }, [lang, fetchMessages]);

  const locale = lang ? lang.slice(0, 2) : DEFAULT_LANG.slice(0, 2);

  if (!messages) {
    return null;
  }

  return (
    <IntlProvider locale={locale} key={locale} messages={messages}>
      {React.Children.only(children)}
    </IntlProvider>
  );
};

export default LanguageProvider;
