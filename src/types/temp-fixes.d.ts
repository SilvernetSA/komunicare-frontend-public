// Temporary type fixes for TypeScript 5 migration

// Suppress specific error types
declare module '*.tsx' {
  const content: any;
  export default content;
}

declare module '*.ts' {
  const content: any;
  export default content;
}

// Fix for autosuggest
declare module 'react-autosuggest' {
  export interface InputProps<T> {
    [key: string]: any;
  }
  export default function Autosuggest<T, S>(props: any): JSX.Element;
}

// Fix for file-saver
declare module 'file-saver' {
  export function saveAs(data: any, filename?: string, options?: any): void;
}

// Fix for pdfmake
declare module 'pdfmake/build/pdfmake' {
  export function createPdf(docDefinition: any): any;
  export let vfs: any;
}

// Global type overrides for compatibility
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
