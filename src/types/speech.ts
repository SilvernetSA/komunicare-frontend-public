export type { Voice } from './voice';

export interface SpeakOptions {
  voiceURI: string;
  pitch?: number;
  rate?: number;
  volume?: number;
  onend?: (event?: Event) => void;
}

export interface SpeechOptions {
  lang: string;
  voiceURI: string | null;
  isCloud: boolean | null;
  pitch: number;
  rate: number;
  volume: number;
}

export interface TtsEngine {
  name: string;
  label?: string;
}
