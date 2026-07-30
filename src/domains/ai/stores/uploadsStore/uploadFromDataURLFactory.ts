import { dataURLtoFile } from '@/helpers';
import { getApiErrorMessage } from '@/store/helpers/getApiErrorMessage';

export const uploadFromDataURLFactory =
  (uploadFile: (file: File | Blob, filename: string) => Promise<string>) =>
  async (
    dataURL: string,
    filename: string,
    checkExtension = false,
  ): Promise<string | null> => {
    try {
      const file = dataURLtoFile(dataURL, filename, checkExtension);
      return await uploadFile(file, filename);
    } catch (error) {
      console.error(getApiErrorMessage(error, 'Failed to upload image'));
      return null;
    }
  };
