import React from 'react';
import Helmet from 'react-helmet';

interface AppHelmetProps {
  lang: string;
  dir: string;
}

export const AppHelmet: React.FC<AppHelmetProps> = ({ lang, dir }) => (
  <Helmet>
    <html lang={lang} dir={dir} />
  </Helmet>
);
