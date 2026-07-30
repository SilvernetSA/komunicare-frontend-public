import { PlayArrow } from '@mui/icons-material';
import { Typography } from '@mui/material';
import React, { useEffect } from 'react';

import styles from './ImprovePhraseOutput.module.css';
import { cleanImprovedPhrase } from './useImprovePhrase';

interface ImprovePhraseOutputProps {
  improvedPhrase: string;
  speak: (phrase: string) => void;
  onPhraseImproved?: (phrase: string) => void;
  // Hide the inline play icon when a shared/unified play button handles it.
  hidePlayIcon?: boolean;
}

const ImprovePhraseOutput: React.FC<ImprovePhraseOutputProps> = ({
  improvedPhrase,
  speak,
  onPhraseImproved,
  hidePlayIcon,
}) => {
  const cleanedPhrase = cleanImprovedPhrase(improvedPhrase);

  useEffect(() => {
    if (cleanedPhrase && onPhraseImproved) {
      onPhraseImproved(cleanedPhrase);
    }
  }, [cleanedPhrase, onPhraseImproved]);

  const handlePlay = async () => {
    if (!cleanedPhrase || cleanedPhrase.length === 0) return;
    speak(cleanedPhrase);
  };

  const enabledControllsClassname = cleanedPhrase
    ? `${styles.text_and_controls} ${styles.enabled}`
    : styles.text_and_controls;

  return (
    <div
      tabIndex={0}
      role="button"
      className={enabledControllsClassname}
      onClick={handlePlay}
    >
      <Typography className={styles.text} variant="h5">
        {cleanedPhrase}
      </Typography>
      {cleanedPhrase && !hidePlayIcon && (
        <PlayArrow className={styles.playArrow} fontSize="large" />
      )}
    </div>
  );
};

export default ImprovePhraseOutput;
