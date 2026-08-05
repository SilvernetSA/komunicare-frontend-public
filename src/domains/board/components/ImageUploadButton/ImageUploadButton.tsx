import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import readAndCompressImage from 'browser-image-resizer';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  uploadImage: {
    id: 'komunicare.components.InputImage.uploadImage',
    defaultMessage: 'Upload image',
  },
});

const lowQualityResizeConfig = {
  quality: 7,
  maxWidth: 200,
  maxHeight: 200,
  autoRotate: true,
  debug: false,
  mimeType: 'image/png',
};

const highQualityResizeConfig = {
  quality: 1,
  maxWidth: 800,
  maxHeight: 800,
  autoRotate: true,
  debug: false,
  mimeType: 'image/png',
};

interface ImageUploadButtonProps {
  onChange: (resizedBlob: Blob, fileName: string, blobHQ: Blob) => void;
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({ onChange }) => {
  const intl = useIntl();

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const resizedBlob = await readAndCompressImage(
      file,
      lowQualityResizeConfig,
    );
    const blobHQ = await readAndCompressImage(file, highQualityResizeConfig);

    onChange(resizedBlob, file.name, blobHQ);
  };

  return (
    <div
      className="InputImage"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '48px',
        lineHeight: '48px',
        cursor: 'pointer',
      }}
    >
      <PhotoCameraIcon style={{ color: 'inherit' }} />
      <label
        className="InputImage__label"
        style={{
          position: 'relative',
          height: '100%',
          paddingLeft: '12px',
          paddingRight: '12px',
          fontSize: '0.875rem',
          cursor: 'pointer',
          overflow: 'visible',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {intl.formatMessage(messages.uploadImage)}
        <input
          className="InputImage__input"
          style={{ display: 'none' }}
          type="file"
          accept="image/*"
          onChange={handleChange}
        />
      </label>
    </div>
  );
};

export default ImageUploadButton;
