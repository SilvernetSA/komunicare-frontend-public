import React from 'react';
import Button from '@mui/material/Button';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import EditIcon from '@mui/icons-material/Edit';
import { TAB_INDEXES } from '../CommunicatorDialog.constants';

interface BoardImageSectionProps {
  boardCaption: string;
  title: string;
  selectedTab: number;
  onImageEditClick: () => void;
}

const BoardImageSection: React.FC<BoardImageSectionProps> = ({
  boardCaption,
  title,
  selectedTab,
  onImageEditClick,
}) => {
  return (
    <div className="CommunicatorDialog__boards__item__image">
      {!!boardCaption && (
        <div className="CommunicatorDialog__boards__item__image_container">
          <img src={boardCaption} alt={title} />
          {selectedTab === TAB_INDEXES.MY_BOARDS && (
            <Button
              variant="contained"
              disableElevation={true}
              onClick={onImageEditClick}
              id="CommunicatorDialog__boards__item__image__Btn"
            >
              <EditIcon />
            </Button>
          )}
        </div>
      )}
      {!boardCaption && (
        <div className="CommunicatorDialog__boards__item__image__empty">
          <ViewModuleIcon className="CommunicatorDialog__boards__item__image__empty ViewModuleIcon" />
          {selectedTab === TAB_INDEXES.MY_BOARDS && (
            <Button
              variant="contained"
              disableElevation={true}
              onClick={onImageEditClick}
            >
              <EditIcon />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default BoardImageSection;
