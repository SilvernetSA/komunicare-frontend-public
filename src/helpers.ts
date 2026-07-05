import komunicare from './store/boardsCatalog/komunicare';

interface Boards {
  komunicare: typeof komunicare;
}

export const DEFAULT_BOARDS: Boards = {
  komunicare: komunicare,
};

export const dataURLtoFile = (
  dataurl: string,
  filename: string,
  checkExtension = false,
): File => {
  try {
    // https://stackoverflow.com/a/38936042
    const arr = dataurl.split(',');
    if (arr.length !== 2) {
      throw new Error('Formato de Data URL inválido');
    }

    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || mimeMatch.length < 2) {
      throw new Error('No se pudo extraer el tipo MIME de la Data URL');
    }
    const type = mimeMatch[1];

    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    let name = filename;
    if (checkExtension) {
      const extension = type.split('/')[1].toLowerCase();
      name = `${name}.${extension}`;
    }

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], name, { type });
  } catch (error) {
    console.error('Error converting data URL to file:', error);
    throw error;
  }
};

export const convertImageUrlToCatchable = (imageUrl: string): string | null => {
  try {
    const PRODUCTION_BLOB_CONTAINER_HOSTNAME =
      'komunicare.blob.core.windows.net';
    const PROTOCOL_LENGTH = 8;
    const isProductionBlobContainer = imageUrl.startsWith(
      PRODUCTION_BLOB_CONTAINER_HOSTNAME,
      PROTOCOL_LENGTH,
    );

    const blobUsingCDN = (url: string): string => {
      const CDN_HOSTNAME = 'komunicareprod.azureedge.net';
      return url.replace(PRODUCTION_BLOB_CONTAINER_HOSTNAME, CDN_HOSTNAME);
    };

    if (isProductionBlobContainer) return blobUsingCDN(imageUrl);
    return null;
  } catch (error) {
    console.error('Error converting image URL:', error);
    return null;
  }
};
