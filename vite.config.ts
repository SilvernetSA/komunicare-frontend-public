import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Build info injected at compile time.
const pkg = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf-8'),
) as { version: string };
const gitCommit = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
})();
const buildDate = new Date().toISOString().slice(0, 10);

// Plugin para inyectar PropTypes globalmente
const propTypesPlugin = () => {
  return {
    name: 'prop-types-global',
    transformIndexHtml: {
      order: 'pre' as const,
      handler(html: string) {
        return html.replace(
          '<head>',
          `<head>
<script>
  // PropTypes global para react-grid-layout
  window.PropTypes = {
    any: function() { return null; },
    array: function() { return null; },
    arrayOf: function() { return function() { return null; }; },
    bool: function() { return null; },
    element: function() { return null; },
    func: function() { return null; },
    node: function() { return null; },
    number: function() { return null; },
    object: function() { return null; },
    objectOf: function() { return function() { return null; }; },
    oneOf: function() { return function() { return null; }; },
    oneOfType: function() { return function() { return null; }; },
    shape: function() { return function() { return null; }; },
    string: function() { return null; },
    symbol: function() { return null; },
    instanceOf: function() { return function() { return null; }; }
  };
</script>`,
        );
      },
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const publicBaseUrl = env.PUBLIC_URL || env.BASE_URL || '/';

  const runtimeEnv = {
    ...env,
    NODE_ENV: env.NODE_ENV || mode,
    PUBLIC_URL: publicBaseUrl,
    BASE_URL: publicBaseUrl,
    MODE: mode,
  };

  return {
    plugins: [
      propTypesPlugin(),
      react({
        include: ['**/*.jsx', '**/*.tsx', '**/*.js'],
      }),
      VitePWA({
        // 'prompt' (not 'autoUpdate'): the generated SW must NOT skipWaiting
        // on its own. autoUpdate calls skipWaiting/clientsClaim on install and
        // purges the old precache while the current page is still running — the
        // page then fails to load chunks whose hashed names the new deploy
        // replaced, leaving a blank screen. 'prompt' also injects a
        // SKIP_WAITING message handler into the SW, which registerServiceWorker
        // uses to apply the update atomically: post SKIP_WAITING -> the new SW
        // activates and purges the old cache -> we reload on 'controllerchange'
        // so index.html and its chunks come from the NEW precache together.
        registerType: 'prompt',
        // Single registrar: registerServiceWorker.ts owns registration and the
        // onupdatefound handler. Without this, vite-plugin-pwa also injects
        // registerSW.js and double-registers /sw.js, racing our update hook.
        injectRegister: false,
        includeAssets: [
          'logo.svg',
          'logo_150_150.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'Komunicare - AAC Communication Board',
          short_name: 'Komunicare',
          description:
            'Komunicare is an augmentative and alternative communication (AAC) application, allowing users with speech and language impairments (Autism, Cerebral Palsy) to communicate with symbols and text-to-speech.',
          theme_color: '#000000',
          background_color: '#ffffff',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          // exclude heavy dynamic chunks from precache; we will cache them at runtime
          globIgnores: [
            '**/assets/pdfmake-*.js',
            '**/assets/translations-*.js',
            '**/assets/vendor-*.js',
          ],
          runtimeCaching: [
            {
              urlPattern: ({ url }) =>
                url.pathname.includes('/assets/pdfmake-'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pdfmake',
                expiration: { maxEntries: 4, maxAgeSeconds: 7 * 24 * 3600 },
              },
            },
            {
              // vendor-*.js is excluded from precache (globIgnores) but had no
              // runtime rule, so it was never cached — after a deploy the old
              // hashed vendor chunk 404s. Hashed filenames are immutable, so
              // CacheFirst is safe and keeps the app resilient offline.
              urlPattern: ({ url }) =>
                url.pathname.includes('/assets/vendor-'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'vendor',
                expiration: { maxEntries: 8, maxAgeSeconds: 30 * 24 * 3600 },
              },
            },
            {
              urlPattern: ({ url }) =>
                url.pathname.includes('/translations/') ||
                url.pathname.includes('/assets/translations-'),
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'translations',
                expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 3600 },
              },
            },
            {
              urlPattern: /^https:\/\/api\.arasaac\.org\/api\//,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'arasaac',
                expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 3600 },
              },
            },
            {
              urlPattern: /^https:\/\/globalsymbols\.com\/api\/v1\//,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'globalsymbols',
                expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 3600 },
              },
            },
          ],
        },
      }),
    ],
    base: publicBaseUrl,

    envPrefix: ['VITE_', 'REACT_APP_', 'KOMUNICARE_'],

    // Configuración del servidor de desarrollo
    server: {
      port: 3001,
      host: true,
      open: mode !== 'test',
      // Opt-in same-origin API proxy for dev instances on ports the API's
      // CORS allowlist doesn't cover. Run with:
      //   DEV_API_PROXY_TARGET=https://komunicare-api-dev.komuni.care \
      //   VITE_API_URL=/dev-api vite --port 3003
      proxy: process.env.DEV_API_PROXY_TARGET
        ? {
            '/dev-api': {
              target: process.env.DEV_API_PROXY_TARGET,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/dev-api/, ''),
            },
          }
        : undefined,
    },

    // Configuración del build
    build: {
      outDir: 'build',
      sourcemap: false,
      rollupOptions: {
        external: () => {
          // No externalizar prop-types en producción
          return false;
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/pdfmake')) {
              return 'pdfmake';
            }
            if (id.includes('node_modules/mathjs')) {
              return 'mathjs';
            }
            if (
              id.includes('node_modules/echarts') ||
              id.includes('echarts-for-react')
            ) {
              return 'echarts';
            }
            // No separar react-grid-layout en chunk propio para evitar problemas con PropTypes
            // if (id.includes('node_modules/react-grid-layout')) {
            //   return 'grid';
            // }
            if (
              id.includes('node_modules/react-dnd') ||
              id.includes('react-dnd-touch-backend')
            ) {
              return 'dnd';
            }
            if (id.includes('node_modules/@mui/')) {
              return 'mui';
            }
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },

    // Resolución de módulos
    resolve: {
      dedupe: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
      ],
      alias: {
        '@': resolve(__dirname, 'src'),
        path: 'path-browserify',
        stream: 'stream-browserify',
        os: 'os-browserify/browser',
        crypto: 'crypto-browserify',
        buffer: 'buffer',
        util: 'util',
        process: 'process/browser',
        'jss-plugin-globalThis': resolve(
          __dirname,
          'src/shims/jss-plugin-globalThis.ts',
        ),
        // Force CJS build in non-production modes: react-joyride@2.9.x ships a
        // malformed ESM bundle (imports scattered mid-file) that confuses Rollup's
        // namespace initialisation in dev builds, causing "Class extends undefined".
        ...(mode !== 'production' && {
          'react-joyride': resolve(
            __dirname,
            'node_modules/react-joyride/dist/index.js',
          ),
        }),
      },
    },

    // Variables de entorno y polyfills
    define: {
      global: 'globalThis',
      'process.env': JSON.stringify(runtimeEnv),
      'process.env.NODE_ENV': JSON.stringify(
        mode === 'production' ? 'production' : 'development',
      ),
      __APP_VERSION__: JSON.stringify(pkg.version),
      __APP_COMMIT__: JSON.stringify(gitCommit),
      __APP_BUILD_DATE__: JSON.stringify(buildDate),
    },

    // Optimizaciones
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@mui/material',
        '@mui/icons-material',
        'prop-types',
        'react-joyride',
        'react-grid-layout',
        'react-resizable',
        'react-draggable',
        'buffer',
        'util',
        'crypto-browserify',
        'path-browserify',
        'stream-browserify',
      ],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        jsx: 'automatic',
      },
    },
  };
});
