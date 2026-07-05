import * as azureSdk from 'microsoft-cognitiveservices-speech-sdk';

import {
  AZURE_SPEECH_SERVICE_REGION,
  AZURE_SPEECH_SUBSCR_KEY,
  IS_BROWSING_FROM_APPLE,
  IS_BROWSING_FROM_APPLE_TOUCH,
  IS_BROWSING_FROM_SAFARI,
} from '../../constants';
import { IS_ANDROID } from '../../platform';
import { useAppStore } from '../../store/appStore';
import { useSpeechStore } from '../../store/voicesStore';
import { Voice, SpeakOptions } from '../../types/speech';

interface QueueItem {
  audioData: ArrayBuffer;
  endCallback: () => void;
}

interface ExtendedSpeechSynthesis {
  setEngine?: (
    engineName: string,
    callback: (event: unknown[]) => void,
  ) => void;
  getEngines?: () => { _list?: unknown[] } | unknown[];
  getDefaultEngine?: () => unknown;
  getVoices: () => SpeechSynthesisVoice[];
  cancel: () => void;
  speak: (utterance: SpeechSynthesisUtterance) => void;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

interface ExtendedVoices {
  _list?: SpeechSynthesisVoice[];
}

// this is the local synthesizer — may be undefined on some Android WebViews
let synth: ExtendedSpeechSynthesis | undefined = window.speechSynthesis as
  | ExtendedSpeechSynthesis
  | undefined;

// this is the cloud synthesizer
let azureSynthesizer: azureSdk.SpeechSynthesizer | undefined;

const audioElement = new Audio();

let appleFirstCloudPlay = IS_BROWSING_FROM_APPLE;
// Android also needs to unlock the audio element within a user gesture
// before the first async cloud TTS response arrives.
let androidAudioUnlocked = !IS_ANDROID;
let speakQueue: QueueItem[] = [];
let platformVoices: SpeechSynthesisVoice[] = [];

const getStateVoices = (): Voice[] => {
  return useSpeechStore.getState().voices;
};

const getConnectionStatus = (): boolean => {
  return useAppStore.getState().isConnected;
};

const initAzureSynthesizer = (): void => {
  // Without a subscription key the cloud synthesizer stays disabled and
  // speech falls back to the local speechSynthesis voices.
  if (!AZURE_SPEECH_SUBSCR_KEY) {
    return;
  }
  const azureSpeechConfig = azureSdk.SpeechConfig.fromSubscription(
    AZURE_SPEECH_SUBSCR_KEY,
    AZURE_SPEECH_SERVICE_REGION,
  );
  const azureAudioConfig = null;
  azureSynthesizer = new azureSdk.SpeechSynthesizer(
    azureSpeechConfig,
    azureAudioConfig,
  );
};

const playQueue = async (): Promise<void> => {
  try {
    if (speakQueue.length) {
      const blob = new Blob([speakQueue[0].audioData], { type: 'audio/wav' });
      audioElement.src = window.URL.createObjectURL(blob);
      audioElement.onended = () => {
        window.URL.revokeObjectURL(audioElement.src);
        if (speakQueue.length) {
          speakQueue[0].endCallback();
          speakQueue.shift();
          if (speakQueue.length) {
            void playQueue();
          }
        }
      };
      try {
        await audioElement.play();
      } catch (err) {
        console.error(err);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

initAzureSynthesizer();

const tts = {
  isSupported(): boolean {
    return 'speechSynthesis' in window && !!window.speechSynthesis;
  },

  getVoiceByVoiceURI(VoiceURI: string): Voice | undefined {
    const voices = getStateVoices();
    return voices.find((voice) => voice.voiceURI === VoiceURI);
  },

  isConnected(): boolean {
    return getConnectionStatus();
  },

  getLocalVoiceByVoiceURI(VoiceURI: string): SpeechSynthesisVoice | undefined {
    return platformVoices.find((voice) => voice.voiceURI === VoiceURI);
  },

  // Get voices from the active speech synthesis implementation.
  _getPlatformVoices(): SpeechSynthesisVoice[] {
    if (!synth) return [];
    let voices: SpeechSynthesisVoice[] | ExtendedVoices = [];
    try {
      voices = synth.getVoices();
    } catch (err) {
      console.log((err as Error).message);
      synth = window.speechSynthesis as ExtendedSpeechSynthesis | undefined;
    }
    return (
      (voices as ExtendedVoices)._list || (voices as SpeechSynthesisVoice[])
    );
  },

  async getVoices(): Promise<Voice[]> {
    let cloudVoices: Voice[] = [];
    try {
      cloudVoices = await useSpeechStore.getState().fetchAzureVoices();
    } catch (err) {
      console.error((err as Error).message);
    }
    return new Promise((resolve, _reject) => {
      platformVoices = this._getPlatformVoices() || [];
      if (platformVoices.length) {
        resolve([...platformVoices, ...cloudVoices] as Voice[]);
      }

      // Android
      if (synth && 'onvoiceschanged' in synth) {
        synth.addEventListener('voiceschanged', function voiceslst() {
          const voices = synth!.getVoices();
          if (!voices.length) {
            return null;
          } else {
            synth!.removeEventListener('voiceschanged', voiceslst);
            platformVoices = (voices as ExtendedVoices)._list || voices;
            resolve([...platformVoices, ...cloudVoices] as Voice[]);
          }
        });
      } else {
        platformVoices = this._getPlatformVoices();
        resolve([...platformVoices, ...cloudVoices] as Voice[]);
      }
    });
  },

  //Use setTTsEngine only in Android
  setTtsEngine(ttsEngineName: string): Promise<unknown[]> | undefined {
    if (!IS_ANDROID) {
      return;
    } else {
      //define a race between two promises
      const timeout = (
        prom: Promise<unknown[]>,
        time: number,
      ): Promise<unknown[]> => {
        let timer: NodeJS.Timeout;
        return Promise.race([
          prom,
          new Promise((_r, rej) => (timer = setTimeout(rej, time))),
        ]).finally(() => clearTimeout(timer)) as any;
      };
      //promise when setting the TTS succeed
      const ttsResponse = (): Promise<unknown[]> => {
        return new Promise((resolve, _reject) => {
          if (synth?.setEngine) {
            synth.setEngine(ttsEngineName, function (event: unknown[]) {
              if (event.length) {
                resolve(event);
              }
            });
          }
        });
      };
      // finishes before the timeout
      return timeout(ttsResponse(), 4000);
    }
  },

  //Use getTTsEngine only in Android
  getTtsEngines(): unknown[] {
    if (!IS_ANDROID) {
      return [];
    } else {
      if (synth?.getEngines) {
        const ttsEngs = synth.getEngines();
        return (ttsEngs as { _list?: unknown[] })._list || [];
      }
      return [];
    }
  },

  //Use getTTsDefaultEngine only in Android
  getTtsDefaultEngine(): unknown {
    if (!IS_ANDROID) {
      return;
    } else {
      if (synth?.getDefaultEngine) {
        return synth.getDefaultEngine();
      }
    }
  },

  cancel(): void {
    audioElement.pause();
    speakQueue = [];
    synth?.cancel();
  },

  async speak(
    text: string,
    { voiceURI, pitch = 1, rate = 1, volume = 1, onend }: SpeakOptions,
    setCloudSpeakAlertTimeout: () => NodeJS.Timeout,
  ): Promise<void> {
    const voice = this.getVoiceByVoiceURI(voiceURI);
    if (voice && voice.voiceSource === 'cloud') {
      if (appleFirstCloudPlay) {
        try {
          await audioElement.play();
        } catch {
          // ignore autoplay errors, this call is only for iOS audio warm-up
        } finally {
          console.log('Apple user Agent is ready to reproduce cloud voices');
        }
        audioElement.pause();
        appleFirstCloudPlay = false;
      }
      // Android WebView blocks audio.play() when called outside a user gesture.
      // Azure TTS is async (~1-3s), so by the time the callback fires the gesture
      // context is gone. We unlock the audio element here, while still inside the
      // original touch/click event, so playQueue() can play freely afterward.
      if (!androidAudioUnlocked) {
        await Promise.race([
          audioElement.play().catch(() => {}),
          new Promise<void>((resolve) => setTimeout(resolve, 300)),
        ]);
        audioElement.pause();
        androidAudioUnlocked = true;
        console.log('[TTS] Android audio element unlocked for cloud voices');
      }
      const speakAlertTimeoutId = setCloudSpeakAlertTimeout();
      // set voice to speak
      if (azureSynthesizer) {
        azureSynthesizer.properties.setProperty(
          'SpeechServiceConnection_SynthVoice',
          voiceURI,
        );
        azureSynthesizer.speakTextAsync(
          text,
          function (result: any) {
            result.endCallback = onend;
            clearTimeout(speakAlertTimeoutId);
            if (
              result.reason === azureSdk.ResultReason.SynthesizingAudioCompleted
            ) {
              speakQueue.push(result);
              // if not playing, play the queue
              if (audioElement.paused) {
                void playQueue();
              }
            } else if (result.reason === azureSdk.ResultReason.Canceled) {
              console.error(
                'Speech synthesis canceled, ' +
                  result.errorDetails +
                  '\nDid you update the subscription info?',
              );
              if (onend) onend({ error: true } as any);
              azureSynthesizer?.close();
              azureSynthesizer = undefined;
              initAzureSynthesizer();
            }
          },
          function (err: any) {
            console.error(err);
            if (onend) onend({ error: true } as any);
            azureSynthesizer?.close();
            azureSynthesizer = undefined;
            initAzureSynthesizer();
          },
        );
      }
    } else {
      // window.speechSynthesis is unavailable on some Android WebViews.
      // The Azure SDK uses WebSockets which may be blocked on some networks.
      // Use the Azure TTS REST API (HTTP) instead: it returns MP3 audio as a blob
      // that we play via audioElement — no WebSocket needed.
      if (!synth) {
        console.warn(
          '[TTS] speechSynthesis unavailable — using Azure REST TTS fallback. Text:',
          text,
        );
        // Unlock audioElement within the user gesture before the async fetch.
        // Promise.race guards against play() hanging indefinitely on empty Audio elements
        // in some Android WebViews.
        if (!androidAudioUnlocked) {
          await Promise.race([
            audioElement.play().catch(() => {}),
            new Promise<void>((resolve) => setTimeout(resolve, 300)),
          ]);
          audioElement.pause();
          androidAudioUnlocked = true;
          console.log('[TTS] Android audio element unlocked for REST fallback');
        }
        const fallbackVoice = 'es-AR-TomasNeural';
        const fallbackLang = 'es-AR';
        const ssml = `<speak version='1.0' xml:lang='${fallbackLang}'><voice name='${fallbackVoice}'>${text}</voice></speak>`;
        const endpoint = `https://${AZURE_SPEECH_SERVICE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
        try {
          const resp = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Ocp-Apim-Subscription-Key': AZURE_SPEECH_SUBSCR_KEY,
              'Content-Type': 'application/ssml+xml',
              'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
            },
            body: ssml,
          });
          if (!resp.ok) {
            console.error(
              '[TTS] Azure REST error:',
              resp.status,
              await resp.text(),
            );
            if (onend) onend({ error: true } as any);
            return;
          }
          const arrayBuffer = await resp.arrayBuffer();
          console.log('[TTS] Azure REST synthesis OK — playing audio');
          const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
          const url = URL.createObjectURL(blob);
          audioElement.src = url;
          audioElement.onended = () => {
            URL.revokeObjectURL(url);
            if (onend) onend({} as Event);
          };
          await audioElement.play();
        } catch (err) {
          console.error('[TTS] Azure REST fetch error:', err);
          if (onend) onend({ error: true } as any);
        }
        return;
      }

      if (!platformVoices.length) {
        try {
          await this.getVoices();
        } catch (err) {
          console.error((err as Error).message);
        }
      }
      if (!platformVoices.length) {
        console.error(
          '[TTS] No platform voices available — speech skipped. Text:',
          text,
        );
        if (onend) onend({} as Event);
        return;
      }
      // Find the configured voice, or fall back to the first voice with a matching language.
      let localVoice = this.getLocalVoiceByVoiceURI(voiceURI);
      if (!localVoice) {
        const lang =
          voice?.lang ?? useSpeechStore.getState().options.lang ?? '';
        const langPrefix = lang.substring(0, 2).toLowerCase();
        localVoice =
          platformVoices.find((v) =>
            v.lang.toLowerCase().startsWith(langPrefix),
          ) ?? platformVoices[0];
        console.warn(
          `[TTS] Voice URI "${voiceURI}" not found on device — falling back to "${localVoice?.name}" (${localVoice?.lang})`,
        );
      }
      if (localVoice) {
        const msg = new SpeechSynthesisUtterance(text);
        msg.text = text;
        msg.voice = localVoice;
        msg.pitch = pitch;
        msg.rate = rate;
        msg.volume = volume;
        if (onend) msg.onend = onend;
        if (IS_BROWSING_FROM_SAFARI || IS_BROWSING_FROM_APPLE_TOUCH)
          synth.cancel();
        synth.speak(msg);
      }
    }
  },
};

export default tts;
