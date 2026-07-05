// pdfmake vfs fonts shim used by pdfMake bundling
declare module 'pdfmake/build/vfs_fonts' {
  export const pdfMake: {
    vfs: any;
  };
}

export {};
