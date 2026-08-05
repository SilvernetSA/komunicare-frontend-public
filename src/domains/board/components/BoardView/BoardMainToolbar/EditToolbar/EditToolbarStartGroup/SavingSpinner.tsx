import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

interface SavingSpinnerProps {
  isSaving: boolean;
}

export const SavingSpinner: React.FC<SavingSpinnerProps> = ({ isSaving }) => {
  if (!isSaving) return null;

  return (
    <CircularProgress
      size={24}
      className="EditToolbar__Spinner"
      thickness={7}
    />
  );
};
