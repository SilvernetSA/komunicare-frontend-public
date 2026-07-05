import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

interface LoadingSpinnerProps {
  size?: number;
  thickness?: number;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 60,
  thickness = 4,
  className = '',
}) => (
  <div className="Settings__spinner-container">
    <CircularProgress
      size={size}
      thickness={thickness}
      className={`Settings__loading-Spinner ${className}`}
    />
  </div>
);

export const InlineLoadingSpinner: React.FC = () => (
  <CircularProgress
    size={60}
    className="Settings__Language__Spinner"
    thickness={5}
  />
);
