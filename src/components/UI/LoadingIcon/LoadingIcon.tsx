import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

import './LoadingIcon.css';

function LoadingIcon() {
  return <CircularProgress className="LoadingIcon" size={14} />;
}

export default LoadingIcon;
