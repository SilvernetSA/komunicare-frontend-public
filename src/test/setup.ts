import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Node.js 25 introduced a built-in --localstorage-file flag that can interfere
// with jsdom's localStorage. Ensure a reliable in-memory implementation is
// always available in the test environment.
if (
  typeof globalThis.localStorage === 'undefined' ||
  typeof globalThis.localStorage.clear !== 'function'
) {
  const localStorageMap = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return localStorageMap.size;
    },
    clear() {
      localStorageMap.clear();
    },
    getItem(key: string) {
      return localStorageMap.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      localStorageMap.set(key, String(value));
    },
    removeItem(key: string) {
      localStorageMap.delete(key);
    },
    key(index: number) {
      return Array.from(localStorageMap.keys())[index] ?? null;
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    writable: true,
  });
  if (typeof globalThis.window !== 'undefined') {
    Object.defineProperty(globalThis.window, 'localStorage', {
      value: storage,
      writable: true,
      configurable: true,
    });
  }
}
