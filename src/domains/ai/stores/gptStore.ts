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
  const improvePhraseAbortRef: { controller?: AbortController } = {};

  return {
    improvePhrase: improvePhraseFactory(improvePhraseAbortRef),

    abortImprovePhrase: () => {
      improvePhraseAbortRef.controller?.abort();
    },
  };
});
