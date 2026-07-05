import { apiClient } from '../apiClient';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

export const uploadFileFactory =
  () =>
  async (file: File | Blob, filename: string): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file, filename);
      const { data } = await apiClient.post<{ url: string }>(
        'media',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return data.url;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to upload file'));
    }
  };
