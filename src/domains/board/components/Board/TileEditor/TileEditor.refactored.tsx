import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Button from '@mui/material/Button';
import FormLabel from '@mui/material/FormLabel';
import MobileStepper from '@mui/material/MobileStepper';
import Paper from '@mui/material/Paper';
import React, { useState } from 'react';
import { FormattedMessage, IntlShape, injectIntl } from 'react-intl';
import shortid from 'shortid';

import { TileFormFields } from './components/TileFormFields';
import { TileImageControls } from './components/TileImageControls';
import { TilePreview } from './components/TilePreview';
import { useImageUpload } from './hooks/useImageUpload';
import { useTileEditor } from './hooks/useTileEditor';
import messages from './TileEditor.messages';
import {
  getDefaultColor,
  createTileForType,
  updateTileProperty,
} from './utils/tileHelpers';
import { handleTileSubmit } from './utils/tileSubmitHandler';
import { UserData } from '@/types/app';
import { Tile, Board } from '@/types/board';
import PremiumFeature from '@/domains/subscription/components/PremiumFeature/PremiumFeature';
import ColorSelect from '@/domains/shared/components/UI/ColorSelect/ColorSelect';
import FullScreenDialog from '@/domains/app/components/FullScreenDialog/FullScreenDialog';
import { FullScreenDialogContent } from '@/domains/app/components/FullScreenDialog/FullScreenDialogContent';
import IconButton from '@/domains/shared/components/UI/IconButton/IconButton';
import VoiceRecorder from '@/domains/shared/components/VoiceRecorder/VoiceRecorder';
import SymbolSearch from '../SymbolSearch/SymbolSearch';

import './TileEditor.css';

interface TileEditorProps {
  intl: IntlShape;
  open?: boolean;
  onClose: () => void;
  editingTiles?: Tile[];
  onEditSubmit: (tiles: Tile[]) => void | Promise<void>;
  onAddSubmit: (tile: Tile) => void | Promise<void>;
  boards?: Board[];
  userData?: UserData;
}

interface SymbolSearchResult {
  image: string;
  labelKey: string;
  label: string;
  keyPath?: string;
}

const TileEditor: React.FC<TileEditorProps> = ({
  intl,
  open = false,
  onClose,
  editingTiles = [],
  onEditSubmit,
  onAddSubmit,
  boards = [],
  userData,
}) => {
  const tileEditor = useTileEditor(editingTiles, open);
  const imageUpload = useImageUpload();
  const [isSymbolSearchOpen, setIsSymbolSearchOpen] = useState(false);
  const [autoFill, setAutoFill] = useState('');
  const [openImageEditor, setOpenImageEditor] = useState(false);

  const updateCurrentTile = (changes: Partial<Tile>) => {
    if (tileEditor.isEditing) {
      const activeIndex = tileEditor.activeStep;
      tileEditor.setTiles((prevTiles) =>
        prevTiles.map((tile, index) =>
          index === activeIndex ? { ...tile, ...changes } : tile,
        ),
      );
    } else {
      tileEditor.setTile((prevTile) => ({ ...prevTile, ...changes }));
    }
  };

  const currentLabel = tileEditor.currentTile.labelKey
    ? intl.formatMessage({ id: tileEditor.currentTile.labelKey })
    : tileEditor.currentTile.label;

  const handleSubmit = async () => {
    await handleTileSubmit(
      tileEditor.isEditing,
      tileEditor.tiles,
      tileEditor.tile,
      imageUpload.imageUploadedData,
      tileEditor.selectedBackgroundColor,
      imageUpload.updateTileImgURL,
      userData,
      onEditSubmit,
      onAddSubmit,
    );

    tileEditor.resetState();
    imageUpload.resetImageData();
  };

  const handleCancel = () => {
    tileEditor.resetState();
    imageUpload.resetImageData();
    onClose();
  };

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateCurrentTile({
      label: event.target.value,
      labelKey: '',
    });
  };

  const handleVocalizationChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const updates = updateTileProperty(
      tileEditor.tiles,
      tileEditor.tile,
      tileEditor.isEditing,
      tileEditor.activeStep,
      'vocalization',
      event.target.value,
    );

    if (updates.tiles) {
      tileEditor.setTiles(updates.tiles);
    } else if (updates.tile) {
      tileEditor.setTile(updates.tile);
    }
  };

  const handleTypeChange = (event: any, type: string) => {
    const newTile = createTileForType(
      type as 'button' | 'folder' | 'board',
      tileEditor.tile,
      tileEditor.defaultTileColors,
    );
    tileEditor.setTile(newTile);
    tileEditor.setLinkedBoard('');
  };

  const handleColorChange = (event?: React.ChangeEvent<HTMLInputElement>) => {
    const color = event
      ? event.target.value
      : getDefaultColor(
          tileEditor.currentTile.type as 'button' | 'folder' | 'board',
          tileEditor.defaultTileColors,
        );
    tileEditor.setSelectedBackgroundColor(color);

    const updates = updateTileProperty(
      tileEditor.tiles,
      tileEditor.tile,
      tileEditor.isEditing,
      tileEditor.activeStep,
      'backgroundColor',
      color,
    );

    if (updates.tiles) {
      tileEditor.setTiles(updates.tiles);
    } else if (updates.tile) {
      tileEditor.setTile(updates.tile);
    }
  };

  const handleBoardsChange = (event?: React.ChangeEvent<HTMLSelectElement>) => {
    const board = event ? event.target.value : '';
    tileEditor.setLinkedBoard(board);

    if (board && board !== 'none') {
      const boardObj = boards.find((b) => b.id === board);

      const linkedUpdates = updateTileProperty(
        tileEditor.tiles,
        tileEditor.tile,
        tileEditor.isEditing,
        tileEditor.activeStep,
        'linkedBoard',
        true,
      );

      const loadBoardUpdates = updateTileProperty(
        tileEditor.tiles,
        tileEditor.tile,
        tileEditor.isEditing,
        tileEditor.activeStep,
        'loadBoard',
        boardObj?.id || board,
      );

      if (linkedUpdates.tiles && loadBoardUpdates.tiles) {
        tileEditor.setTiles(loadBoardUpdates.tiles);
      } else if (loadBoardUpdates.tile) {
        tileEditor.setTile(loadBoardUpdates.tile);
      }
    } else {
      const linkedUpdates = updateTileProperty(
        tileEditor.tiles,
        tileEditor.tile,
        tileEditor.isEditing,
        tileEditor.activeStep,
        'linkedBoard',
        false,
      );

      const loadBoardUpdates = updateTileProperty(
        tileEditor.tiles,
        tileEditor.tile,
        tileEditor.isEditing,
        tileEditor.activeStep,
        'loadBoard',
        shortid.generate(),
      );

      if (linkedUpdates.tiles && loadBoardUpdates.tiles) {
        tileEditor.setTiles(loadBoardUpdates.tiles);
      } else if (loadBoardUpdates.tile) {
        tileEditor.setTile(loadBoardUpdates.tile);
      }
    }
  };

  const handleSearchClick = (
    event: React.MouseEvent,
    currentLabel?: string,
  ) => {
    setIsSymbolSearchOpen(true);
    setAutoFill(currentLabel || '');
    imageUpload.setIsEditImageBtnActive(false);
  };

  const handleSymbolSearchChange = ({
    image,
    labelKey,
    label,
    keyPath,
  }: SymbolSearchResult) => {
    return new Promise<void>((resolve) => {
      updateCurrentTile({
        labelKey,
        label,
        image,
        keyPath,
      });

      if (imageUpload.imageUploadedData.length) {
        imageUpload.setImageUploadData(tileEditor.activeStep, false, '');
      }
      resolve();
    });
  };

  const handleImageInputChange = (
    blob: Blob,
    fileName: string,
    blobHQ: Blob,
  ) => {
    const imageUrl = imageUpload.handleInputImageChange(blob, fileName, blobHQ);
    updateCurrentTile({
      image: imageUrl,
      keyPath: undefined,
    });
  };

  const buttons = (
    <IconButton
      label={intl.formatMessage(messages.symbolSearch)}
      onClick={() => handleSearchClick({} as React.MouseEvent, currentLabel)}
      size="large"
    >
      <SearchIcon />
    </IconButton>
  );

  return (
    <div className="TileEditor">
      <FullScreenDialog
        disableSubmit={!currentLabel}
        buttons={buttons}
        open={open}
        title={
          <FormattedMessage
            {...(tileEditor.isEditing
              ? messages.editTile
              : messages.createTile)}
          />
        }
        onClose={handleCancel}
        onSubmit={handleSubmit}
      >
        <Paper>
          <FullScreenDialogContent className="TileEditor__container">
            <div className="TileEditor__row">
              <div className="TileEditor__main-info">
                <TileImageControls
                  intl={intl}
                  currentLabel={currentLabel}
                  isEditImageBtnActive={imageUpload.isEditImageBtnActive}
                  openImageEditor={openImageEditor}
                  imageUploadedData={imageUpload.imageUploadedData as any}
                  activeStep={tileEditor.activeStep}
                  onSearchClick={handleSearchClick}
                  onInputImageChange={handleImageInputChange}
                  onImageEditorClick={() => setOpenImageEditor(true)}
                  onImageEditorClose={() => setOpenImageEditor(false)}
                  onImageEditorDone={(blob: Blob) => {
                    const newData = [...imageUpload.imageUploadedData];
                    if (newData[tileEditor.activeStep]) {
                      newData[tileEditor.activeStep].blob = blob;
                      imageUpload.setImageUploadedData(newData);
                    }

                    const image = URL.createObjectURL(blob);
                    const updates = updateTileProperty(
                      tileEditor.tiles,
                      tileEditor.tile,
                      tileEditor.isEditing,
                      tileEditor.activeStep,
                      'image',
                      image,
                    );

                    if (updates.tiles) {
                      tileEditor.setTiles(updates.tiles);
                    } else if (updates.tile) {
                      tileEditor.setTile(updates.tile);
                    }
                  }}
                />

                <TilePreview
                  tile={tileEditor.currentTile}
                  backgroundColor={tileEditor.selectedBackgroundColor}
                  currentLabel={currentLabel}
                />

                <TileFormFields
                  intl={intl}
                  currentTile={tileEditor.currentTile}
                  currentLabel={currentLabel}
                  isEditing={tileEditor.isEditing}
                  boards={boards}
                  linkedBoard={tileEditor.linkedBoard}
                  onLabelChange={handleLabelChange}
                  onVocalizationChange={handleVocalizationChange}
                  onTypeChange={handleTypeChange}
                  onBoardsChange={handleBoardsChange}
                />
              </div>
            </div>

            <div className="TileEditor__row">
              <div className="TileEditor__form-fields">
                <div className="TileEditor__colorselect">
                  <ColorSelect
                    intl={intl}
                    selectedColor={tileEditor.selectedBackgroundColor}
                    onChange={handleColorChange}
                  />
                </div>
                {tileEditor.currentTile.type !== 'board' && (
                  <div className="TileEditor__voicerecorder">
                    <FormLabel>
                      {intl.formatMessage(messages.voiceRecorder)}
                    </FormLabel>
                    <PremiumFeature>
                      <VoiceRecorder
                        intl={intl}
                        src={tileEditor.currentTile.sound}
                        onChange={(sound: string) => {
                          const updates = updateTileProperty(
                            tileEditor.tiles,
                            tileEditor.tile,
                            tileEditor.isEditing,
                            tileEditor.activeStep,
                            'sound',
                            sound,
                          );

                          if (updates.tiles) {
                            tileEditor.setTiles(updates.tiles);
                          } else if (updates.tile) {
                            tileEditor.setTile(updates.tile);
                          }
                        }}
                      />
                    </PremiumFeature>
                  </div>
                )}
              </div>
            </div>
          </FullScreenDialogContent>

          {tileEditor.tiles.length > 1 && (
            <MobileStepper
              variant="progress"
              steps={tileEditor.tiles.length}
              position="static"
              activeStep={tileEditor.activeStep}
              nextButton={
                <Button
                  onClick={() => {
                    tileEditor.setActiveStep(tileEditor.activeStep + 1);
                    tileEditor.setSelectedBackgroundColor('');
                    imageUpload.setIsEditImageBtnActive(false);
                  }}
                  disabled={
                    tileEditor.activeStep === tileEditor.tiles.length - 1
                  }
                >
                  {intl.formatMessage(messages.next)} <KeyboardArrowRightIcon />
                </Button>
              }
              backButton={
                <Button
                  onClick={() => {
                    tileEditor.setActiveStep(tileEditor.activeStep - 1);
                    tileEditor.setSelectedBackgroundColor('');
                    imageUpload.setIsEditImageBtnActive(false);
                  }}
                  disabled={tileEditor.activeStep === 0}
                >
                  <KeyboardArrowLeftIcon />
                  {intl.formatMessage(messages.back)}
                </Button>
              }
            />
          )}
        </Paper>

        <SymbolSearch
          open={isSymbolSearchOpen}
          autoFill={autoFill}
          onChange={handleSymbolSearchChange}
          onClose={() => {
            setIsSymbolSearchOpen(false);
            if (
              imageUpload.imageUploadedData.length &&
              imageUpload.imageUploadedData[tileEditor.activeStep]?.isUploaded
            ) {
              imageUpload.setIsEditImageBtnActive(true);
            }
          }}
        />
      </FullScreenDialog>
    </div>
  );
};

export default injectIntl(TileEditor);
