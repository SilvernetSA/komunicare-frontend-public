import axios from 'axios';

import { EMPTY_IMAGE } from '../Export.constants';

const imageElement = new Image();

interface ImageData {
  ab: ArrayBuffer;
  data: string;
  content_type: string;
}

export function getBase64Image(base64Str: string = ''): ImageData {
  const [prefix, base64Data] = base64Str.split(',');
  const contentType = prefix.split(':')[1].split(';')[0];
  const byteString = atob(base64Data);

  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return {
    ab,
    data: base64Str,
    content_type: contentType,
  };
}

export async function getDataUri(url: string): Promise<ImageData | undefined> {
  try {
    const result = await axios({
      method: 'get',
      url,
      responseType: 'arraybuffer',
    });

    const encodedImage = btoa(
      new Uint8Array(result.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        '',
      ),
    );
    const contentType = result.headers['content-type'];

    return {
      ab: result.data,
      content_type: contentType,
      data: `data:${contentType};base64,${encodedImage}`,
    };
  } catch (e) {
    console.error(`Failed to get image at ${url}.`, e);
  }
}

interface ImageStyles {
  backgroundColor?: string;
  borderColor?: string;
}

export async function toDataURL(
  url: string,
  styles: ImageStyles = {},
  outputFormat: string = 'image/jpeg',
): Promise<string> {
  return new Promise((resolve, reject) => {
    imageElement.crossOrigin = 'Anonymous';
    imageElement.onload = function () {
      const canvas = document.createElement('CANVAS') as HTMLCanvasElement;
      const ctx = canvas.getContext('2d')!;
      const backgroundColor = styles.backgroundColor || 'white';
      const borderColor = styles.borderColor || null;
      canvas.height = 150;
      canvas.width = 150;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (borderColor) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
      }

      let widthFix = 1;
      let heightFix = 1;
      const img = this as HTMLImageElement;
      const needToScale = img.naturalWidth > 150 || img.naturalHeight > 150;
      if (needToScale) {
        widthFix = 150 / img.naturalWidth;
        heightFix = 150 / img.naturalHeight;
      }

      ctx.drawImage(
        img,
        0,
        0,
        img.naturalWidth * widthFix,
        img.naturalHeight * heightFix,
      );

      if (borderColor) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, 150, 150);
      }
      const dataURL = canvas.toDataURL(outputFormat);
      resolve(dataURL);
    };
    imageElement.onerror = function () {
      reject(new Error('Getting remote image failed'));
    };

    if (url) {
      imageElement.src = url;
    } else {
      imageElement.src = EMPTY_IMAGE;
    }
    if (imageElement.complete || imageElement.complete === undefined) {
      if (url) {
        imageElement.src = url;
      } else {
        imageElement.src = EMPTY_IMAGE;
      }
    }
  });
}
