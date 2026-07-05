/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  // Vite-first variables
  readonly VITE_API_URL?: string;
  readonly VITE_DEV_API_URL?: string;
  readonly VITE_AZURE_INST_KEY?: string;
  readonly VITE_AZURE_SPEECH_KEY?: string;
  readonly VITE_AZURE_SPEECH_SERVICE_REGION?: string;
  readonly VITE_KOMUNICARE_ENV?: string;
  readonly VITE_MERCADOPAGO_PUBLIC_KEY?: string;
  readonly VITE_MERCADOPAGO_HOSTED_TEST_MODE?: string;
  readonly VITE_MERCADOPAGO_TEST_MODE?: string;
  readonly VITE_MERCADOPAGO_TEST_PAYER_EMAIL?: string;
  readonly VITE_PUBLIC_APP_URL?: string;
  readonly REACT_APP_API_URL?: string;
  readonly REACT_APP_DEV_API_URL?: string;
  readonly REACT_APP_AZURE_INST_KEY?: string;
  readonly REACT_APP_AZURE_SPEECH_KEY?: string;
  readonly REACT_APP_AZURE_SPEECH_SERVICE_REGION?: string;
  readonly REACT_APP_PUBLIC_URL?: string;
  readonly KOMUNICARE_ENV?: string;
  readonly PUBLIC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Build info inyectada por Vite (ver `define` en vite.config.ts)
declare const __APP_VERSION__: string;
declare const __APP_COMMIT__: string;
declare const __APP_BUILD_DATE__: string;
