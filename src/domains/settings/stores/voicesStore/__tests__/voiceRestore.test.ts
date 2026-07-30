import { beforeEach, describe, expect, it } from 'vitest';

import { applySettingsPatchAction } from '../../settingsStore/applySettingsPatch';
import { useSpeechStore } from '../../voicesStore';

// Regression tests for the "picto board always speaks with the same voice" bug.
// The chosen voice was saved to the server but never restored, because
// applyLoginSuccess (voicesStore) and applySettingsPatch dropped voiceURI.

const resetSpeech = () => {
  useSpeechStore.setState({
    voices: [
      {
        voiceURI: 'es-AR-ElenaNeural',
        lang: 'es-AR',
        name: 'Elena',
        voiceSource: 'cloud',
      },
      {
        voiceURI: 'es-AR-TomasNeural',
        lang: 'es-AR',
        name: 'Tomas',
        voiceSource: 'cloud',
      },
    ] as any,
    options: {
      lang: 'es-AR',
      voiceURI: 'es-AR-TomasNeural',
      isCloud: false,
      pitch: 1,
      rate: 1,
      volume: 1,
    },
  });
};

describe('voice preference restore', () => {
  beforeEach(resetSpeech);

  it('restores the saved voiceURI on login (not only pitch/rate)', () => {
    useSpeechStore.getState().applyLoginSuccess({
      settings: {
        speech: {
          voiceURI: 'es-AR-ElenaNeural',
          lang: 'es-AR',
          pitch: 1.4,
          rate: 0.8,
        },
      },
    });

    const { options } = useSpeechStore.getState();
    expect(options.voiceURI).toBe('es-AR-ElenaNeural');
    expect(options.lang).toBe('es-AR');
    expect(options.pitch).toBe(1.4);
    expect(options.rate).toBe(0.8);
  });

  it('keeps the current voice when login settings have no speech block', () => {
    useSpeechStore.getState().applyLoginSuccess({ settings: {} });
    expect(useSpeechStore.getState().options.voiceURI).toBe(
      'es-AR-TomasNeural',
    );
  });

  it('applies voiceURI from a settings patch (and recomputes isCloud)', () => {
    applySettingsPatchAction({
      speech: { voiceURI: 'es-AR-ElenaNeural' },
    } as any);

    const { options } = useSpeechStore.getState();
    expect(options.voiceURI).toBe('es-AR-ElenaNeural');
    expect(options.isCloud).toBe(true); // Elena is a cloud voice
    expect(options.lang).toBe('es-AR'); // preserved, patch carried no lang
  });
});
