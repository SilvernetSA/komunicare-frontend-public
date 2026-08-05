import ShareIcon from '@mui/icons-material/Share';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import React from 'react';

/* ------------------------------------------------------------------ */
/*  Tipos                                                             */
/* ------------------------------------------------------------------ */
interface ShareButtonProps {
  hidden?: boolean;
  label?: string;
  color?: 'inherit' | 'primary' | 'secondary' | 'default';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Componente                                                        */
/* ------------------------------------------------------------------ */
const ShareButton: React.FC<ShareButtonProps> = ({
  hidden: _hidden,
  ...other
}) => {
  const theme = useTheme();
  /* Si theme viene indefinido usamos 'ltr' por defecto */
  const direction = theme?.direction ?? 'ltr';

  const shareIconStyle =
    direction === 'ltr' ? undefined : { transform: 'scaleX(-1)' };

  return (
    <div>
      <IconButton
        aria-label="share"
        className={other.className || ''}
        size="large"
        sx={{ alignSelf: 'center' }}
        {...other}
      >
        <ShareIcon
          className={
            other.className?.includes('Output__button__lg')
              ? 'Output__icon__lg'
              : 'Output__icon__sm'
          }
          style={shareIconStyle}
        />
      </IconButton>
    </div>
  );
};

export default ShareButton;
