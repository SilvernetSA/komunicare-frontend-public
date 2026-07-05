import Typography from '@mui/material/Typography';
import React from 'react';

import { buildInfoLabel } from './buildInfo.constants';

interface BuildInfoProps {
  /**
   * `inline`: texto atenuado para incrustar (p. ej. en Ajustes → About).
   * `badge`: insignia fija en la esquina inferior derecha de la pantalla.
   */
  variant?: 'inline' | 'badge';
}

const badgeStyle: React.CSSProperties = {
  position: 'fixed',
  right: 8,
  bottom: 8,
  zIndex: 2000,
  padding: '2px 8px',
  borderRadius: 4,
  background: 'rgba(0, 0, 0, 0.6)',
  color: '#fff',
  fontFamily: 'monospace',
  letterSpacing: 0.2,
  pointerEvents: 'none',
};

const BuildInfo: React.FC<BuildInfoProps> = ({ variant = 'inline' }) => {
  if (variant === 'badge') {
    return (
      <Typography variant="caption" aria-label="build-info" style={badgeStyle}>
        {buildInfoLabel}
      </Typography>
    );
  }

  return (
    <Typography variant="caption" color="textSecondary" aria-label="build-info">
      {buildInfoLabel}
    </Typography>
  );
};

export default BuildInfo;
