import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import { useSpeechStore } from '@/domains/settings/stores/voicesStore';
import './VoiceLoadingIndicator.css';

const localMessages = defineMessages({
  loadingVoice: {
    id: 'komunicare.components.VoiceLoadingIndicator.loadingVoice',
    defaultMessage: 'Loading voice…',
  },
});

/**
 * Small floating indicator shown while a cloud (Azure) voice is synthesizing/
 * downloading — the gap between pressing play and hearing audio, which used to
 * give the user no feedback at all.
 */
const VoiceLoadingIndicator: React.FC = () => {
  const intl = useIntl();
  const isSynthesizing = useSpeechStore((state) => state.isSynthesizing);

  if (!isSynthesizing) return null;

  return (
    <div className="VoiceLoadingIndicator" role="status" aria-live="polite">
      <CircularProgress size={22} thickness={5} color="inherit" />
      <span>{intl.formatMessage(localMessages.loadingVoice)}</span>
    </div>
  );
};

export default VoiceLoadingIndicator;
