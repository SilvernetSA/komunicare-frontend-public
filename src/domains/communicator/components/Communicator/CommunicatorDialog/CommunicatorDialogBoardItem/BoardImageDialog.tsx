import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import SearchIcon from '@mui/icons-material/Search';
import Slide from '@mui/material/Slide';
import React from 'react';

import { Board } from '@/types/board';
import InputImage from '@/domains/shared/components/UI/InputImage/InputImage.component';

const Transition = React.forwardRef<unknown, { children: React.ReactElement }>(
  function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  },
);

interface BoardImageDialogProps {
  open: boolean;
  board: Board;
  imageBoard: string;
  intl?: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  messages: Record<string, { id: string; defaultMessage: string }>;
  onClose: () => void;
  onImageChange: (resizedBlob: Blob, fileName: string, blobHQ: Blob) => void;
  onSymbolSearchClick: () => void;
  onAccept: () => void;
}

const BoardImageDialog: React.FC<BoardImageDialogProps> = ({
  open,
  board,
  imageBoard,
  intl,
  messages,
  onClose,
  onImageChange,
  onSymbolSearchClick,
  onAccept,
}) => {
  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="board-image-dialog"
      open={open}
      slots={{ transition: Transition }}
      aria-describedby="board-image-desc"
    >
      <DialogTitle id="board-image-title">
        {intl ? intl.formatMessage(messages.imageBoard) : 'Board Image'}
      </DialogTitle>
      <DialogContent className="CommunicatorDialog__imageDialog__content">
        <DialogContentText id="dialog-image-board-desc">
          {intl
            ? intl.formatMessage(messages.imageBoardDescription)
            : 'Select an image for this board'}
        </DialogContentText>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SearchIcon />}
          onClick={onSymbolSearchClick}
        >
          {intl
            ? intl.formatMessage(messages.imageSearch)
            : 'Search for symbols'}
        </Button>
        <InputImage onChange={onImageChange} intl={intl} />
        {!!imageBoard && <img src={imageBoard} alt={board.name} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {intl ? intl.formatMessage(messages.close) : 'Close'}
        </Button>
        <Button onClick={onAccept} color="primary">
          {intl ? intl.formatMessage(messages.accept) : 'Accept'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BoardImageDialog;
