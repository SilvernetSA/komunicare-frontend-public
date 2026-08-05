import React, { Component, ErrorInfo, ReactNode } from 'react';

import { ErrorBoundaryDescription } from './components/ErrorBoundaryDescription';
import { ErrorBoundaryReloadButton } from './components/ErrorBoundaryReloadButton';
import { ErrorBoundaryTitle } from './components/ErrorBoundaryTitle';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Reload guard shared with the `vite:preloadError` handler in index.tsx: if a
// failed chunk (stale service-worker cache after a deploy) surfaces as a
// render-time throw, reload once to pick up the fresh index.html instead of
// leaving the user on a blank screen. The timestamp self-expires so a genuine
// error later can still trigger one recovery reload.
const RELOAD_FLAG = 'komunicare:chunk-reload-at';
const RELOAD_COOLDOWN_MS = 10_000;

const isChunkLoadError = (error: Error): boolean =>
  /Loading chunk|dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(
    `${error?.name} ${error?.message}`,
  );

/**
 * Top-level error boundary. Without one, any render-time throw unmounts the
 * whole React tree to a blank white screen with no way to recover. This catches
 * those throws, auto-reloads once for the common "stale chunk after deploy"
 * case, and otherwise shows a minimal fallback with a manual reload.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Uncaught error in React tree', error, info);

    if (isChunkLoadError(error)) {
      const last = Number(sessionStorage.getItem(RELOAD_FLAG) || 0);
      if (Date.now() - last > RELOAD_COOLDOWN_MS) {
        sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
        window.location.reload();
      }
    }
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: '16px',
            padding: '24px',
            textAlign: 'center',
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          <ErrorBoundaryTitle />
          <ErrorBoundaryDescription />
          <ErrorBoundaryReloadButton onReload={this.handleReload} />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
