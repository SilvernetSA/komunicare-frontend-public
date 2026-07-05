// Extracted import utilities from Import.helpers.ts
import JSZip from 'jszip';

export interface OBFButton {
  id?: string;
  label?: string;
  background_color?: string;
  border_color?: string;
  vocalization?: string;
  action?: string;
  load_board?: {
    path?: string;
  };
  image_id?: string;
  [key: string]: unknown;
}

export interface OBFImage {
  id: string;
  data?: string;
  content_type?: string;
  path?: string;
  url?: string;
}

export interface OBFBoard {
  id?: string;
  name?: string;
  locale?: string;
  buttons?: OBFButton[];
  images?: OBFImage[];
  grid?: {
    rows: number;
    columns: number;
    order: (string | null)[][];
  };
  ext_cboard_hidden?: boolean;
  [key: string]: unknown;
}

export const toCamelCase = (scString: string = ''): string => {
  const find = /(_\w)/g;
  return scString.replace(find, (matches: string) => matches[1].toUpperCase());
};

export const readZip = async (file: File): Promise<JSZip> => {
  const zipData = await file.arrayBuffer();
  return JSZip.loadAsync(zipData);
};

export const requestQuota = async (json: unknown): Promise<number> => {
  const size = JSON.stringify(json).length;
  if (size > 1024 * 1024 * 4) {
    const requestQuotaAvailable =
      navigator &&
      (navigator as any).webkitPersistentStorage &&
      (navigator as any).webkitPersistentStorage.requestQuota;
    if (requestQuotaAvailable) {
      try {
        await new Promise<void>((resolve, reject) => {
          (navigator as any).webkitPersistentStorage.requestQuota(
            size * 2,
            (grantedSize: number) => {
              if (grantedSize >= size) {
                resolve();
              } else {
                reject(`Granted size is below the limit: ${grantedSize}`);
              }
            },
            (err: Error) => reject(`Request quota error: ${err}`),
          );
        });
      } catch (e) {
        throw new Error(e as string);
      }
    } else {
      throw new Error("Can't request quota");
    }
  }

  return size;
};
