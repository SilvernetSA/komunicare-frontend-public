import { create } from 'zustand';

import { improvePhraseFactory } from './gptStore/improvePhraseFactory';

interface ImprovePhraseParams {
  phrase: string;
  language: string;
}

export interface GptStore {
  improvePhrase: (params: ImprovePhraseParams) => Promise<string>;
  abortImprovePhrase: () => void;
}

export const useGptStore = create<GptStore>()(() => {
  const abortControllerRef: { controller?: AbortController } = {};

  return {
    improvePhrase: improvePhraseFactory(abortControllerRef),

    abortImprovePhrase: () => {
      abortControllerRef.controller?.abort();
    },
  };
});
