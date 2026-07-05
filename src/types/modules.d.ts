declare module 'browser-image-resizer' {
  export const readAndCompressImage: (file: File, config: any) => Promise<File>;
  export default readAndCompressImage;
}

declare module 'jszip-utils' {
  export function getBinaryContent(
    url: string,
    callback: (err: any, data: any) => void,
  ): void;
}
