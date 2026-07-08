// In production, we register a service worker to serve assets from local cache.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on the "N+1" visit to a page, since previously
// cached resources are updated in the background.

// To learn more about the benefits of this model, read https://goo.gl/KwvDNy.
// This link also includes instructions on opting out of this behavior.

const isLocalhost: boolean = Boolean(
  window.location.hostname === 'localhost' ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === '[::1]' ||
  // 127.0.0.1/8 is considered localhost for IPv4.
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/,
  ),
);

const resolvePublicBasePath = (): string => {
  const rawPublicUrl = String(
    process.env.PUBLIC_URL || process.env.BASE_URL || '/',
  ).trim();

  try {
    const parsedUrl = new URL(rawPublicUrl, window.location.href);
    if (parsedUrl.origin !== window.location.origin) {
      return '';
    }

    const pathname = parsedUrl.pathname || '/';
    if (pathname === '/') {
      return '';
    }

    return pathname.replace(/\/+$/, '');
  } catch {
    return '';
  }
};

const buildServiceWorkerUrls = (): string[] => {
  const basePath = resolvePublicBasePath();
  const normalizedBasePath =
    basePath && !basePath.startsWith('/') ? `/${basePath}` : basePath;
  const origin = window.location.origin;

  return [
    `${origin}${normalizedBasePath}/sw.js`,
    `${origin}${normalizedBasePath}/service-worker.js`,
  ];
};

export default function register(
  onNewContentAvailable?: () => void,
  onContentCached?: () => void,
): void {
  if (
    process.env.NODE_ENV === 'production' &&
    shouldEnableServiceWorker() &&
    'serviceWorker' in navigator
  ) {
    window.addEventListener('load', () => {
      const swUrls = buildServiceWorkerUrls();

      if (!isLocalhost) {
        // Is not local host. Just register service worker
        registerValidSW(swUrls, onNewContentAvailable, onContentCached);
      } else {
        // This is running on localhost. Lets check if a service worker still exists or not.
        checkValidServiceWorker(swUrls);
      }
    });
  }
}

function registerValidSW(
  swUrls: string[],
  onNewContentAvailable: () => void = () => {},
  onContentCached: () => void = () => {},
): Promise<void> {
  const registerSW = async (): Promise<void> => {
    for (let i = 0; i < swUrls.length; i += 1) {
      const swUrl = swUrls[i];
      const isLastCandidate = i === swUrls.length - 1;

      try {
        const registration = await navigator.serviceWorker.register(swUrl);
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // At this point, the old content will have been purged and
                  // the fresh content will have been added to the cache.
                  // It's the perfect time to display a "New content is
                  // available; please refresh." message in your web app.
                  onNewContentAvailable();
                  console.log('New content is available; please refresh.');
                } else {
                  // At this point, everything has been precached.
                  // It's the perfect time to display a
                  // "Content is cached for offline use." message.
                  onContentCached();
                  console.log('Content is cached for offline use.');
                }
              }
            };
          }
        };
        return;
      } catch (error) {
        if (isLastCandidate) {
          console.error('Error during service worker registration:', error);
        }
      }
    }
  };

  return registerSW();
}

function checkValidServiceWorker(swUrls: string[]): void {
  const validateServiceWorker = async (): Promise<void> => {
    for (let i = 0; i < swUrls.length; i += 1) {
      const swUrl = swUrls[i];
      const isLastCandidate = i === swUrls.length - 1;

      // Check if the service worker can be found. If it can't reload the page.
      try {
        const response = await fetch(swUrl);
        const contentType = response.headers.get('content-type') || '';

        // Ensure service worker exists, and that we really are getting a JS file.
        if (
          response.status === 404 ||
          contentType.indexOf('javascript') === -1
        ) {
          if (isLastCandidate) {
            // No service worker found. Probably a different app. Reload the page.
            const registration = await navigator.serviceWorker.ready;
            await registration.unregister();
            window.location.reload();
          }
          continue;
        }

        // Service worker found. Proceed as normal.
        await registerValidSW([swUrl]);
        return;
      } catch {
        if (isLastCandidate) {
          console.log(
            'No internet connection found. App is running in offline mode.',
          );
        }
      }
    }
  };

  void validateServiceWorker();
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    const unregisterServiceWorker = async (): Promise<void> => {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
    };

    void unregisterServiceWorker();
  }
}
import { shouldEnableServiceWorker } from './platform';
