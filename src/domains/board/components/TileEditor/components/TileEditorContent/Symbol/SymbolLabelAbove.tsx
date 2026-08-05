import { Typography } from '@mui/material';
import React from 'react';

interface SymbolLabelAboveProps {
  type?: string;
  labelpos?: string;
  label: string | React.ReactNode;
}

export const SymbolLabelAbove: React.FC<SymbolLabelAboveProps> = ({
  type,
  labelpos,
  label,
}) => {
  if (type === 'live' || labelpos !== 'Above') return null;

  return <Typography className="Symbol__label">{label}</Typography>;
};
