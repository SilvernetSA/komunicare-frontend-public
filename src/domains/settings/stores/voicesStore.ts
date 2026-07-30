import { create } from 'zustand';

import { normalizeLanguageCode, standardizeLanguageCode } from '@/i18n';
import { applyLoginSuccessFactory } from './voicesStore/applyLoginSuccessFactory';
import { fetchAzureVoicesFactory } from './voicesStore/fetchAzureVoicesFactory';
import { handleLanguageChangeAction } from './voicesStore/handleLanguageChange';
import { DEFAULT_LANG } from '@/domains/app/components/App/App.constants';
import { EMPTY_VOICES } from '@/providers/SpeechProvider/SpeechProvider.constants';
import { Voice, TtsEngine } from '@/types/speech';
import { SpeechState } from './voicesStore/types';

const initialSpeechState: SpeechState = {
  voices: [],
  ttsEngines: [],
  ttsDefaultEngine: null,
  ttsEngine: null,
  langs: [],
  options: {
    lang: '',
    voiceURI: null,
    isCloud: null,
    pitch: 1.0,
    rate: 1.0,
    volume: 1,
  },
  isSpeaking: false,
  cloudVoicesLoaded: false,
};

export interface VoicesStore extends SpeechState {
  receiveVoices: (voices: Voice[]) => void;
  changeVoice: (payload: {
    voiceURI: string;
    lang: string;
    isCloud?: boolean;
  }) => void;
  changePitch: (value: number) => void;
  changeRate: (value: number) => void;
  changeVolume: (value: number) => void;
  startSpeech: () => void;
  endSpeech: () => void;
  cancelSpeech: () => void;
  receiveTtsEngines: (engines: TtsEngine[]) => void;
  receiveTtsDefaultEngine: (engine: TtsEngine) => void;
  receiveTtsEngine: (engineName: string) => void;
  handleLanguageChange: (lang: string) => void;
  applyLoginSuccess: (payload: unknown) => void;
  fetchAzureVoices: () => Promise<Voice[]>;
}

export const useSpeechStore = create<VoicesStore>()((set, get) => {
  return {
    ...initialSpeechState,
    receiveVoices: (voices) => {
      const langs: string[] = voices.map((voice: Voice) =>
        normalizeLanguageCode(standardizeLanguageCode(voice.lang)),
      );

      if (langs.includes('sr-RS')) {
        langs.push('sr-SP');
      }

      if (langs.includes('pt-BR') || langs.includes('pt-PT')) {
        langs.push('pt-TL');
      }

      const hasCloudVoices = voices.some(
        (voice) => voice.voiceSource === 'cloud',
      );

      set((state) => ({
        voices,
        langs: Array.from(new Set(langs)).sort(),
        cloudVoicesLoaded: state.cloudVoicesLoaded || hasCloudVoices,
      }));
    },
    changeVoice: (payload) => {
      set((state) => ({
        options: {
          ...state.options,
          voiceURI: payload.voiceURI || EMPTY_VOICES,
          lang: payload.lang || DEFAULT_LANG,
          isCloud: payload.isCloud || null,
        },
      }));
    },
    changePitch: (value) => {
      set((state) => ({
        options: {
          ...state.options,
          pitch: value,
        },
      }));
    },
    changeRate: (value) => {
      set((state) => ({
        options: {
          ...state.options,
          rate: value,
        },
      }));
    },
    changeVolume: (value) => {
      set((state) => ({
        options: {
          ...state.options,
          volume: value,
        },
      }));
    },
    startSpeech: () => {
      set({ isSpeaking: true });
    },
    endSpeech: () => {
      set({ isSpeaking: false });
    },
    cancelSpeech: () => {
      set({ isSpeaking: false });
    },
    receiveTtsEngines: (engines) => {
      set({ ttsEngines: engines });
    },
    receiveTtsDefaultEngine: (engine) => {
      set((state) => ({
        ttsDefaultEngine: engine,
        ttsEngine: state.ttsEngine?.name ? state.ttsEngine : engine,
      }));
    },
    receiveTtsEngine: (engineName) => {
      set((state) => ({
        ttsEngine:
          state.ttsEngines.find((engine) => engine.name === engineName) ||
          state.ttsEngine,
      }));
    },
    handleLanguageChange: (lang) => {
      handleLanguageChangeAction({
        lang,
        state: get(),
        set: (patch) => set(patch),
      });
    },

    applyLoginSuccess: applyLoginSuccessFactory(get, set),

    fetchAzureVoices: fetchAzureVoicesFactory(get),
  };
});
