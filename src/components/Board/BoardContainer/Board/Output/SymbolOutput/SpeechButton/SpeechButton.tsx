import React from 'react';

import IconButton from '@mui/material/IconButton';
import PlayArrow from '@mui/icons-material/PlayArrow';
import StopSharp from '@mui/icons-material/StopSharp';

interface SpeechButtonProps {
  /**
   * Oculta / deshabilita el botón para escaneo
   */
  hidden?: boolean;

  /**
   * Tamaño grande en la salida (clase extra)
   */
  increaseOutputButtons?: boolean;

  /**
   * Estado de reproducción actual
   */
  isPlaying?: boolean;

  /**
   * Color del botón
   */
  color?: 'inherit' | 'primary' | 'secondary' | 'default';

  /**
   * Estilo personalizado
   */
  style?: React.CSSProperties;

  /**
   * Función de clic
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const SpeechButton: React.FC<SpeechButtonProps> = ({
  hidden,
  increaseOutputButtons,
  isPlaying,
  ...other
}) => {
  return (
    <div>
      <IconButton
        className={
          increaseOutputButtons ? 'Output__button__lg' : 'Output__button__sm'
        }
        {...other}
        size="large"
      >
        {!isPlaying ? (
          <PlayArrow
            className={`playSpeechBtn ${
              increaseOutputButtons ? 'Output__icon__lg' : 'Output__icon__sm'
            }`}
          />
        ) : (
          <StopSharp
            className={
              increaseOutputButtons ? 'Output__icon__lg' : 'Output__icon__sm'
            }
          />
        )}
      </IconButton>
    </div>
  );
};

export default SpeechButton;
