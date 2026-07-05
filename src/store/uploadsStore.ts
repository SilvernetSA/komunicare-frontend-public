import { create } from 'zustand';

import { uploadFileFactory } from './uploadsStore/uploadFileFactory';
import { uploadFromDataURLFactory } from './uploadsStore/uploadFromDataURLFactory';

export interface UploadsStore {
  uploadFile: (file: File | Blob, filename: string) => Promise<string>;
  uploadFromDataURL: (
    dataURL: string,
    filename: string,
    checkExtension?: boolean,
  ) => Promise<string | null>;
}

export const useUploadsStore = create<UploadsStore>()(() => {
  const uploadFile = uploadFileFactory();

  return {
    uploadFile,
    uploadFromDataURL: uploadFromDataURLFactory(uploadFile),
  };
});
