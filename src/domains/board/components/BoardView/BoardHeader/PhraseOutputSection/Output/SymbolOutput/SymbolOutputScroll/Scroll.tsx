import { useTheme } from '@mui/material/styles';
import React from 'react';

import './Scroll.css';

interface ScrollProps {
  /**
   * Contenido del componente
   */
  children?: React.ReactNode;

  /**
   * Estilos personalizados
   */
  style?: React.CSSProperties;

  /**
   * Referencia al contenedor de scroll
   */
  scrollContainerReference?: React.RefObject<HTMLDivElement>;
}

const Scroll: React.FC<ScrollProps> = ({
  children,
  style,
  scrollContainerReference,
  ...other
}) => {
  const theme = useTheme();
  const direction = theme?.direction ?? 'ltr';

  return (
    <div
      className="Scroll__container"
      style={{ ...style, direction }}
      ref={scrollContainerReference}
      {...other}
    >
      {children}
    </div>
  );
};

export default Scroll;
