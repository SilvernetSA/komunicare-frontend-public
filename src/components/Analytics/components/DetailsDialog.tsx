import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Slide from '@mui/material/Slide';
import React from 'react';
import { IntlShape } from 'react-intl';

import StyledTable from '../../UI/StyledTable/StyledTable.component';
import messages from '../Analytics.messages';

interface DetailsDialogProps {
  intl?: IntlShape;
  open: boolean;
  detailsData: Array<Record<string, unknown>>;
  onClose: () => void;
}

const Transition = React.forwardRef<unknown, { children: React.ReactElement }>(
  function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  },
);

const DetailsDialog: React.FC<DetailsDialogProps> = ({
  intl,
  open,
  detailsData,
  onClose,
}) => {
  const tablesHead = [
    intl ? intl.formatMessage(messages.name) : 'Name',
    intl ? intl.formatMessage(messages.timesClicked) : 'Times Clicked',
    intl ? intl.formatMessage(messages.action) : 'Action',
  ];

  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="details-dialog"
      open={open}
      TransitionComponent={Transition}
      aria-describedby="details-desc"
    >
      <DialogContent sx={{ color: 'white', padding: '0px' }}>
        <DialogContentText id="details-dialog-desc" />
        <StyledTable data={detailsData} tableHead={tablesHead} isDense={true} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {intl ? intl.formatMessage(messages.close) : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetailsDialog;
