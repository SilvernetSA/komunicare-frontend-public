import { Typography } from '@mui/material';
import React from 'react';

interface SymbolLabelBelowProps {
  type?: string;
  labelpos?: string;
  label: string | React.ReactNode;
}

export const SymbolLabelBelow: React.FC<SymbolLabelBelowProps> = ({
  type,
  labelpos,
  label,
}) => {
  if (type === 'live' || labelpos !== 'Below') return null;

  return <Typography className="Symbol__label">{label}</Typography>;
};
