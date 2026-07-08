import keycode from 'keycode';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import shortid from 'shortid';

import SymbolOutput from './SymbolOutput/SymbolOutput';
import {
  cancelSpeech,
  speak,
} from '../../../../../providers/SpeechProvider/speechService';
import { useAppStore } from '../../../../../store/appStore';
import { useBoardsStore } from '../../../../../store/boardsStore';
import { useGptStore } from '../../../../../store/gptStore';
import { useLanguageStore } from '../../../../../store/languageStore';
import { useNotificationStore } from '../../../../../store/notificationStore';
import { Tile } from '../../../../../types/board';
import messages from '../../../Board.messages';

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

interface OutputContainerProps {
  improvedPhrase?: string;
}

const DEFAULT_LIVE_TILE: OutputSymbol = {
  backgroundColor: 'rgb(255, 241, 118)',
  image: '',
  label: '',
  labelKey: '',
  type: 'live',
};

function translateOutput(
  output: Tile[],
  intl: {
    messages: Record<string, string>;
    formatMessage: (message: { id: string }) => string;
  },
): OutputSymbol[] {
  return output.map((value) => {
    const translatedValue: OutputSymbol = {
      ...value,
      label: typeof value.label === 'string' ? value.label : '',
    };

    if (value.labelKey && intl.messages && intl.messages[value.labelKey]) {
      translatedValue.label = intl.formatMessage({ id: value.labelKey });
    }
    return translatedValue;
  });
}

const Output: React.FC<OutputContainerProps> = ({ improvedPhrase }) => {
  const intl = useIntl();
  const output = useBoardsStore((state) => state.output);
  const isLiveMode = useBoardsStore((state) => state.isLiveMode);
  const changeImprovedPhrase = useBoardsStore(
    (state) => state.changeImprovedPhrase,
  );
  const navigationSettings = useAppStore((state) => state.navigationSettings);
  const increaseOutputButtons = useAppStore(
    (state) => state.displaySettings.increaseOutputButtons,
  );
  const language = useLanguageStore((state) => state.lang);
  const improvePhrase = useGptStore((state) => state.improvePhrase);
  const abortImprovePhrase = useGptStore((state) => state.abortImprovePhrase);
  const changeOutput = useBoardsStore((state) => state.changeOutput);
  const changeLiveMode = useBoardsStore((state) => state.changeLiveMode);
  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  const [translatedOutput, setTranslatedOutput] = useState<OutputSymbol[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const improvePhraseRequestCounterRef = useRef(0);

  useEffect(() => {
    if (output.length !== translatedOutput.length) {
      const translated = translateOutput(output as Tile[], intl as any);
      setTranslatedOutput(translated);
    }
  }, [output, intl, translatedOutput.length]);

  const getOutputText = useCallback((): string => {
    const text = translatedOutput
      .map((symbol) => symbol.vocalization || symbol.label)
      .map((value) =>
        typeof value === 'string'
          ? value
          : typeof value === 'number'
            ? String(value)
            : '',
      )
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text;
  }, [translatedOutput]);

  useEffect(() => {
    const improvePhraseEnabled =
      (navigationSettings as { improvePhraseActive?: boolean })
        .improvePhraseActive !== false;
    if (!improvePhraseEnabled) {
      abortImprovePhrase();
      changeImprovedPhrase('');
      return;
    }

    const phrase = getOutputText();
    if (!phrase) {
      abortImprovePhrase();
      changeImprovedPhrase('');
      return;
    }

    const currentRequest = ++improvePhraseRequestCounterRef.current;
    const timeoutId = window.setTimeout(async () => {
      const nextImprovedPhrase = await improvePhrase({
        phrase,
        language,
      });
      if (improvePhraseRequestCounterRef.current !== currentRequest) {
        return;
      }
      changeImprovedPhrase(nextImprovedPhrase || '');
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      abortImprovePhrase();
    };
  }, [
    navigationSettings,
    abortImprovePhrase,
    changeImprovedPhrase,
    getOutputText,
    improvePhrase,
    language,
  ]);

  const addLiveOutputTile = useCallback(() => {
    const newTile = {
      ...DEFAULT_LIVE_TILE,
      id: shortid.generate(),
    };
    changeOutput([...translatedOutput, newTile]);
  }, [changeOutput, translatedOutput]);

  const addLiveOutputTileClearOutput = useCallback(() => {
    setTranslatedOutput([]);
    const newTile = {
      ...DEFAULT_LIVE_TILE,
      id: shortid.generate(),
    };
    changeOutput([newTile]);
  }, [changeOutput]);

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
    if (isLiveMode) {
      addLiveOutputTileClearOutput();
    } else {
      changeOutput([]);
    }
  }, [addLiveOutputTileClearOutput, changeOutput, isLiveMode]);

  const popOutput = useCallback(() => {
    const newOutput = [...output];
    newOutput.pop();

    if (isLiveMode && newOutput.length === 0) {
      addLiveOutputTileClearOutput();
    } else {
      changeOutput(newOutput);
    }
  }, [addLiveOutputTileClearOutput, changeOutput, isLiveMode, output]);

  const spliceOutput = useCallback(
    (index: number) => {
      const newOutput = [...output];
      newOutput.splice(index, 1);

      if (isLiveMode && newOutput.length === 0) {
        addLiveOutputTileClearOutput();
      } else {
        changeOutput(newOutput);
      }
    },
    [addLiveOutputTileClearOutput, changeOutput, isLiveMode, output],
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
      let audio = new Audio();

      audio.onended = () => {
        resolve();
      };

      audio.src = src;
      audio.play();
    });
  }, []);

  const asyncForEach = useCallback(
    async <T,>(
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
    (index: number) => (_event: React.MouseEvent) => {
      cancelSpeech();
      spliceOutput(index);
    },
    [spliceOutput],
  );

  const handleStopOutputClick = useCallback(() => {
    cancelSpeech();
    setIsPlaying(false);
  }, []);

  const handlePlayOutputClick = useCallback(async () => {
    if (translatedOutput && !isPlaying) {
      await play(handlePhraseToShare());
    }
  }, [translatedOutput, isPlaying, play, handlePhraseToShare]);

  const handleOutputKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
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

  const handleSwitchLiveMode = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isLiveMode) {
        addLiveOutputTile();
      }
      changeLiveMode();
    },
    [addLiveOutputTile, changeLiveMode, isLiveMode],
  );

  const handleWriteSymbol = useCallback(
    (index: number) => (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newOutput = [...output];
      const newEl = {
        ...newOutput[index],
        label: event.target.value,
      };
      newOutput.splice(index, 1, newEl);
      changeOutput(newOutput);
      const translated = translateOutput(newOutput, intl as any);
      setTranslatedOutput(translated);
    },
    [changeOutput, intl, output],
  );

  const tabIndex = output.length ? '0' : '-1';

  return (
    <SymbolOutput
      playOutput={handlePlayOutputClick}
      stopOutput={handleStopOutputClick}
      isPlaying={isPlaying}
      onBackspaceClick={handleBackspaceClick}
      onClearClick={handleClearClick}
      onCopyClick={handleCopyClick}
      onRemoveClick={handleRemoveClick}
      onKeyDown={handleOutputKeyDown}
      onSwitchLiveMode={handleSwitchLiveMode}
      symbols={translatedOutput}
      isLiveMode={isLiveMode}
      tabIndex={tabIndex}
      navigationSettings={navigationSettings}
      increaseOutputButtons={increaseOutputButtons}
      phrase={handlePhraseToShare()}
      onWriteSymbol={handleWriteSymbol}
    />
  );
};

export default Output;
