import { useSpeechStore } from '../voicesStore';

import type { StoreSet } from '@/store/_shared/createStoreActions';
import type { LanguageStore } from '../languageStore';

export const changeLangFactory =
  (set: StoreSet<LanguageStore>) => (lang: string) => {
    const locale = lang.slice(0, 2);
    const dir = locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr';
    set({ lang, dir });
    useSpeechStore.getState().handleLanguageChange(lang);
  };
