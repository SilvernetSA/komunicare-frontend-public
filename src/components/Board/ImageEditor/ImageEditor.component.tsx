import React, { useState, useRef } from 'react';
import { FormattedMessage, IntlShape } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '../../UI/IconButton/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import messages from './ImageEditor.messages';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import DoneIcon from '@mui/icons-material/Done';
import CropIcon from '@mui/icons-material/Crop';
import BlockIcon from '@mui/icons-material/Block';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

import './ImageEditor.css';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

// Definición de tipos para el componente
interface ImageEditorProps {
  open: boolean;
  onImageEditorClose: () => void;
  onImageEditorDone: (blob: Blob) => void;
  image: string;
  intl: IntlShape;
  width?: string;
  fullScreen?: boolean;
}

interface ImageSize {
  width: number;
  height: number;
}

interface ImageEditorState {
  isCropActive: boolean;
  imgCropped: string | null;
  style: ImageSize;
  cropper?: Cropper;
}

// FIXME checkout https://mui.com/components/use-media-query/#using-material-uis-breakpoint-helpers
const withMobileDialog =
  () =>
  (WrappedComponent: React.ComponentType<ImageEditorProps>) =>
  (props: ImageEditorProps) => (
    <WrappedComponent {...props} width="lg" fullScreen={false} />
  );

const ImageEditor: React.FC<ImageEditorProps> = ({
  open = false,
  onImageEditorClose,
  onImageEditorDone,
  image,
  intl,
}) => {
  const setImageSize = (): ImageSize => {
    if (window.innerWidth < 576) {
      return { width: 248, height: 182 };
    } else {
      return { width: 492, height: 369 };
    }
  };

  const [state, setState] = useState<ImageEditorState>({
    isCropActive: false,
    imgCropped: null,
    style: setImageSize(),
  });

  const cropperRef = useRef<Cropper>(null);

  const handleOnClickCrop = () => {
    if (state.cropper) {
      setState({ ...state, isCropActive: true });
      state.cropper.setDragMode('crop');
      state.cropper.crop();
    }
  };

  const handleOnClickDoneCrop = () => {
    if (state.cropper) {
      setState({
        ...state,
        isCropActive: false,
        imgCropped: state.cropper.getCroppedCanvas().toDataURL(),
      });
      state.cropper.setDragMode('move');
    }
  };

  const handleOnClickClose = () => {
    setState({ ...state, isCropActive: false, imgCropped: null });
    if (state.cropper) {
      state.cropper.destroy();
    }
    onImageEditorClose();
  };

  const handleOnClickDone = async () => {
    if (state.cropper) {
      state.cropper.setDragMode('move');
      setState({ ...state, imgCropped: null });
      onImageEditorClose();

      state.cropper
        .getCroppedCanvas({
          maxWidth: 200,
          maxHeight: 200,
          fillColor: '#fff',
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
        })
        .toBlob(
          (blob) => {
            if (blob) {
              onImageEditorDone(blob);
            }
          },
          'image/png',
          1,
        );
      state.cropper.destroy();
    }
  };

  const handleOnClickCancelCrop = () => {
    if (state.cropper) {
      setState({ ...state, isCropActive: false });
      state.cropper.clear();
      state.cropper.setDragMode('move');
    }
  };

  const srcImage = state.imgCropped ? state.imgCropped : image;

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={onImageEditorClose}
        fullScreen={false}
        className="ImageEditor__container"
      >
        <DialogTitle className="ImageEditor__title">
          <div className="ImageEditor__Container">
            <FormattedMessage {...messages.title} />
          </div>
        </DialogTitle>
        <DialogContent>
          <Cropper
            style={state.style}
            zoomTo={0}
            src={srcImage}
            viewMode={0}
            background={true}
            responsive={true}
            checkOrientation={false}
            guides={true}
            dragMode="move"
            autoCrop={false}
            onInitialized={(instance) => {
              setState({ ...state, cropper: instance });
            }}
            ref={cropperRef as any}
          />
          <div className="ImageEditor__actionBar">
            <IconButton
              label={intl.formatMessage(messages.rotateRight)}
              onClick={() => {
                if (state.cropper) {
                  state.cropper.rotate(90);
                }
              }}
              size="large"
            >
              <RotateRightIcon />
            </IconButton>
            {state.isCropActive ? (
              <React.Fragment>
                <IconButton
                  label={intl.formatMessage(messages.cropImage)}
                  onClick={handleOnClickDoneCrop}
                  size="large"
                >
                  <DoneIcon />
                </IconButton>
                <IconButton
                  label={intl.formatMessage(messages.cancelCrop)}
                  onClick={handleOnClickCancelCrop}
                  size="large"
                >
                  <BlockIcon />
                </IconButton>
              </React.Fragment>
            ) : (
              <IconButton
                label={intl.formatMessage(messages.cropImage)}
                onClick={handleOnClickCrop}
                size="large"
              >
                <CropIcon />
              </IconButton>
            )}
            <IconButton
              label={intl.formatMessage(messages.zoomIn)}
              onClick={() => state.cropper?.zoom(0.1)}
              size="large"
            >
              <ZoomInIcon />
            </IconButton>
            <IconButton
              label={intl.formatMessage(messages.zoomOut)}
              onClick={() => state.cropper?.zoom(-0.1)}
              size="large"
            >
              <ZoomOutIcon />
            </IconButton>
          </div>
        </DialogContent>
        <DialogActions>
          <IconButton
            label={intl.formatMessage(messages.done)}
            onClick={handleOnClickDone}
            disabled={state.isCropActive}
            size="large"
          >
            <DoneIcon />
          </IconButton>

          <IconButton
            label={intl.formatMessage(messages.close)}
            onClick={handleOnClickClose}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default withMobileDialog()(ImageEditor);
