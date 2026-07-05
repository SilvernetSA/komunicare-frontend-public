import ClearIcon from '@mui/icons-material/Clear';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import React, { useCallback } from 'react';

import { EMPTY_VOICES } from '../../../providers/SpeechProvider/SpeechProvider.constants';
import { speak } from '../../../providers/SpeechProvider/speechService';
import { useBoardsStore } from '../../../store/boardsStore';
import { useSpeechStore } from '../../../store/voicesStore';

import type { Tile } from '../../../types/board';

interface BoardOutputProps {
  onClear?: () => void;
  onSpeak?: () => void;
  className?: string;
}

const BoardOutput: React.FC<BoardOutputProps> = ({
  onClear,
  onSpeak,
  className = '',
}) => {
  const output = useBoardsStore((s) => s.output);
  const changeOutput = useBoardsStore((s) => s.changeOutput);
  const voices = useSpeechStore((s) => s.voices);
  const options = useSpeechStore((s) => s.options);

  const canSpeak =
    voices.length > 0 &&
    options.voiceURI !== EMPTY_VOICES &&
    !!options.voiceURI;

  const clearOutput = useCallback(() => changeOutput([]), [changeOutput]);

  const speakText = useCallback((text: string) => {
    if (text.trim()) speak(text);
  }, []);

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      clearOutput();
    }
  };

  const handleSpeak = () => {
    if (onSpeak) {
      onSpeak();
    } else {
      const text = output
        .map((tile: Tile) => tile.label || tile.vocalization || '')
        .join(' ');
      speakText(text);
    }
  };

  const outputText = output.map((tile: Tile) => tile.label || '').join(' ');

  return (
    <Paper className={`Board__Output ${className}`} elevation={2}>
      <div className="Board__Output__Content">
        <div className="Board__Output__Text">
          {outputText || 'Select tiles to build a sentence...'}
        </div>

        <div className="Board__Output__Actions">
          <IconButton
            onClick={handleSpeak}
            disabled={!canSpeak || !outputText.trim()}
            color="primary"
          >
            <VolumeUpIcon />
          </IconButton>

          <IconButton onClick={handleClear} disabled={output.length === 0}>
            <ClearIcon />
          </IconButton>
        </div>
      </div>
    </Paper>
  );
};

export default BoardOutput;
