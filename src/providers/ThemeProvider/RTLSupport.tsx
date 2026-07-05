import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import React, { ReactNode } from 'react';
import rtlPlugin from 'stylis-plugin-rtl';

interface RTLSupportProps {
  children: ReactNode;
  dir: 'ltr' | 'rtl';
}

const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
});

const ltrCache = createCache({
  key: 'mui',
});

const RTLSupport: React.FC<RTLSupportProps> = ({ children, dir }) => {
  const cache = dir === 'rtl' ? rtlCache : ltrCache;

  return <CacheProvider value={cache}>{children}</CacheProvider>;
};

export default RTLSupport;
