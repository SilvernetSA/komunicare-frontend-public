import React from 'react';

interface TtsEngine {
  name: string;
}

export const handleTtsEngineChange = async (
  event: React.ChangeEvent<{ value: unknown }>,
  onSetTtsEngine: (engineName: string) => Promise<void>,
  ttsEngine: TtsEngine,
  setTtsEngine: (value: string) => void,
  setLoading: (loading: boolean) => void,
  setOpenTtsEngineError: (error: boolean) => void,
): Promise<void> => {
  setTtsEngine(event.target.value as string);
  setLoading(true);
  try {
    await onSetTtsEngine(event.target.value as string);
  } catch (err) {
    setTtsEngine(ttsEngine.name);
    setLoading(false);
    setOpenTtsEngineError(true);
  }
};

export const handleTtsErrorDialogClose = (
  onSetTtsEngine: (engineName: string) => void,
  ttsEngine: TtsEngine,
  setOpenTtsEngineError: (error: boolean) => void,
): void => {
  setOpenTtsEngineError(false);
  onSetTtsEngine(ttsEngine.name);
};
