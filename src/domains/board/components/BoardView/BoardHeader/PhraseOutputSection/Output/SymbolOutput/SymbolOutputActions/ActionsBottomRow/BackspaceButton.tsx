import BackspaceIcon from '@mui/icons-material/Backspace';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import React from 'react';

interface BackspaceButtonProps {
  /** Tamaño grande en la salida (clase extra) */
  increaseOutputButtons?: boolean;

  /** Estilo personalizado */
  style?: React.CSSProperties;

  /** Función de clic */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /** Deshabilita el botón (sin contenido que reproducir/borrar) */
  disabled?: boolean;
}

const BackspaceButton: React.FC<BackspaceButtonProps> = ({
  increaseOutputButtons,
  ...other
}) => {
  const theme = useTheme();
  /* fallback a 'ltr' si theme aún no está disponible */
  const direction = theme?.direction ?? 'ltr';

  const backspaceIconStyle =
    direction === 'ltr' ? undefined : { transform: 'scaleX(-1)' };

  return (
    <div>
      <IconButton
        aria-label="Backspace"
        className={
          increaseOutputButtons ? 'Output__button__lg' : 'Output__button__sm'
        }
        size="large"
        {...other}
      >
        <BackspaceIcon
          className={
            increaseOutputButtons ? 'Output__icon__lg' : 'Output__icon__sm'
          }
          style={backspaceIconStyle}
        />
      </IconButton>
    </div>
  );
};

export default BackspaceButton;
