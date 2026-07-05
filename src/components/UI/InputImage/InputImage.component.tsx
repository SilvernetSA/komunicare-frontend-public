import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import readAndCompressImage from 'browser-image-resizer';
import React from 'react';

import messages from './InputImage.messages';
import './InputImage.css';

interface InputImageProps {
  onChange: (resizedBlob: Blob, fileName: string, blobHQ: Blob) => void;
  intl: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
}

const InputImage: React.FC<InputImageProps> = ({ onChange, intl }) => {
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const configLQ = {
      quality: 7,
      maxWidth: 200,
      maxHeight: 200,
      autoRotate: true,
      debug: false,
      mimeType: 'image/png',
    };
    const configHQ = {
      quality: 1,
      maxWidth: 800,
      maxHeight: 800,
      autoRotate: true,
      debug: false,
      mimeType: 'image/png',
    };
    if (file) {
      const resizedBlob = await readAndCompressImage(file, configLQ);
      const blobHQ = await readAndCompressImage(file, configHQ);
      onChange(resizedBlob, file.name, blobHQ);
    }
  };

  return (
    <div className="InputImage">
      <PhotoCameraIcon />
      <label className="InputImage__label">
        {intl.formatMessage(messages.uploadImage)}
        <input
          className="InputImage__input"
          type="file"
          accept="image/*"
          onChange={handleChange}
        />
      </label>
    </div>
  );
};

export default InputImage;
