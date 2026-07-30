import type { SpeechOptions, TtsEngine, Voice } from '@/types/speech';

export interface SpeechState {
  voices: Voice[];
  ttsEngines: TtsEngine[];
  ttsDefaultEngine: TtsEngine | null;
  ttsEngine: TtsEngine | null;
  langs: string[];
  options: SpeechOptions;
  isSpeaking: boolean;
  cloudVoicesLoaded: boolean;
}
