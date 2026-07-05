import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import React from 'react';
import { IntlShape } from 'react-intl';

import PremiumFeature from '../../PremiumFeature/PremiumFeature';
import messages from '../Board.messages';

interface BoardDialogsProps {
  copyPublicBoard: { id: string; name: string } | boolean;
  blockedPrivateBoard: boolean;
  confirmDeleteOpen?: boolean;
  existingCopyFoundOpen?: boolean;
  onClose: () => void;
  onCopyRemoteBoard: () => void;
  onConfirmDelete?: () => void;
  onGoToExistingCopy?: () => void;
  intl: IntlShape;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const BoardDialogs: React.FC<BoardDialogsProps> = ({
  copyPublicBoard,
  blockedPrivateBoard,
  confirmDeleteOpen = false,
  existingCopyFoundOpen = false,
  onClose,
  onCopyRemoteBoard,
  onConfirmDelete = () => {},
  onGoToExistingCopy = () => {},
  intl,
}) => {
  return (
    <>
      <Dialog
        open={!!copyPublicBoard}
        TransitionComponent={Transition}
        keepMounted
        onClose={onClose}
        aria-labelledby="dialog-copy-title"
        aria-describedby="dialog-copy-desc"
      >
        <DialogTitle id="dialog-copy-board-title">
          {intl.formatMessage(messages.copyPublicBoardTitle)}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-copy-board-desc">
            {intl.formatMessage(messages.copyPublicBoardDesc)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            {intl.formatMessage(messages.boardCopyCancel)}
          </Button>
          <PremiumFeature>
            <Button
              onClick={onCopyRemoteBoard}
              color="primary"
              variant="contained"
            >
              {intl.formatMessage(messages.boardCopyAccept)}
            </Button>
          </PremiumFeature>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDeleteOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={onClose}
        aria-labelledby="dialog-delete-title"
        aria-describedby="dialog-delete-desc"
      >
        <DialogTitle id="dialog-delete-title">
          {intl.formatMessage(messages.deleteTilesConfirmTitle)}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-delete-desc">
            {intl.formatMessage(messages.deleteTilesConfirmDesc)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            {intl.formatMessage(messages.boardCopyCancel)}
          </Button>
          <Button onClick={onConfirmDelete} color="primary" variant="contained">
            {intl.formatMessage(messages.boardCopyAccept)}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={existingCopyFoundOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={onClose}
        aria-labelledby="dialog-existing-copy-title"
        aria-describedby="dialog-existing-copy-desc"
      >
        <DialogTitle id="dialog-existing-copy-title">
          {intl.formatMessage(messages.existingCopyFoundTitle)}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-existing-copy-desc">
            {intl.formatMessage(messages.existingCopyFoundDesc)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            {intl.formatMessage(messages.boardCopyCancel)}
          </Button>
          <Button onClick={onGoToExistingCopy} color="primary" variant="contained">
            {intl.formatMessage(messages.boardCopyAccept)}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={blockedPrivateBoard}
        TransitionComponent={Transition}
        keepMounted
        onClose={onClose}
        aria-labelledby="dialog-blocked-title"
        aria-describedby="dialog-blocked-desc"
      >
        <DialogTitle id="dialog-blocked-board-title">
          {intl.formatMessage(messages.blockedPrivateBoardTitle)}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-blocked-board-desc">
            {intl.formatMessage(messages.blockedPrivateBoardDesc)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary" variant="contained">
            {intl.formatMessage(messages.boardCopyAccept)}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BoardDialogs;
