/* -------------------------------------------------------------------------- */
/*  Entrypoint – React 18 con createRoot                                       */
/* -------------------------------------------------------------------------- */

import './polyfills-browser';
import 'fontsource-roboto';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { StyledEngineProvider } from '@mui/material';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { createRoot, Root } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import App from './components/App/App';
import { NODE_ENV, AZURE_INST_KEY } from './constants';
import './index.css';
import LanguageProvider from './providers/LanguageProvider/LanguageProvider';
import SpeechProvider from './providers/SpeechProvider/SpeechProvider';
import SubscriptionProvider from './providers/SubscriptionProvider/SubscriptionProvider';
import ThemeProvider from './providers/ThemeProvider/ThemeProvider';

declare global {
  interface Window {
    __komunicareTelemetryInitialized?: boolean;
  }
}

/* ------------------------------------------------------------------ */
/*  App Insights                                                       */
/* ------------------------------------------------------------------ */
if (AZURE_INST_KEY && !window.__komunicareTelemetryInitialized) {
  const appInsights = new ApplicationInsights({
    config: {
      disableTelemetry: NODE_ENV === 'development',
      instrumentationKey: AZURE_INST_KEY,
      // Route redirects after login were generating duplicate page views.
      // Keep a single initial page view until we add explicit route tracking.
      enableAutoRouteTracking: false,
      excludeRequestFromAutoTrackingPatterns: [
        /https:\/\/dc\.services\.visualstudio\.com\/v2\/track/i,
      ],
      loggingLevelTelemetry: 2,
      enableCorsCorrelation: true,
      enableRequestHeaderTracking: true,
      enableResponseHeaderTracking: true,
      correlationHeaderExcludedDomains: [
        '*.google-analytics.com',
        'globalsymbols.com',
        '*.arasaac.org',
        'mulberrysymbols.org',
        'madaportal.org',
        '*.doubleclick.net',
        '*.mercadopago.com',
        '*.mercadolibre.com',
        '*.mlstatic.com',
        'pagead2.googlesyndication.com',
        'eastus.tts.speech.microsoft.com',
      ],
    },
  });
  appInsights.loadAppInsights();
  appInsights.trackPageView();
  window.__komunicareTelemetryInitialized = true;
}

/* ------------------------------------------------------------------ */
/*  Drag & Drop backend options                                        */
/* ------------------------------------------------------------------ */
const dndOptions = {
  enableTouchEvents: true,
  enableMouseEvents: true,
  enableKeyboardEvents: true,
};

/*  Render                                                             */
/* ------------------------------------------------------------------ */
const container = document.getElementById('root')!;
const root: Root = createRoot(container);

const AppTree = (
  <SpeechProvider>
    <LanguageProvider>
      <StyledEngineProvider injectFirst>
        <ThemeProvider>
          <SubscriptionProvider>
            <BrowserRouter>
              <DndProvider
                backend={TouchBackend}
                options={dndOptions}
                {...({} as any)}
              >
                <Routes>
                  <Route path="/*" element={<App />} />
                </Routes>
              </DndProvider>
            </BrowserRouter>
          </SubscriptionProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </LanguageProvider>
  </SpeechProvider>
);

const renderApp = (): void => {
  root.render(AppTree);
};

renderApp();
