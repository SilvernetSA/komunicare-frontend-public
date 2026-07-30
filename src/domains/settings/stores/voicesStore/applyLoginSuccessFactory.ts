import type { SpeechState } from './types';

export const applyLoginSuccessFactory =
  (get: () => { options: SpeechState['options'] }, set: (patch: any) => void) =>
  (payload: unknown): void => {
    const settings = (payload as any)?.settings || {};
    const { speech } = settings;
    const current = get().options;

    set((state: any) => ({
      options: {
        ...state.options,
        // Restore the user's saved voice. isCloud stays null so
        // setCurrentVoiceSource() recomputes it once voices are loaded.
        voiceURI: speech?.voiceURI ?? current.voiceURI,
        lang: speech?.lang ?? current.lang,
        isCloud: speech?.isCloud ?? current.isCloud,
        pitch: speech?.pitch ?? current.pitch,
        rate: speech?.rate ?? current.rate,
      },
    }));
  };
