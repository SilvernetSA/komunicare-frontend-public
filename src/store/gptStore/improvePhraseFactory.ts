import { apiClient } from '../apiClient';

interface AbortControllerRef {
  controller?: AbortController;
}

export const improvePhraseFactory =
  (abortControllerRef: AbortControllerRef) =>
  async ({
    phrase,
    language,
  }: {
    phrase: string;
    language: string;
  }): Promise<string> => {
    abortControllerRef.controller = new AbortController();

    try {
      const { data } = await apiClient.post(
        '/gpt/edit',
        { phrase, language },
        {
          signal: abortControllerRef.controller.signal,
        },
      );
      return typeof (data as any)?.phrase === 'string'
        ? (data as any).phrase
        : '';
    } catch (error: any) {
      if (error?.message !== 'canceled') {
        console.error(error);
      }
      return '';
    }
  };
