import type { SpeechState } from './types';

export const applyLoginSuccessFactory =
  (get: () => { options: SpeechState['options'] }, set: (patch: any) => void) =>
  (payload: unknown): void => {
    const settings = (payload as any)?.settings || {};
    const { speech } = settings;
    const current = get().options;

    set((state: any) => ({
      options: {
        ...state.options,
        pitch: speech?.pitch ?? current.pitch,
        rate: speech?.rate ?? current.rate,
      },
    }));
  };
