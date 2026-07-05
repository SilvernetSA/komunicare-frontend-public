import { useState } from 'react';

import { convertImageUrlToCatchable } from '../../../../helpers';
import { useUploadsStore } from '../../../../store/uploadsStore';
import { UserData } from '../../../../types/app';

interface ImageUploadData {
  isUploaded: boolean;
  fileName: string;
  blobHQ: Blob | null;
  blob: Blob | null;
}

interface UseImageUploadReturn {
  imageUploadedData: ImageUploadData[];
  setImageUploadedData: (data: ImageUploadData[]) => void;
  isEditImageBtnActive: boolean;
  setIsEditImageBtnActive: (active: boolean) => void;
  defaultImageUploadedData: ImageUploadData;
  updateTileImgURL: (
    blob: Blob,
    fileName: string,
    userData?: UserData,
  ) => Promise<string>;
  setImageUploadData: (
    activeStep: number,
    isUploaded: boolean,
    fileName: string,
    blobHQ?: Blob | null,
    blob?: Blob | null,
  ) => void;
  handleInputImageChange: (
    blob: Blob,
    fileName: string,
    blobHQ?: Blob,
  ) => string;
  resetImageData: () => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [imageUploadedData, setImageUploadedData] = useState<ImageUploadData[]>(
    [],
  );
  const [isEditImageBtnActive, setIsEditImageBtnActive] = useState(false);

  const defaultImageUploadedData: ImageUploadData = {
    isUploaded: false,
    fileName: '',
    blobHQ: null,
    blob: null,
  };

  const blobToBase64 = async (blob: Blob): Promise<string> => {
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }

    return `data:${blob.type};base64,${btoa(binary)}`;
  };

  const updateTileImgURL = async (
    blob: Blob,
    fileName: string,
    userData?: UserData,
  ): Promise<string> => {
    const user = userData?.email ? userData : null;
    if (user) {
      try {
        const imageUrl = await useUploadsStore
          .getState()
          .uploadFile(blob, fileName);
        return convertImageUrlToCatchable(imageUrl) || imageUrl;
      } catch (error) {
        console.error('Unexpected error while uploading tile image', error);
      }

      return blobToBase64(blob);
    } else {
      return blobToBase64(blob);
    }
  };

  const setImageUploadData = (
    activeStep: number,
    isUploaded: boolean,
    fileName: string,
    blobHQ: Blob | null = null,
    blob: Blob | null = null,
  ) => {
    const newData = [...imageUploadedData];
    if (newData[activeStep]) {
      newData[activeStep] = {
        ...newData[activeStep],
        isUploaded,
        fileName,
        blobHQ,
        blob,
      };
    } else {
      newData[activeStep] = {
        isUploaded,
        fileName,
        blobHQ,
        blob,
      };
    }
    setImageUploadedData(newData);
  };

  const handleInputImageChange = (
    blob: Blob,
    fileName: string,
    blobHQ?: Blob,
  ): string => {
    if (!imageUploadedData.length) {
      setImageUploadedData([defaultImageUploadedData]);
    }
    setImageUploadData(0, true, fileName, blobHQ, blob);
    setIsEditImageBtnActive(true);
    return URL.createObjectURL(blob);
  };

  const resetImageData = () => {
    setImageUploadedData([]);
    setIsEditImageBtnActive(false);
  };

  return {
    imageUploadedData,
    setImageUploadedData,
    isEditImageBtnActive,
    setIsEditImageBtnActive,
    defaultImageUploadedData,
    updateTileImgURL,
    setImageUploadData,
    handleInputImageChange,
    resetImageData,
  };
}
