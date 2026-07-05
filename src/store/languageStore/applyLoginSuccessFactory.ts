import type { StoreGet, StoreSet } from '../_shared/createStoreActions';
import type { LanguageStore } from '../languageStore';

export const applyLoginSuccessFactory =
  (set: StoreSet<LanguageStore>, get: StoreGet<LanguageStore>) =>
  (payload: unknown) => {
    const state = get();
    const settings = (payload as any)?.settings || {};
    const { language } = settings;

    const lang =
      language?.lang && state.langs.indexOf(language.lang) >= 0
        ? language.lang
        : state.lang;

    const locale = lang.slice(0, 2);
    const dir = locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr';
    set({ lang, dir });
  };
