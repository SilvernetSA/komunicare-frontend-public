import { PlayArrow } from '@mui/icons-material';
import { Typography } from '@mui/material';
import React, { useEffect } from 'react';

import styles from './ImprovePhraseOutput.module.css';

interface ImprovePhraseOutputProps {
  improvedPhrase: string;
  speak: (phrase: string) => void;
  onPhraseImproved?: (phrase: string) => void;
  // Hide the inline play icon when a shared/unified play button handles it
  // (the bar stays dwell-clickable to speak the suggestion).
  hidePlayIcon?: boolean;
}

const ImprovePhraseOutput: React.FC<ImprovePhraseOutputProps> = ({
  improvedPhrase,
  speak,
  onPhraseImproved,
  hidePlayIcon,
}) => {
  const cleanPhrase = (phrase: string): string => {
    const safePhrase = typeof phrase === 'string' ? phrase : '';
    return safePhrase.replace(/\\"/g, '"').replace(/^"|"$/g, '');
  };

  const cleanedPhrase = cleanPhrase(improvedPhrase);

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
      // Make the suggested-phrase bar reachable by the face-tracking cursor's
      // dwell engine, which only clicks button/[role=button]/a[href]/[data-dwell=on].
      // Only dwellable when there's actually a phrase to speak.
      data-dwell={cleanedPhrase ? 'on' : 'off'}
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
