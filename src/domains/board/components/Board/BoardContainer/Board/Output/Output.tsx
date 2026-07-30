import React, { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import SymbolOutput from './SymbolOutput/SymbolOutput';
import {
  cancelSpeech,
  speak,
} from '@/providers/SpeechProvider/speechService';
import { useAppStore } from '@/domains/app/stores/appStore';
import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import { useNotificationStore } from '@/domains/notifications/stores/notificationStore';
import { Tile } from '@/types/board';
import messages from '../../../Board.messages';

interface OutputSymbol {
  image?: string;
  label: string;
  labelKey?: string;
  vocalization?: string;
  action?: string;
  sound?: string;
  type?: Tile['type'];
  [key: string]: unknown;
}

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

const Output: React.FC = () => {
  const intl = useIntl();
  const output = useBoardsStore((state) => state.output);
  const navigationSettings = useAppStore((state) => state.navigationSettings);
  const increaseOutputButtons = useAppStore(
    (state) => state.displaySettings.increaseOutputButtons,
  );
  const changeOutput = useBoardsStore((state) => state.changeOutput);
  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  const [translatedOutput, setTranslatedOutput] = useState<OutputSymbol[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setTranslatedOutput(translateOutput(output as Tile[], intl as any));
  }, [output, intl]);

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
    changeOutput([]);
  }, [changeOutput]);

  const popOutput = useCallback(() => {
    const newOutput = [...output];
    newOutput.pop();
    changeOutput(newOutput);
  }, [changeOutput, output]);

  const spliceOutput = useCallback(
    (index: number) => {
      const newOutput = [...output];
      newOutput.splice(index, 1);

      changeOutput(newOutput);
    },
    [changeOutput, output],
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

  const play = useCallback(async () => {
    setIsPlaying(true);
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

    setIsPlaying(false);
  }, [speakOutput, groupOutputByType, asyncForEach, outputReducer, playAudio]);

  const handleBackspaceClick = useCallback(() => {
    cancelSpeech();
    popOutput();
  }, [popOutput]);

  const handleClearClick = useCallback(() => {
    cancelSpeech();
    clearOutput();
  }, [clearOutput]);

  const handlePhraseToShare = useCallback(() => {
    return output.length ? getOutputText() : '';
  }, [getOutputText, output.length]);

  const handleCopyClick = useCallback(
    async (phrase: string) => {
      const labels = output.map((symbol) => symbol.label);
      const textToCopy = phrase || labels.join(' ');

      try {
        await navigator.clipboard.writeText(textToCopy);
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
      await play();
    }
  }, [translatedOutput, isPlaying, play]);

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
      symbols={translatedOutput}
      tabIndex={tabIndex}
      navigationSettings={navigationSettings}
      increaseOutputButtons={increaseOutputButtons}
      phrase={handlePhraseToShare()}
    />
  );
};

export default Output;
