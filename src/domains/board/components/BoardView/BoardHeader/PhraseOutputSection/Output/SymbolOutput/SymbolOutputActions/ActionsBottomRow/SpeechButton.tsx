import PlayArrow from '@mui/icons-material/PlayArrow';
import StopSharp from '@mui/icons-material/StopSharp';
import IconButton from '@mui/material/IconButton';
import React from 'react';

interface SpeechButtonProps {
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

  /** Deshabilita el botón (sin contenido que reproducir/borrar) */
  disabled?: boolean;
}

const SpeechButton: React.FC<SpeechButtonProps> = ({
  increaseOutputButtons,
  isPlaying,
  ...other
}) => {
  return (
    <div>
      <IconButton
        data-tour-id="floating-play"
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
