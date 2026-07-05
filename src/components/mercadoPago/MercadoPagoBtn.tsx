import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import React, { useCallback, useEffect, useState } from 'react';

import { MERCADOPAGO_PUBLIC_KEY } from '../../constants';
import { getEnv } from '../../utils/env';

initMercadoPago(MERCADOPAGO_PUBLIC_KEY);

interface PaymentData {
  title: string;
  price: number;
}

interface PreferenceResponse {
  id: string;
}

interface WalletCustomization {
  texts: {
    valueProp: 'smart_option';
  };
}

const MercadoPagoBtn: React.FC = () => {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const { apiUrl } = getEnv();

  const createPreference = useCallback(async (): Promise<void> => {
    const paymentData: PaymentData = {
      title: 'Mensualidad',
      price: 50,
    };

    const res = await fetch(apiUrl + '/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(paymentData),
    });

    const data: PreferenceResponse = await res.json();
    setPreferenceId(data.id);
  }, [apiUrl]);

  const customization: WalletCustomization = {
    texts: {
      valueProp: 'smart_option',
    },
  };

  const onSubmit = async (): Promise<void> => {
    // callback llamado al hacer clic en Wallet Brick
    // esto es posible porque Brick es un botón
  };

  const onReady = async (): Promise<void> => {
    // Callback llamado cuando Brick esté listo.
    // Aquí puedes ocultar loadings en tu sitio, por ejemplo.
  };

  useEffect(() => {
    createPreference();
  }, [createPreference]);

  return preferenceId ? (
    <Wallet
      initialization={{ preferenceId } as any}
      customization={customization}
      onSubmit={onSubmit}
      onReady={onReady}
      onError={(error) => console.log(error)}
    />
  ) : (
    <p>Cargando...</p>
  );
};

export default MercadoPagoBtn;
