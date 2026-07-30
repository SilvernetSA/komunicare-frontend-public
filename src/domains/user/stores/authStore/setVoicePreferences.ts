import { getVoiceURI } from '@/i18n';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';
import { useLanguageStore } from '@/domains/settings/stores/languageStore';
import { useSpeechStore } from '@/domains/settings/stores/voicesStore';

import type { LoginPayload } from '@/types/auth';
import type { Voice } from '@/types/speech';

export const setVoicePreferencesAction = async (
  loginData: LoginPayload,
): Promise<void> => {
  try {
    const voices = useSpeechStore.getState().voices as Voice[];
    const deviceVoice = useSpeechStore.getState().options;
    const appLang = useLanguageStore.getState().lang;

    if (!voices || !voices.length || !appLang) {
      return;
    }

    const emptyVoiceString = 'empty voices';
    const appLanguageCode = appLang.substring(0, 2);
    const deviceVoiceLanguageCode = deviceVoice?.lang?.substring(0, 2);

    if (deviceVoice?.voiceURI) {
      const uris = voices.map((v) => v.voiceURI);
      if (
        deviceVoiceLanguageCode === appLanguageCode &&
        uris.includes(deviceVoice.voiceURI)
      ) {
        return;
      }
    }

    const userSpeechSettings = loginData.settings?.speech;
    if (userSpeechSettings?.voiceURI) {
      const userVoice = voices.find(
        (voice) => voice.voiceURI === userSpeechSettings.voiceURI,
      );
      const userVoiceLangCode = userVoice?.lang?.substring(0, 2);
      if (userVoice && userVoiceLangCode === appLanguageCode) {
        useSpeechStore
          .getState()
          .changeVoice({ voiceURI: userVoice.voiceURI, lang: userVoice.lang });
        if (typeof userSpeechSettings.pitch === 'number') {
          useSpeechStore.getState().changePitch(userSpeechSettings.pitch);
        }
        if (typeof userSpeechSettings.rate === 'number') {
          useSpeechStore.getState().changeRate(userSpeechSettings.rate);
        }
        return;
      }
    }

    const fallbackVoiceUri = getVoiceURI(appLang, voices);
    if (fallbackVoiceUri === emptyVoiceString) {
      useSpeechStore
        .getState()
        .changeVoice({ voiceURI: emptyVoiceString, lang: '' });
      return;
    }

    const fallbackVoice = voices.find(
      (voice) => voice.voiceURI === fallbackVoiceUri,
    );
    if (fallbackVoice) {
      useSpeechStore.getState().changeVoice({
        voiceURI: fallbackVoice.voiceURI,
        lang: fallbackVoice.lang,
      });
    }
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to set voice preferences'),
    );
  }
};
