import React from 'react';

import BuildInfo from '@/domains/app/components/BuildInfo/BuildInfo';
import { IS_DEV_ENV } from '@/domains/app/components/BuildInfo/buildInfo.constants';
import './AppLoading.css';

const AppLoading: React.FC = () => (
  <div className="AppLoading">
    <div className="AppLoading__logo">
      <img src="/images/logo.svg" alt="Komunicare" />
    </div>
    <p className="AppLoading__brand">Komunicare</p>
    <div className="AppLoading__dots">
      <span className="AppLoading__dot" />
      <span className="AppLoading__dot" />
      <span className="AppLoading__dot" />
    </div>
    {IS_DEV_ENV && (
      <div className="AppLoading__build">
        <BuildInfo variant="badge" />
      </div>
    )}
  </div>
);

export default AppLoading;
