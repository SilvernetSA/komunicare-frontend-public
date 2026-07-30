import { getVoiceURI } from '@/i18n';

import type { SpeechState } from './types';

interface HandleLanguageChangeActionArgs {
  lang: string;
  state: SpeechState;
  set: (patch: Partial<SpeechState>) => void;
}

export const handleLanguageChangeAction = ({
  lang,
  state,
  set,
}: HandleLanguageChangeActionArgs): void => {
  if (lang === 'sr-SP' || lang === 'sr-RS') {
    const language = 'sr-RS';
    set({
      options: {
        ...state.options,
        voiceURI:
          state.options.lang !== language
            ? getVoiceURI(language, state.voices)
            : state.options.voiceURI,
        lang: language,
      },
      langs: ['sr-SP', 'sr-RS'],
    });
    return;
  }

  set({
    options: {
      ...state.options,
      voiceURI:
        state.options.lang.substring(0, 2) !== lang.substring(0, 2)
          ? getVoiceURI(lang, state.voices)
          : state.options.voiceURI,
      lang:
        state.options.lang.substring(0, 2) !== lang.substring(0, 2)
          ? lang
          : state.options.lang,
    },
  });
};
