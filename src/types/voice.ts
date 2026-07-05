export interface Voice {
  voiceURI: string;
  lang: string;
  name: string;
  voiceSource?: 'local' | 'cloud';
  [key: string]: unknown;
}
