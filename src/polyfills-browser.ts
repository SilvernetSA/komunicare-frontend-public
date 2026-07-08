// Browser polyfills for Node.js globals that some dependencies expect.
import { Buffer } from 'buffer';

const globalScope = globalThis as Record<string, any>;

if (!globalScope.Buffer) {
  globalScope.Buffer = Buffer;
}

const existingProcess = globalScope.process || {};
const existingEnv = (existingProcess.env || {}) as Record<string, any>;
const metaEnv = (
  typeof import.meta !== 'undefined' ? import.meta.env : undefined
) as Record<string, any> | undefined;

const normalizedEnv: Record<string, any> = {
  ...existingEnv,
  ...(metaEnv || {}),
};

normalizedEnv.MODE =
  (metaEnv && metaEnv.MODE) || existingEnv.MODE || existingEnv.NODE_ENV;
normalizedEnv.NODE_ENV =
  (metaEnv && metaEnv.NODE_ENV) ||
  (metaEnv && metaEnv.MODE) ||
  existingEnv.NODE_ENV ||
  'development';
normalizedEnv.BASE_URL =
  (metaEnv && metaEnv.BASE_URL) || existingEnv.BASE_URL || '/';
normalizedEnv.PUBLIC_URL =
  (metaEnv && metaEnv.PUBLIC_URL) ||
  (metaEnv && metaEnv.BASE_URL) ||
  existingEnv.PUBLIC_URL ||
  '/';

const getFunctionOrFallback = <T extends Function>(
  fn: unknown,
  fallback: T,
): T => {
  return typeof fn === 'function' ? (fn as T) : fallback;
};

// IMPORTANT: never expose `process.versions.node` in the browser. MediaPipe's
// Emscripten wasm glue treats a truthy `process.versions.node` as "running in
// Node.js" and then calls `require('node:fs')` → "require is not defined",
// breaking FaceLandmarker init. Keep the rest of `versions` but strip node.
const safeVersions: Record<string, any> = {
  ...(existingProcess.versions || {}),
};
delete safeVersions.node;

globalScope.process = {
  browser: true,
  // Mark this as an Electron-renderer-like (browser) environment. MediaPipe's
  // Emscripten wasm glue detects Node via `process.versions.node && process.type
  // != 'renderer'`; because the polyfill below sets versions.node, without this
  // marker the glue takes the Node path and calls require('node:fs') → crash.
  type: 'renderer',
  version: existingProcess.version || '',
  platform: existingProcess.platform || 'browser',
  nextTick: getFunctionOrFallback(existingProcess.nextTick, (fn: Function) =>
    Promise.resolve().then(() => fn()),
  ),
  cwd: getFunctionOrFallback(existingProcess.cwd, () => '/'),
  chdir: getFunctionOrFallback(existingProcess.chdir, () => {}),
  umask: getFunctionOrFallback(existingProcess.umask, () => 0),
  argv: existingProcess.argv || [],
  pid: typeof existingProcess.pid === 'number' ? existingProcess.pid : 1,
  ppid: typeof existingProcess.ppid === 'number' ? existingProcess.ppid : 0,
  title: existingProcess.title || 'browser',
  arch: existingProcess.arch || 'x64',
  versions: safeVersions,
  env: normalizedEnv,
};

globalScope.__VITE_ENV__ = normalizedEnv;

export {};
