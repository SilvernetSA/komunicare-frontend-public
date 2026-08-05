import { CardPayment, initMercadoPago } from '@mercadopago/sdk-react';
import {
  Alert,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import FullScreenDialog from '@/domains/app/components/FullScreenDialog/FullScreenDialog';
import {
  MERCADOPAGO_HOSTED_TEST_MODE,
  MERCADOPAGO_PUBLIC_KEY,
  MERCADOPAGO_TEST_MODE,
  MERCADOPAGO_TEST_PAYER_EMAIL,
  NODE_ENV,
} from '@/constants';
import { useAppStore } from '@/domains/app/stores/appStore';
import { useSubscriptionStore } from '@/domains/subscription/stores/subscriptionStore';

const BRICK_LOAD_TIMEOUT_MS = 12_000;
const TEST_USER_EMAIL_PATTERN = /^[^\s@]+@testuser\.com$/i;
const TEST_PAYER_EMAIL_STORAGE_KEY = 'mercadopago-test-payer-email';

if (MERCADOPAGO_PUBLIC_KEY && !MERCADOPAGO_HOSTED_TEST_MODE) {
  initMercadoPago(MERCADOPAGO_PUBLIC_KEY, {
    locale: 'es-AR',
    trackingDisabled: NODE_ENV !== 'production',
  });
}

const MercadoPagoForm: React.FC = () => {
  const products = useSubscriptionStore((state) => state.products);
  const userEmail = useAppStore(
    (state) => (state.userData as any)?.email as string | undefined,
  );
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [testSubscriptionId, setTestSubscriptionId] = useState('');
  const [isBrickReady, setIsBrickReady] = useState(false);
  const [brickError, setBrickError] = useState('');
  const [testPayerEmail, setTestPayerEmail] = useState(() => {
    if (!MERCADOPAGO_TEST_MODE) return '';

    if (MERCADOPAGO_TEST_PAYER_EMAIL) {
      return MERCADOPAGO_TEST_PAYER_EMAIL;
    }

    return window.localStorage.getItem(TEST_PAYER_EMAIL_STORAGE_KEY) ?? '';
  });
  const payerEmail = MERCADOPAGO_TEST_MODE
    ? testPayerEmail.trim().toLowerCase()
    : (userEmail ?? '');
  const isTestPayerEmailValid = TEST_USER_EMAIL_PATTERN.test(payerEmail);

  useEffect(() => {
    const hasMercadoPagoPlan = useSubscriptionStore
      .getState()
      .products.some((product) => product.provider === 'mercadopago');

    if (hasMercadoPagoPlan) return;

    let isMounted = true;
    setIsLoadingPlan(true);

    void useSubscriptionStore
      .getState()
      .updatePlans()
      .finally(() => {
        if (isMounted) setIsLoadingPlan(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const mercadopagoPlan = products.find((e) => e.provider === 'mercadopago');

  const handleGoBack = useCallback((): void => {
    window.location.replace('/settings/subscribe');
  }, []);

  const initialization = useMemo(
    () => ({
      amount: mercadopagoPlan?.price ?? 0,
      payer: { email: payerEmail },
    }),
    [mercadopagoPlan?.price, payerEmail],
  );

  const customization = useMemo(
    () => ({
      visual: { style: 'default' },
      paymentMethods: { maxInstallments: 1 },
    }),
    [],
  );

  useEffect(() => {
    if (MERCADOPAGO_HOSTED_TEST_MODE || isBrickReady || brickError) return;
    if (MERCADOPAGO_TEST_MODE && !isTestPayerEmailValid) return;

    const timer = window.setTimeout(() => {
      setBrickError(
        'Mercado Pago no pudo cargar los campos seguros. En Brave, desactiva Shields para localhost y recarga la página.',
      );
    }, BRICK_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [brickError, isBrickReady, isTestPayerEmailValid]);

  const handleReady = useCallback((): void => {
    setBrickError('');
    setIsBrickReady(true);
  }, []);

  useEffect(() => {
    if (MERCADOPAGO_TEST_MODE && isTestPayerEmailValid) {
      window.localStorage.setItem(TEST_PAYER_EMAIL_STORAGE_KEY, payerEmail);
    }
  }, [isTestPayerEmailValid, payerEmail]);

  const handleSubmit = useCallback(
    async (formData: {
      token: string;
      payer?: { email?: string };
    }): Promise<void> => {
      if (!mercadopagoPlan?.planId || !formData.token) return;

      try {
        if (MERCADOPAGO_TEST_MODE && !isTestPayerEmailValid) {
          throw new Error(
            'Ingresa el email exacto del comprador TEST de Mercado Pago (termina en @testuser.com).',
          );
        }

        const response = await useSubscriptionStore
          .getState()
          .createSubscriptionCheckout({
            cardTokenId: formData.token,
            planId: mercadopagoPlan.planId,
            provider: 'mercadopago',
            email: MERCADOPAGO_TEST_MODE
              ? payerEmail
              : (formData.payer?.email ?? payerEmail),
          });

        if (response.subscriptionId) {
          const callbackUrl = new URL(
            '/settings/subscribe',
            window.location.origin,
          );
          callbackUrl.searchParams.set(
            'preapproval_id',
            response.subscriptionId,
          );
          window.location.replace(callbackUrl.toString());
          return;
        }

        throw new Error('Mercado Pago did not return a subscription id');
      } catch (error: unknown) {
        const detail =
          (error as any)?.message || 'No se pudo crear la suscripción';
        console.error('createSubscriptionCheckout error:', detail);
        alert(detail);
        throw error;
      }
    },
    [isTestPayerEmailValid, mercadopagoPlan?.planId, payerEmail],
  );

  const handleError = useCallback((error: { message?: string }): void => {
    const detail = error.message || 'No se pudo tokenizar la tarjeta';
    setBrickError(detail);
    console.error('Mercado Pago CardPayment error:', detail);
  }, []);

  const handleTestCheckout = useCallback(async (): Promise<void> => {
    if (!mercadopagoPlan?.planId || isRedirecting) return;

    const normalizedTestPayerEmail = testPayerEmail.trim().toLowerCase();
    if (!TEST_USER_EMAIL_PATTERN.test(normalizedTestPayerEmail)) {
      setBrickError(
        'Ingresa el email exacto del comprador TEST de Mercado Pago (termina en @testuser.com).',
      );
      return;
    }

    const checkoutWindow = window.open(
      'about:blank',
      'mercadopago-subscription',
    );
    setBrickError('');
    setIsRedirecting(true);

    try {
      const response = await useSubscriptionStore
        .getState()
        .createSubscriptionCheckout({
          planId: mercadopagoPlan.planId,
          provider: 'mercadopago',
          email: normalizedTestPayerEmail,
        });

      if (!response.init_point) {
        throw new Error('Mercado Pago did not return a checkout URL');
      }

      if (!response.subscriptionId) {
        throw new Error('Mercado Pago did not return a subscription id');
      }

      setTestSubscriptionId(response.subscriptionId);
      setIsRedirecting(false);

      if (checkoutWindow) {
        checkoutWindow.opener = null;
        checkoutWindow.location.replace(response.init_point);
      } else {
        window.location.replace(response.init_point);
      }
    } catch (error: unknown) {
      checkoutWindow?.close();
      const detail =
        (error as any)?.message || 'No se pudo iniciar el checkout';
      setBrickError(detail);
      setIsRedirecting(false);
    }
  }, [isRedirecting, mercadopagoPlan?.planId, testPayerEmail]);

  const handleTestConfirmation = useCallback(async (): Promise<void> => {
    if (!testSubscriptionId || isConfirming) return;

    setBrickError('');
    setIsConfirming(true);

    try {
      const subscription = await useSubscriptionStore
        .getState()
        .confirmMercadoPagoSubscription(testSubscriptionId);

      if (subscription.status !== 'ACTIVE') {
        throw new Error(
          'La suscripción todavía está pendiente en Mercado Pago.',
        );
      }

      window.location.replace('/settings/subscription');
    } catch (error: unknown) {
      setBrickError(
        (error as any)?.message || 'No se pudo confirmar la suscripción',
      );
      setIsConfirming(false);
    }
  }, [isConfirming, testSubscriptionId]);

  if (isLoadingPlan) {
    return (
      <FullScreenDialog open title={'Mercado Pago'} onClose={handleGoBack}>
        <div
          style={{
            width: '100%',
            marginTop: '2rem',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </div>
      </FullScreenDialog>
    );
  }

  if (!mercadopagoPlan?.planId) {
    return (
      <FullScreenDialog open title={'Mercado Pago'} onClose={handleGoBack}>
        <div style={{ width: '100%', marginTop: '2rem', textAlign: 'center' }}>
          No Mercado Pago plan is currently available.
        </div>
      </FullScreenDialog>
    );
  }

  if (!MERCADOPAGO_HOSTED_TEST_MODE && !MERCADOPAGO_PUBLIC_KEY) {
    return (
      <FullScreenDialog open title={'Mercado Pago'} onClose={handleGoBack}>
        <Alert severity="error" sx={{ margin: '2rem' }}>
          Falta configurar la clave pública de Mercado Pago.
        </Alert>
      </FullScreenDialog>
    );
  }

  if (MERCADOPAGO_HOSTED_TEST_MODE) {
    return (
      <FullScreenDialog open title={'Mercado Pago'} onClose={handleGoBack}>
        <div
          style={{
            width: '100%',
            marginTop: '2rem',
            padding: '0 1rem 2rem',
            boxSizing: 'border-box',
          }}
        >
          <Alert severity="info" sx={{ marginBottom: '1rem' }}>
            {testSubscriptionId
              ? 'Completa el pago en la pestaña de Mercado Pago y luego confirma aquí.'
              : 'Vas a continuar en Mercado Pago para completar la suscripción de prueba.'}
          </Alert>

          <Alert severity="warning" sx={{ marginBottom: '1rem' }}>
            Inicia sesión en Mercado Pago con el mismo comprador TEST cuyo email
            ingresas abajo. No tiene que coincidir con tu cuenta de Komunicare.
          </Alert>

          {!testSubscriptionId && (
            <TextField
              fullWidth
              type="email"
              label="Email del comprador TEST de Mercado Pago"
              value={testPayerEmail}
              onChange={(event) => setTestPayerEmail(event.target.value)}
              helperText="Usa el email exacto asociado al usuario TEST con el que iniciarás sesión."
              sx={{ marginBottom: '1rem' }}
            />
          )}

          {brickError && (
            <Alert severity="error" sx={{ marginBottom: '1rem' }}>
              {brickError}
            </Alert>
          )}

          {testSubscriptionId ? (
            <Button
              variant="contained"
              fullWidth
              disabled={isConfirming}
              onClick={() => void handleTestConfirmation()}
            >
              {isConfirming ? 'Confirmando...' : 'Ya completé la suscripción'}
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              disabled={isRedirecting}
              onClick={() => void handleTestCheckout()}
            >
              {isRedirecting ? 'Redirigiendo...' : 'Continuar en Mercado Pago'}
            </Button>
          )}
        </div>
      </FullScreenDialog>
    );
  }

  return (
    <FullScreenDialog open title={'Mercado Pago'} onClose={handleGoBack}>
      <div
        style={{
          width: '100%',
          minHeight: '520px',
          marginTop: '2rem',
          padding: '0 1rem 2rem',
          boxSizing: 'border-box',
        }}
      >
        {!isBrickReady &&
          !brickError &&
          (!MERCADOPAGO_TEST_MODE || isTestPayerEmailValid) && (
            <div
              style={{
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
              }}
            >
              <CircularProgress />
              <Typography>Cargando formulario seguro...</Typography>
            </div>
          )}

        {MERCADOPAGO_TEST_MODE && (
          <>
            <Alert severity="info" sx={{ marginBottom: '1rem' }}>
              Entorno de prueba: usa la tarjeta TEST y el email del comprador
              TEST que te asignaron.
            </Alert>

            <TextField
              fullWidth
              type="email"
              label="Email del comprador TEST de Mercado Pago"
              value={testPayerEmail}
              onChange={(event) => {
                setTestPayerEmail(event.target.value);
                setIsBrickReady(false);
                setBrickError('');
              }}
              error={testPayerEmail.length > 0 && !isTestPayerEmailValid}
              helperText={
                testPayerEmail.length > 0 && !isTestPayerEmailValid
                  ? 'Debe terminar en @testuser.com.'
                  : 'Se recordará únicamente en este navegador.'
              }
              sx={{ marginBottom: '1rem' }}
            />
          </>
        )}

        {brickError && (
          <Alert severity="error" sx={{ marginBottom: '1rem' }}>
            {brickError}
          </Alert>
        )}

        {(!MERCADOPAGO_TEST_MODE || isTestPayerEmailValid) && (
          <CardPayment
            key={MERCADOPAGO_TEST_MODE ? payerEmail : 'card-payment'}
            initialization={initialization}
            customization={customization as any}
            locale="es-AR"
            onReady={handleReady}
            onSubmit={handleSubmit as any}
            onError={handleError}
          />
        )}
      </div>
    </FullScreenDialog>
  );
};

export default MercadoPagoForm;
