import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { TtsEngine } from '@/types/language';
import messages from '../Language.messages';

interface TtsEngineSelectorProps {
  ttsEngine: string;
  ttsEngines: TtsEngine[];
  loading: boolean;
  ttsEngineError?: boolean;
  onTtsEngineChange: (event: { target: { value: string } }) => void;
}

export const TtsEngineSelector: React.FC<TtsEngineSelectorProps> = ({
  ttsEngine,
  ttsEngines,
  loading,
  ttsEngineError,
  onTtsEngineChange,
}) => (
  <div className="Settings__Language__TTSEnginesContainer">
    <FormControl
      className="Settings__Language__TTSEnginesContainer__Select"
      variant="standard"
      error={ttsEngineError}
      disabled={loading}
    >
      <InputLabel id="tts-engines-select-label">
        <FormattedMessage {...messages.ttsEngines} />
      </InputLabel>
      <Select
        labelId="tts-engines-select-label"
        id="tts-engines-select"
        autoWidth={false}
        value={ttsEngine}
        onChange={onTtsEngineChange}
        inputProps={{
          name: 'tts-engine',
          id: 'language-tts-engine',
        }}
      >
        {ttsEngines.map((ttsEng, i) => (
          <MenuItem key={i} value={ttsEng.name}>
            {ttsEng.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </div>
);
