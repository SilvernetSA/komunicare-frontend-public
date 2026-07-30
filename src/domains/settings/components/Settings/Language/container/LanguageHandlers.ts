import { useSettingsStore } from '@/domains/settings/stores/settingsStore';

export const handleSubmit = async (
  selectedLang: string,
  onLangChange: (lang: string) => void,
): Promise<void> => {
  onLangChange(selectedLang);
  try {
    await useSettingsStore.getState().persistSettings({
      language: { lang: selectedLang },
    });
  } catch (err: any) {
    const message = err?.message || 'Failed to persist language';
    console.log(message);
  }
};

interface TtsEngineHandlers {
  setTtsEngine: (engineName: string) => Promise<void>;
  getVoices: () => Promise<unknown[]>;
  updateLangSpeechStatus: (voices: unknown[]) => Promise<void>;
}

export const handleSetTtsEngine = async (
  engineName: string,
  { setTtsEngine, getVoices, updateLangSpeechStatus }: TtsEngineHandlers,
): Promise<void> => {
  try {
    await setTtsEngine(engineName);
    const voices = await getVoices();
    await updateLangSpeechStatus(voices);
  } catch {
    throw new Error('TTS engine selection error on handleSetTtsEngine');
  }
};
