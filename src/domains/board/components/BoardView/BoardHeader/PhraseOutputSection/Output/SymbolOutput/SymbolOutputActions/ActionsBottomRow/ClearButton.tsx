import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import React from 'react';

interface ClearButtonProps {
  /**
   * Tamaño grande en la salida (clase extra)
   */
  increaseOutputButtons?: boolean;

  /**
   * Estilo personalizado
   */
  style?: React.CSSProperties;

  /**
   * Color del botón
   */
  color?: 'inherit' | 'primary' | 'secondary' | 'default';

  /**
   * Función de clic
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /** Deshabilita el botón (sin contenido que reproducir/borrar) */
  disabled?: boolean;
}

const ClearButton: React.FC<ClearButtonProps> = ({
  increaseOutputButtons,
  ...other
}) => {
  return (
    <div>
      <IconButton
        aria-label="Clear"
        data-tour-id="floating-clear"
        className={
          increaseOutputButtons ? 'Output__button__lg' : 'Output__button__sm'
        }
        {...other}
        size="large"
      >
        <ClearIcon
          className={
            increaseOutputButtons ? 'Output__icon__lg' : 'Output__icon__sm'
          }
        />
      </IconButton>
    </div>
  );
};

export default ClearButton;
