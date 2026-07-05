import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { APP_LANGS } from '../components/App/App.constants';
import { getDefaultLang } from '../i18n';
import { applyLoginSuccessFactory } from './languageStore/applyLoginSuccessFactory';
import { changeLangFactory } from './languageStore/changeLangFactory';
import { fetchLanguageFactory } from './languageStore/fetchLanguageFactory';

import type { Language } from '../types/language';
import type { DownloadingLang } from '../types/language';

export interface LanguageState {
  lang: string;
  dir: 'ltr' | 'rtl';
  langs: string[];
  localLangs: string[];
  langsFetched: boolean;
  downloadingLang: DownloadingLang;
}

const LANGUAGE_CACHE_TTL_MS = 5 * 60 * 1000;

const initialLanguageState: LanguageState = {
  lang: getDefaultLang(APP_LANGS),
  dir: 'ltr',
  langs: [],
  localLangs: [],
  langsFetched: false,
  downloadingLang: {
    isDiferentTts: false,
    engineName: '',
    selectedLang: '',
    isdownloading: false,
  },
};

export interface LanguageStore extends LanguageState {
  changeLang: (lang: string) => void;
  setLangs: (payload: { langs: string[]; localLangs: string[] }) => void;
  setDownloadingLang: (payload: DownloadingLang) => void;
  applyLoginSuccess: (payload: unknown) => void;
  fetchLanguage: (lang: string) => Promise<Language | null>;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => {
      const languageCache = {
        byLang: new Map<
          string,
          { fetchedAt: number; language: Language | null }
        >(),
        inFlight: new Map<string, Promise<Language | null>>(),
        ttlMs: LANGUAGE_CACHE_TTL_MS,
      };

      return {
        ...initialLanguageState,

        changeLang: changeLangFactory(set),

        setLangs: (payload) => {
          set({
            langs: payload.langs.sort(),
            localLangs: payload.localLangs || [],
            langsFetched: true,
          });
        },

        setDownloadingLang: (payload) => {
          set({ downloadingLang: payload });
        },

        applyLoginSuccess: applyLoginSuccessFactory(set, get),

        fetchLanguage: fetchLanguageFactory(languageCache),
      };
    },
    {
      name: 'language-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Persist only the chosen UI language (and its direction); everything
      // else is runtime state derived on load. Once the user picks a language
      // — or it's set from their account on login — it survives reloads instead
      // of falling back to the browser language each time.
      partialize: (state) => ({ lang: state.lang, dir: state.dir }),
    },
  ),
);
