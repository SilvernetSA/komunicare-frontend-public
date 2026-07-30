import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import messages from './ResetToursItem.messages';
import { useAppStore } from '@/domains/app/stores/appStore';

const ResetToursItem: React.FC = () => {
  const enableAllTours = useAppStore((state) => state.enableAllTours);
  const [openDialogToursState, setOpenDialogToursState] = useState(false);

  const handleOnClickOk = () => {
    enableAllTours();
    setOpenDialogToursState(false);
  };

  return (
    <div>
      <ListItem
        onClick={() => setOpenDialogToursState(true)}
        sx={{ cursor: 'pointer' }}
      >
        <ListItemText
          className="Navigation__ListItemText"
          primary={<FormattedMessage {...messages.resetTours} />}
          secondary={<FormattedMessage {...messages.resetToursSecondary} />}
        />
      </ListItem>
      <Dialog
        open={openDialogToursState}
        onClose={() => setOpenDialogToursState(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <FormattedMessage {...messages.confirmDialog} />
        </DialogTitle>
        <DialogActions>
          <Button
            onClick={() => setOpenDialogToursState(false)}
            color="primary"
          >
            <FormattedMessage {...messages.cancel} />
          </Button>
          <Button onClick={handleOnClickOk} color="primary">
            <FormattedMessage {...messages.ok} />
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ResetToursItem;
