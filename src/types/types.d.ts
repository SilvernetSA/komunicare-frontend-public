declare global {
  interface Window {
    gtag?: (command: string, params: any) => void;
  }
}

export {};
