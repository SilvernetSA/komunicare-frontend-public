import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import React from 'react';
import { IntlShape } from 'react-intl';

import messages from '../Messages/Board.messages';

interface BoardTitleDialogProps {
  open: boolean;
  titleDialogValue: string;
  intl: IntlShape;
  onClose: () => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

export const BoardTitleDialog: React.FC<BoardTitleDialogProps> = ({
  open,
  titleDialogValue,
  intl,
  onClose,
  onChange,
  onSubmit,
}) => (
  <Dialog
    open={open}
    aria-labelledby="board-dialog-title"
    onClose={onClose}
    PaperProps={{
      sx: {
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
        minWidth: { xs: '90vw', sm: '420px' },
      },
    }}
  >
    <DialogTitle
      id="board-dialog-title"
      sx={{ fontWeight: 600, color: '#424242', pb: 0.5 }}
    >
      {intl.formatMessage(messages.editTitle)}
    </DialogTitle>
    <DialogContent sx={{ pt: '12px !important' }}>
      <TextField
        autoFocus
        margin="dense"
        id="board title"
        label={intl.formatMessage(messages.boardTitle)}
        type="text"
        fullWidth
        value={titleDialogValue}
        onChange={onChange}
        sx={{
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
            { borderColor: '#0d47a1' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#0d47a1' },
        }}
      />
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <Button
        onClick={onClose}
        sx={{ color: '#666', '&:hover': { bgcolor: '#f5f5f5' } }}
      >
        {intl.formatMessage(messages.boardEditTitleCancel)}
      </Button>
      <Button
        onClick={onSubmit}
        variant="contained"
        disabled={!titleDialogValue.trim()}
        sx={{
          bgcolor: '#0d47a1',
          '&:hover': { bgcolor: '#08306b' },
          borderRadius: '8px',
          px: 3,
          fontWeight: 600,
        }}
      >
        {intl.formatMessage(messages.boardEditTitleAccept)}
      </Button>
    </DialogActions>
  </Dialog>
);
