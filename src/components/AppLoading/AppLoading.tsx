import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

import BuildInfo from '../UI/BuildInfo/BuildInfo';
import { IS_DEV_ENV } from '../UI/BuildInfo/buildInfo.constants';
import './AppLoading.css';

const AppLoading: React.FC = () => (
  <div className="AppLoading">
    <p className="AppLoading__main-message">Komunicare is loading...</p>
    <div className="AppLoading__loading">
      <CircularProgress size={40} thickness={3} color="inherit" />
    </div>
    {IS_DEV_ENV && <BuildInfo variant="badge" />}
  </div>
);

export default AppLoading;
