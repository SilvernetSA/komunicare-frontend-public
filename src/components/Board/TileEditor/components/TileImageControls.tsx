import React from 'react';
import { IntlShape } from 'react-intl';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import InputImage from '../../../UI/InputImage/InputImage.component';
import ImageEditor from '../../ImageEditor/ImageEditor.component';
import messages from '../TileEditor.messages';

interface ImageUploadedData {
  blob?: Blob;
  blobHQ?: Blob;
  isUploaded?: boolean;
  fileName?: string;
  [key: string]: unknown;
}

interface TileImageControlsProps {
  intl: IntlShape;
  currentLabel: string;
  isEditImageBtnActive: boolean;
  openImageEditor: boolean;
  imageUploadedData: ImageUploadedData[];
  activeStep: number;
  onSearchClick: (e: React.MouseEvent, label: string) => void;
  onInputImageChange: (
    resizedBlob: Blob,
    fileName: string,
    blobHQ: Blob,
  ) => void;
  onImageEditorClick: () => void;
  onImageEditorClose: () => void;
  onImageEditorDone: (blob: Blob) => void;
}

export const TileImageControls: React.FC<TileImageControlsProps> = ({
  intl,
  currentLabel,
  isEditImageBtnActive,
  openImageEditor,
  imageUploadedData,
  activeStep,
  onSearchClick,
  onInputImageChange,
  onImageEditorClick,
  onImageEditorClose,
  onImageEditorDone,
}) => {
  return (
    <div className="TileEditor__picto-fields">
      {isEditImageBtnActive && (
        <React.Fragment>
          <ImageEditor
            intl={intl}
            open={openImageEditor}
            onImageEditorClose={onImageEditorClose}
            onImageEditorDone={onImageEditorDone}
            image={URL.createObjectURL(
              imageUploadedData[activeStep]?.blobHQ as Blob,
            )}
          />
          <Button
            variant="contained"
            color="secondary"
            startIcon={<EditIcon />}
            onClick={onImageEditorClick}
            style={{ marginBottom: '6px' }}
          >
            {intl.formatMessage(messages.editImage)}
          </Button>
        </React.Fragment>
      )}

      <Button
        variant="contained"
        color="primary"
        startIcon={<SearchIcon />}
        onClick={(e) => onSearchClick(e, currentLabel)}
      >
        {intl.formatMessage(messages.symbols)}
      </Button>

      <div className="TileEditor__input-image">
        <InputImage onChange={onInputImageChange} intl={intl} />
      </div>
    </div>
  );
};
