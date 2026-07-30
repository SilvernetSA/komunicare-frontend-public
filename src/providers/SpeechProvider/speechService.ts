import tts from './tts';
import { APP_LANGS } from '@/domains/app/components/App/App.constants';
import {
  getSupportedLangs,
  getDefaultLang,
  getVoiceURI,
  filterLocalLangs,
} from '../../i18n';
import { useLanguageStore } from '@/domains/settings/stores/languageStore';
import { useNotificationStore } from '@/domains/notifications/stores/notificationStore';
import { useSpeechStore } from '@/domains/settings/stores/voicesStore';
import { Voice, TtsEngine } from '../../types/speech';

export const getTtsEngines = () => {
  const ttsEngines = tts?.getTtsEngines() as TtsEngine[];
  useSpeechStore.getState().receiveTtsEngines(ttsEngines || []);
};

export const getTtsDefaultEngine = () => {
  const ttsDefaultEngine = tts.getTtsDefaultEngine() as TtsEngine;
  useSpeechStore.getState().receiveTtsDefaultEngine(ttsDefaultEngine);
};

export const setTtsEngine = async (selectedTtsEngineName: string) => {
  try {
    const engineAvailable = tts
      .getTtsEngines()
      .map((engine) => (engine as any).name)
      .includes(selectedTtsEngineName);
    const engineName = engineAvailable
      ? selectedTtsEngineName
      : (tts.getTtsDefaultEngine() as any).name;
    const voices = await tts.setTtsEngine(engineName);
    useSpeechStore.getState().receiveTtsEngine(engineName);
    if (!voices.length) {
      throw new Error('TTS engine does not have a language.');
    }
  } catch {
    throw new Error('TTS engine selection error on setTtsEngine');
  }
};

export const updateLangSpeechStatus = async (
  voices: Voice[],
): Promise<Voice[]> => {
  try {
    const supportedLangs = getSupportedLangs(voices);

    if (!supportedLangs.length) {
      throw new Error('TTS engine does not have a supported language.');
    }
    const localLangs = filterLocalLangs(voices);

    useLanguageStore.getState().setLangs({ langs: supportedLangs, localLangs });

    const currentUiLang = useLanguageStore.getState().lang;
    const resolvedUiLang =
      currentUiLang && APP_LANGS.includes(currentUiLang)
        ? currentUiLang
        : getDefaultLang(APP_LANGS);
    if (resolvedUiLang !== currentUiLang) {
      useLanguageStore.getState().changeLang(resolvedUiLang);
    }

    const speechLang = supportedLangs.includes(resolvedUiLang)
      ? resolvedUiLang
      : getDefaultLang(supportedLangs);

    if (
      useSpeechStore.getState().options.lang.substring(0, 2) !==
      speechLang.substring(0, 2)
    ) {
      const uris = voices.map((v) => v.voiceURI);
      const currentVoiceURI = useSpeechStore.getState().options.voiceURI || '';
      // Keep the user's saved voice if it's still available; otherwise fall
      // back to the default voice for the resolved language.
      const voiceURI = uris.includes(currentVoiceURI)
        ? currentVoiceURI
        : getVoiceURI(speechLang, voices);
      changeVoice({ voiceURI, lang: speechLang });
    }

    return voices;
  } catch (err: any) {
    throw new Error(
      'TTS engine does not have a supported language.' + err.message,
    );
  }
};

export const getVoices = async (): Promise<Voice[]> => {
  let voices: Voice[] = [];
  try {
    const localizeSerbianVoicesNames = (
      voiceName: string,
      voiceLang: string,
    ) => {
      if (voiceLang?.startsWith('sr')) {
        const getNativeNameOfDialect = (lang: string) => {
          if (lang === 'sr-ME') return 'Crnogorski jezik';
          if (lang === 'sr-SP') return 'Српски језик';
          if (lang === 'sr-RS') return 'Srpski jezik';
        };
        return `${voiceName} - ${getNativeNameOfDialect(voiceLang)}`;
      }
      return voiceName;
    };

    const pvoices = await tts.getVoices();
    const regex = new RegExp('^[a-zA-Z]{2,}-$', 'g');
    const fvoices = pvoices.filter(
      (voice: { lang: string }) => !regex.test(voice.lang),
    );
    voices = fvoices.map(
      ({
        voiceURI,
        lang,
        name,
        Locale,
        ShortName,
        DisplayName,
        Gender,
      }: {
        voiceURI?: string;
        lang?: string;
        name?: string;
        Locale?: string;
        ShortName?: string;
        DisplayName?: string;
        Gender?: string;
      }) => {
        const voice: Partial<Voice> = {};
        if (lang) {
          voice.lang = lang;
        } else if (Locale) {
          voice.lang = Locale;
        }
        if (voiceURI) {
          voice.voiceURI = voiceURI;
          voice.voiceSource = 'local';
        } else if (ShortName) {
          voice.voiceURI = ShortName;
          voice.voiceSource = 'cloud';
        }
        if (name) {
          voice.name = name;
        } else if (DisplayName) {
          voice.name = `${DisplayName} (${voice.lang}) - ${Gender}`;
        }
        voice.name = localizeSerbianVoicesNames(
          voice.name || '',
          voice.lang || '',
        );
        return voice as Voice;
      },
    );
    useSpeechStore.getState().receiveVoices(voices);
  } catch (err: unknown) {
    console.error(err instanceof Error ? err.message : 'Unknown error');
    voices = [];
  }
  return voices;
};

export const changeVoice = (params: { voiceURI: string; lang: string }) => {
  const { voiceURI, lang } = params;
  const isCloud =
    useSpeechStore.getState().voices.find((v) => v.voiceURI === voiceURI)
      ?.voiceSource === 'cloud';
  if (isCloud)
    useNotificationStore.getState().showNotification('', 'cloudVoiceIsSeted');
  useSpeechStore.getState().changeVoice({ voiceURI, lang, isCloud });
};

export const cancelSpeech = () => {
  useSpeechStore.getState().cancelSpeech();
  try {
    tts.cancel();
  } catch (error) {
    console.error(error);
  }
};

export const speak = (text: string, onend: () => void = () => {}) => {
  const options = useSpeechStore.getState().options;
  const setCloudSpeakAlertTimeout = () => {
    const REASONABLE_TIME_TO_AWAIT = 5000;
    return setTimeout(() => {
      useNotificationStore.getState().showNotification('', 'cloudSpeakError');
    }, REASONABLE_TIME_TO_AWAIT);
  };
  useSpeechStore.getState().startSpeech();

  tts.speak(
    text,
    {
      ...options,
      onend: (event: Event & { error?: unknown }) => {
        onend();
        useSpeechStore.getState().endSpeech();
        if (event?.error)
          useNotificationStore
            .getState()
            .showNotification('', 'cloudSpeakError');
      },
    },
    setCloudSpeakAlertTimeout,
  );
};

export const setCurrentVoiceSource = () => {
  const { isCloud = null, voiceURI, lang } = useSpeechStore.getState().options;
  if (isCloud === null && !!voiceURI && !!lang) {
    changeVoice({ voiceURI, lang });
    return;
  }
};
