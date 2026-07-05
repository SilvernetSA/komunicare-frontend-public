import React, { useEffect } from 'react';
import styles from './ImprovePhraseOutput.module.css';
import { Typography } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';

interface ImprovePhraseOutputProps {
  improvedPhrase: string;
  speak: (phrase: string) => void;
  onPhraseImproved?: (phrase: string) => void; // Añade esta línea
}

const ImprovePhraseOutput: React.FC<ImprovePhraseOutputProps> = ({
  improvedPhrase,
  speak,
  onPhraseImproved,
}) => {
  const cleanPhrase = (phrase: string): string => {
    const safePhrase = typeof improvedPhrase === 'string' ? improvedPhrase : '';
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
      className={enabledControllsClassname}
      onClick={handlePlay}
    >
      <Typography className={styles.text} variant="h5">
        {cleanedPhrase}
      </Typography>
      {cleanedPhrase && (
        <PlayArrow className={styles.playArrow} fontSize="large" />
      )}
    </div>
  );
};

export default ImprovePhraseOutput;
