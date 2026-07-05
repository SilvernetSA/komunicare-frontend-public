import React, { useEffect, ReactNode } from 'react';

import {
  getVoices,
  getTtsEngines,
  getTtsDefaultEngine,
  updateLangSpeechStatus,
  setTtsEngine,
  setCurrentVoiceSource,
} from './speechService';
import tts from './tts';
import { IS_ANDROID } from '../../platform';
import { useSpeechStore } from '../../store/voicesStore';

interface SpeechProviderProps {
  children: ReactNode;
}

export const SpeechProvider = ({ children }: SpeechProviderProps) => {
  const ttsEngine = useSpeechStore((state) => state.ttsEngine);
  useEffect(() => {
    const initializeSpeech = async () => {
      if (tts.isSupported()) {
        //if android we have to set the tts engine first
        if (IS_ANDROID) {
          getTtsEngines();
          getTtsDefaultEngine();
        }
        if (ttsEngine && ttsEngine.name) {
          try {
            await setTtsEngine(ttsEngine.name);
          } catch (err: unknown) {
            console.error(err instanceof Error ? err.message : 'Unknown error');
          }
        }
        try {
          const voices = await getVoices();
          await updateLangSpeechStatus(voices);
        } catch (err: unknown) {
          console.error(err instanceof Error ? err.message : 'Unknown error');
        }
      }
      setCurrentVoiceSource();
    };

    initializeSpeech();
  }, [ttsEngine]);

  return React.Children.only(children) as React.ReactElement;
};

export default SpeechProvider;
