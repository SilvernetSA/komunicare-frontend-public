import React from 'react';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';

interface ClearButtonProps {
  /**
   * @ignore
   */
  hidden?: boolean;

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
}

const ClearButton: React.FC<ClearButtonProps> = ({
  hidden,
  increaseOutputButtons,
  ...other
}) => {
  return (
    <div>
      <IconButton
        aria-label="Clear"
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
