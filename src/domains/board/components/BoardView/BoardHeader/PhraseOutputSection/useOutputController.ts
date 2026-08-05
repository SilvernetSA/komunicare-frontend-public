import keycode from 'keycode';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';

import { cleanImprovedPhrase, getOutputText } from './hooks/useImprovePhrase';
import { createLiveTile } from './Output/liveTile';
import messages from '../../../Messages/Board.messages';

import type { NavigationSettings } from '@/types/app';
import type { Tile } from '@/types/board';
import type { IntlShape } from 'react-intl';

import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import {
  cancelSpeech,
  speak,
} from '@/providers/SpeechProvider/speechService';

// How long play waits for an in-flight AI improvement of the current output
// (350ms debounce + API latency) before falling back to the raw phrase.
const IMPROVED_PHRASE_WAIT_MS = 2000;

interface OutputSymbol {
  id?: string;
  image?: string;
  label: string;
  labelKey?: string;
  vocalization?: string;
  action?: string;
  sound?: string;
  type?: Tile['type'];
  [key: string]: unknown;
}

interface UseOutputControllerParams {
  improvedPhrase?: string;
  intl: IntlShape;
  output: Tile[];
  isLiveMode: boolean;
  isScreenKeyboardMode: boolean;
  navigationSettings: NavigationSettings;
  changeOutput: (output: Tile[]) => void;
  changeScreenKeyboardMode: () => void;
  showNotification: (message: string) => void;
}

interface UseOutputControllerResult {
  translatedOutput: OutputSymbol[];
  isPlaying: boolean;
  tabIndex: string;
  phrase: string;
  handleBackspaceClick: () => void;
  handleClearClick: () => void;
  handleCopyClick: (improvedMessage: string) => Promise<void>;
  handleRemoveClick: (index: number) => (_event: MouseEvent) => void;
  handleStopOutputClick: () => void;
  handlePlayOutputClick: () => Promise<void>;
  handleOutputKeyDown: (event: KeyboardEvent) => void;
  handleSwitchScreenKeyboard: () => void;
  handleWriteSymbol: (
    index: number,
  ) => (event: ChangeEvent<HTMLTextAreaElement>) => void;
}

function translateOutput(output: Tile[], intl: IntlShape): OutputSymbol[] {
  return output.map((value) => {
    const translatedValue: OutputSymbol = {
      ...value,
      label: typeof value.label === 'string' ? value.label : '',
    };

    if (
      value.labelKey &&
      (intl.messages as Record<string, string>)?.[value.labelKey]
    ) {
      translatedValue.label = intl.formatMessage({ id: value.labelKey });
    }

    return translatedValue;
  });
}

export const useOutputController = ({
  improvedPhrase,
  intl,
  output,
  isLiveMode,
  isScreenKeyboardMode,
  navigationSettings,
  changeOutput,
  changeScreenKeyboardMode,
  showNotification,
}: UseOutputControllerParams): UseOutputControllerResult => {
  const [translatedOutput, setTranslatedOutput] = useState<OutputSymbol[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const playPendingRef = useRef(false);

  useEffect(() => {
    setTranslatedOutput(translateOutput(output, intl));
  }, [output, intl]);

  const addLiveOutputTile = useCallback(() => {
    changeOutput([...translatedOutput, createLiveTile()]);
  }, [changeOutput, translatedOutput]);

  const addLiveOutputTileClearOutput = useCallback(() => {
    setTranslatedOutput([]);
    changeOutput([createLiveTile()]);
  }, [changeOutput]);

  const isTextInputMode = isLiveMode || isScreenKeyboardMode;

  const outputReducer = useCallback(
    (accumulator: string, currentValue: OutputSymbol): string => {
      const actionValue =
        currentValue.action &&
        currentValue.action.startsWith('+') &&
        currentValue.action.slice(1);

      const symbolValue = currentValue.vocalization || currentValue.label;
      const value = actionValue || ` ${symbolValue}`;

      return ` ${accumulator}${value}`;
    },
    [],
  );

  const clearOutput = useCallback(() => {
    if (isTextInputMode) {
      addLiveOutputTileClearOutput();
    } else {
      changeOutput([]);
    }
  }, [addLiveOutputTileClearOutput, changeOutput, isTextInputMode]);

  const popOutput = useCallback(() => {
    const newOutput = [...output];
    newOutput.pop();

    if (isTextInputMode && newOutput.length === 0) {
      addLiveOutputTileClearOutput();
    } else {
      changeOutput(newOutput);
    }
  }, [addLiveOutputTileClearOutput, changeOutput, isTextInputMode, output]);

  const spliceOutput = useCallback(
    (index: number) => {
      const newOutput = [...output];
      newOutput.splice(index, 1);

      if (isTextInputMode && newOutput.length === 0) {
        addLiveOutputTileClearOutput();
      } else {
        changeOutput(newOutput);
      }
    },
    [addLiveOutputTileClearOutput, changeOutput, isTextInputMode, output],
  );

  const speakOutput = useCallback(async (text: string) => {
    return new Promise<void>((resolve) => {
      cancelSpeech();
      speak(text, resolve);
    });
  }, []);

  const groupOutputByType = useCallback(() => {
    const outputFrames: OutputSymbol[][] = [[]];

    translatedOutput.forEach((value, index, arr) => {
      const prevValue = index ? arr[index - 1] : arr[0];
      let frame: OutputSymbol[];

      if (Boolean(value.sound) !== Boolean(prevValue.sound)) {
        frame = [];
        outputFrames.push(frame);
      } else {
        frame = outputFrames[outputFrames.length - 1];
      }

      frame.push(value);
    });

    return outputFrames;
  }, [translatedOutput]);

  const playAudio = useCallback((src: string) => {
    return new Promise<void>((resolve) => {
      const audio = new Audio();

      audio.onended = () => {
        resolve();
      };

      audio.src = src;
      audio.play();
    });
  }, []);

  const asyncForEach = useCallback(
    async <T>(
      array: T[],
      callback: (item: T, index: number, array: T[]) => Promise<void>,
    ) => {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    },
    [],
  );

  const play = useCallback(
    async (liveText = '') => {
      setIsPlaying(true);
      if (liveText) {
        await speakOutput(liveText);
      } else {
        const outputFrames = groupOutputByType();

        await asyncForEach(outputFrames, async (frame) => {
          if (!frame[0]?.sound) {
            const text = frame.reduce(outputReducer, '');
            await speakOutput(text);
          } else {
            await new Promise<void>((resolve) => {
              asyncForEach(frame, async ({ sound }, index) => {
                if (sound) {
                  await playAudio(sound);
                }

                if (frame.length - 1 === index) {
                  resolve();
                }
              });
            });
          }
        });
      }
      setIsPlaying(false);
    },
    [speakOutput, groupOutputByType, asyncForEach, outputReducer, playAudio],
  );

  const handleBackspaceClick = useCallback(() => {
    cancelSpeech();
    popOutput();
  }, [popOutput]);

  const handleClearClick = useCallback(() => {
    cancelSpeech();
    clearOutput();
  }, [clearOutput]);

  const handlePhraseToShare = useCallback(() => {
    if (output.length) {
      return improvedPhrase || '';
    }
    return '';
  }, [output.length, improvedPhrase]);

  const handleCopyClick = useCallback(
    async (improvedMessage: string) => {
      const labels = output.map((symbol) => symbol.label);
      try {
        if (improvedMessage) {
          await navigator.clipboard.writeText(improvedMessage);
        } else {
          await navigator.clipboard.writeText(labels.join(' '));
        }
        showNotification(intl.formatMessage(messages.copyMessage));
      } catch (err) {
        showNotification(intl.formatMessage(messages.failedToCopy));
        console.log(err);
      }
    },
    [intl, output, showNotification],
  );

  const handleRemoveClick = useCallback(
    (index: number) => (_event: MouseEvent) => {
      cancelSpeech();
      spliceOutput(index);
    },
    [spliceOutput],
  );

  const handleStopOutputClick = useCallback(() => {
    cancelSpeech();
    setIsPlaying(false);
  }, []);

  // Play speaks the AI suggestion only when it matches the CURRENT output.
  // Right after adding a tile the suggestion is stale (or still in flight),
  // so wait briefly for the fresh one instead of voicing the raw phrase or
  // worse - yesterday's suggestion that lacks the new pictogram.
  const resolveImprovedPhraseForPlay = useCallback((): Promise<string> => {
    const currentText = getOutputText(output, intl);
    if (!currentText) return Promise.resolve('');

    const boardsState = useBoardsStore.getState();
    if (boardsState.improvedPhraseSource === currentText) {
      return Promise.resolve(
        cleanImprovedPhrase(boardsState.improvedPhrase || ''),
      );
    }

    const improveEnabled =
      (navigationSettings as { improvePhraseActive?: boolean })
        .improvePhraseActive !== false;
    if (!improveEnabled) return Promise.resolve('');

    return new Promise((resolve) => {
      const finish = (value: string) => {
        window.clearTimeout(timeoutId);
        unsubscribe();
        resolve(cleanImprovedPhrase(value));
      };
      const unsubscribe = useBoardsStore.subscribe((state) => {
        if (state.improvedPhraseSource === currentText) {
          finish(state.improvedPhrase || '');
        }
      });
      const timeoutId = window.setTimeout(
        () => finish(''),
        IMPROVED_PHRASE_WAIT_MS,
      );
    });
  }, [output, intl, navigationSettings]);

  const handlePlayOutputClick = useCallback(async () => {
    if (!translatedOutput || isPlaying || playPendingRef.current) return;
    playPendingRef.current = true;
    // Reflect the press immediately: resolving the AI suggestion can take up to
    // IMPROVED_PHRASE_WAIT_MS, and a dwell/switch user needs feedback that the
    // tap registered before any audio starts.
    setIsPlaying(true);
    // Snapshot the output; if the user clears or edits it during the wait, the
    // resolved phrase is stale and must not be spoken over the empty bar.
    const outputAtClick = useBoardsStore.getState().output;
    try {
      const improved = await resolveImprovedPhraseForPlay();
      if (useBoardsStore.getState().output !== outputAtClick) return;
      await play(improved);
    } finally {
      playPendingRef.current = false;
      setIsPlaying(false);
    }
  }, [translatedOutput, isPlaying, play, resolveImprovedPhraseForPlay]);

  const handleOutputKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.keyCode === keycode('enter')) {
        const targetEl = event.target as HTMLElement;
        if (targetEl.tagName.toLowerCase() === 'div') {
          play();
        } else if (targetEl.tagName.toLowerCase() === 'textarea') {
          const textareaEl = targetEl as HTMLTextAreaElement;
          play(textareaEl.value);
          addLiveOutputTile();
        }
      }
    },
    [addLiveOutputTile, play],
  );

  const handleSwitchScreenKeyboard = useCallback(() => {
    if (!isScreenKeyboardMode) {
      const lastSymbol = translatedOutput[translatedOutput.length - 1];
      if (lastSymbol?.type !== 'live') {
        addLiveOutputTile();
      }
    }
    changeScreenKeyboardMode();
  }, [
    addLiveOutputTile,
    changeScreenKeyboardMode,
    isScreenKeyboardMode,
    translatedOutput,
  ]);

  const handleWriteSymbol = useCallback(
    (index: number) => (event: ChangeEvent<HTMLTextAreaElement>) => {
      const newOutput = [...output];
      const newEl = {
        ...newOutput[index],
        label: event.target.value,
      };
      newOutput.splice(index, 1, newEl);
      changeOutput(newOutput);
      setTranslatedOutput(translateOutput(newOutput, intl));
    },
    [changeOutput, intl, output],
  );

  return {
    translatedOutput,
    isPlaying,
    tabIndex: output.length ? '0' : '-1',
    phrase: handlePhraseToShare(),
    handleBackspaceClick,
    handleClearClick,
    handleCopyClick,
    handleRemoveClick,
    handleStopOutputClick,
    handlePlayOutputClick,
    handleOutputKeyDown,
    handleSwitchScreenKeyboard,
    handleWriteSymbol,
  };
};
