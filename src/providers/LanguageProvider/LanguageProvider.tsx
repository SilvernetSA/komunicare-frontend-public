import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { IntlProvider } from 'react-intl';

import { DEFAULT_LANG } from '../../components/App/App.constants';
import { importTranslation } from '../../i18n';
import { useLanguageStore } from '../../store/languageStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useSpeechStore } from '../../store/voicesStore';

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
        if (!platformLangs?.includes(DEFAULT_LANG)) {
          useLanguageStore.getState().setLangs({
            langs: [...(platformLangs || []), DEFAULT_LANG],
            localLangs: [],
          });
        }
        useLanguageStore.getState().changeLang(DEFAULT_LANG);
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
