import { useAppStore } from '../appStore';
import { useLanguageStore } from '../languageStore';
import { useSpeechStore } from '../voicesStore';

import type { UserData } from '../../types/app';
import type { Settings } from '../../types/settings';

export const applySettingsPatchAction = (patch: Partial<Settings>): void => {
  if (!patch || typeof patch !== 'object') {
    return;
  }

  if (patch.display) {
    useAppStore.getState().updateDisplaySettings(patch.display);
  }

  if (patch.navigation) {
    useAppStore.getState().updateNavigationSettings(patch.navigation);
  }

  if (patch.language && typeof patch.language.lang === 'string') {
    useLanguageStore.getState().changeLang(patch.language.lang);
  }

  if (patch.speech) {
    if (typeof patch.speech.voiceURI === 'string') {
      const speechStore = useSpeechStore.getState();
      const voiceURI = patch.speech.voiceURI;
      const isCloud =
        speechStore.voices.find((v) => v.voiceURI === voiceURI)?.voiceSource ===
        'cloud';
      speechStore.changeVoice({
        voiceURI,
        // The persisted patch carries no lang; keep the current speech lang.
        lang: (patch.speech.lang as string) || speechStore.options.lang,
        isCloud,
      });
    }
    if (typeof patch.speech.pitch === 'number') {
      useSpeechStore.getState().changePitch(patch.speech.pitch);
    }
    if (typeof patch.speech.rate === 'number') {
      useSpeechStore.getState().changeRate(patch.speech.rate);
    }
  }

  if (patch.devices) {
    const currentUserData: UserData | Record<string, unknown> =
      useAppStore.getState().userData || {};
    const currentSettings = (currentUserData as any).settings || {};
    const nextUserData: UserData = {
      ...(currentUserData as UserData),
      settings: {
        ...currentSettings,
        devices: patch.devices,
      },
    } as UserData;

    useAppStore.getState().updateUserData(nextUserData);
  }
};
