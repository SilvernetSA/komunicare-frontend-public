import React from 'react';

import { IS_DEV_ENV } from '@/domains/app/components/BuildInfo/buildInfo.constants';
import BuildInfoBadge from '@/domains/app/components/BuildInfo/BuildInfoBadge';

export const AppLoadingBuildInfo: React.FC = () => {
  if (!IS_DEV_ENV) return null;

  return (
    <div className="AppLoading__build">
      <BuildInfoBadge />
    </div>
  );
};
