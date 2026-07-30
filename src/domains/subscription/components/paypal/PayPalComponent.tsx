import { OrderResponseBody } from '@paypal/paypal-js/types/apis/orders';
import {
  PayPalScriptProvider,
  PayPalButtons,
  PayPalButtonsComponentProps,
} from '@paypal/react-paypal-js';
import React from 'react';
/* -------------   FORZAMOS LOS TIPOS ------------- */
 
// @ts-ignore  – las defs actuales no sirven con React 19
/* -------------   FORZAMOS LOS TIPOS ------------- */
 
// @ts-ignore  – las defs actuales no sirven con React 19

import { PAYPAL_CLIENT_ID } from '@/constants';

// PayPal configuration
const paypalOptions = {
  clientId:
    'AQMRKC1JgfLLLsuqvQwjnbyLqbi8mStaVdOiBV63nTViRz_ZurOOsY9_AXz-TqLiYHuskQUvGAL7_INy',
  currency: 'USD',
  intent: 'subscription',
  vault: true,
};

export const PayPalComponent = ({ children }) => {
  const buttonProps: PayPalButtonsComponentProps = {
    style: {
      layout: 'vertical',
      color: 'blue',
      shape: 'rect',
      label: 'paypal',
    },
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: '10.00', // Monto a cobrar
            },
          },
        ],
        intent: 'CAPTURE',
      });
    },
    onApprove: async (data, actions) => {
      if (actions.order) {
        type NewType = OrderResponseBody;

        const order: NewType = await actions.order.capture();
        console.log('Transaction completed:', order);
        alert(`Transaction completed: ${order.id}`);
      }
    },
    onError: (error: any) => {
      console.error('PayPal Error:', error);
      alert('An error occurred during the payment process.');
    },
  };

  return (
    /* -------------   FORZAMOS LOS TIPOS ------------- */
     
    // @ts-ignore  – las defs actuales no sirven con React 19
    <PayPalScriptProvider options={paypalOptions}>
      {children}
      {/* <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center" }}>
        <h1>Pagar con PayPal</h1>
        <PayPalButtons
            {...buttonProps}
        />
      </div> */}
    </PayPalScriptProvider>
  );
};
