import React, { Fragment } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Devices from './Devices/Devices';
import Display from './Display/Display';
import Language from './Language/Language';
import Navigation from './Navigation/Navigation';
import People from './People/People';
import Settings from './Settings';
import Speech from './Speech/Speech';
import Subscribe from './Subscribe/Subscribe';
import MercadoPagoForm from '../mercadoPago/MercadoPagoForm';

const SettingsWrapper = () => {
  const location = useLocation();
  const isExactSettings = location.pathname === '/settings';

  return (
    <Fragment>
      {isExactSettings && <Settings />}
      <Routes>
        <Route path="people" element={<People />} />
        <Route path="subscribe" element={<Subscribe />} />
        <Route path="subscription" element={<Subscribe />} />
        <Route path="mercado-pago" element={<MercadoPagoForm />} />
        <Route path="language" element={<Language />} />
        <Route path="speech" element={<Speech />} />
        <Route path="display" element={<Display />} />
        <Route path="devices" element={<Devices />} />
        <Route path="navigation" element={<Navigation />} />
      </Routes>
    </Fragment>
  );
};

export default SettingsWrapper;
