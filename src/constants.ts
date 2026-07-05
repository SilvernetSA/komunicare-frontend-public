import { API_BASE_URL, USER_AGENT } from './platform';

// Vite-compatible env resolution with CRA fallbacks during transition
const env = (
  typeof import.meta !== 'undefined' ? import.meta.env : (process as any)?.env
) as Record<string, string> | undefined;

export const ARASAAC_BASE_PATH_API: string = 'https://api.arasaac.org/api/';
export const GLOBALSYMBOLS_BASE_PATH_API: string =
  'https://globalsymbols.com/api/v1/';
export const API_URL: string = API_BASE_URL;
export const AZURE_INST_KEY: string =
  (env?.VITE_AZURE_INST_KEY as string | undefined) ??
  (env?.REACT_APP_AZURE_INST_KEY as string | undefined) ??
  '';
export const AZURE_SPEECH_SUBSCR_KEY: string =
  (env?.VITE_AZURE_SPEECH_KEY as string | undefined) ??
  (env?.REACT_APP_AZURE_SPEECH_KEY as string | undefined) ??
  '';
export const AZURE_SPEECH_SERVICE_REGION: string =
  (env?.VITE_AZURE_SPEECH_SERVICE_REGION as string | undefined) ??
  (env?.REACT_APP_AZURE_SPEECH_SERVICE_REGION as string | undefined) ??
  'eastus';
export const AZURE_VOICES_BASE_PATH_API: string =
  'https://' +
  AZURE_SPEECH_SERVICE_REGION +
  '.tts.speech.microsoft.com/cognitiveservices/voices/';

export const NODE_ENV: string | undefined =
  (env?.NODE_ENV as string | undefined) ??
  (env?.MODE as string | undefined) ??
  undefined;

const userAgent: string = USER_AGENT;

export const IS_BROWSING_FROM_APPLE: boolean = /iPad|iPhone|iPod|Mac/.test(
  userAgent,
);

export const IS_BROWSING_FROM_APPLE_TOUCH: boolean =
  IS_BROWSING_FROM_APPLE && 'ontouchend' in document;

export const IS_BROWSING_FROM_SAFARI: boolean =
  userAgent.indexOf('Safari') > -1 &&
  userAgent.indexOf('Chrome') === -1 &&
  !navigator.userAgent.match(/crios/i) &&
  !navigator.userAgent.match(/fxios/i) &&
  !navigator.userAgent.match(/Opera|OPT\//);

const HOSTNAME: string =
  typeof window !== 'undefined' ? window.location.hostname : '';
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0']);
const PRODUCTION_HOSTNAMES = new Set(['komuni.care', 'www.komuni.care']);
const MERCADOPAGO_TEST_HOSTNAMES = new Set([
  'dev.komuni.care',
  ...LOCAL_HOSTNAMES,
]);
export const IS_PRODUCTION_HOST = PRODUCTION_HOSTNAMES.has(HOSTNAME);
const IS_MERCADOPAGO_TEST_HOST = MERCADOPAGO_TEST_HOSTNAMES.has(HOSTNAME);

// Mercado Pago
export const MERCADOPAGO_PUBLIC_KEY: string =
  (env?.VITE_MERCADOPAGO_PUBLIC_KEY as string | undefined) ?? '';
export const MERCADOPAGO_HOSTED_TEST_MODE: boolean =
  !IS_PRODUCTION_HOST && env?.VITE_MERCADOPAGO_HOSTED_TEST_MODE === 'true';
export const MERCADOPAGO_TEST_MODE: boolean =
  !IS_PRODUCTION_HOST &&
  (IS_MERCADOPAGO_TEST_HOST || env?.VITE_MERCADOPAGO_TEST_MODE === 'true');
export const MERCADOPAGO_TEST_PAYER_EMAIL: string =
  (env?.VITE_MERCADOPAGO_TEST_PAYER_EMAIL as string | undefined) ?? '';

// PayPal related constants
export const PAYPAL_CLIENT_ID: string =
  IS_PRODUCTION_HOST && NODE_ENV === 'production'
    ? 'AVQiWeMc55uBVqvgXY2yifS6v9Pt2jYxtJhA3JV0UEhLiV4Mf5W9Hanxoix8542FYACVizlyU8M0yO0S'
    : 'AZ2vK0luRWMX9zzwLs-Ko_B_TJxeHYvIFCgXWcNBt50wmj7oZcUw8n4cf11GgdClTVnYMuEs5vRnxVEk';
