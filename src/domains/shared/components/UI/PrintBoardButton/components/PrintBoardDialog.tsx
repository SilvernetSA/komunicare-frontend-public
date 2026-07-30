import { CircularProgress } from '@mui/material';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import FullScreenDialog from '../../FullScreenDialog/FullScreenDialog';
import { FullScreenDialogContent } from '../../FullScreenDialog/FullScreenDialogContent';
import messages from '../PrintBoardButton.messages';

import '../PrintBoardDialog.css';

interface PrintBoardDialogProps {
  title: string;
  open?: boolean;
  loading?: boolean;
  onClose?: () => void;
  onPrintCurrentBoard?: () => void;
}

const PrintBoardDialog: React.FC<PrintBoardDialogProps> = ({
  title,
  open = false,
  loading = false,
  onClose = () => {},
  onPrintCurrentBoard = () => {},
}) => (
  <FullScreenDialog
    disableSubmit={true}
    open={open}
    title={title}
    onClose={onClose}
  >
    <Paper>
      <FullScreenDialogContent className="PrintBoardDialog__container">
        <List>
          <ListItem>
            <ListItemText
              primary={<FormattedMessage {...messages.printBoard} />}
              secondary={<FormattedMessage {...messages.printBoardSecondary} />}
            />
          </ListItem>
          <ListItem>
            <ListItemSecondaryAction>
              {loading && (
                <CircularProgress
                  size={25}
                  className="PrintBoardDialog--spinner"
                  thickness={7}
                />
              )}
              <Button
                color="primary"
                variant="contained"
                onClick={onPrintCurrentBoard}
                disabled={loading}
              >
                <FormattedMessage {...messages.printCurrentBoard} />
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </FullScreenDialogContent>
    </Paper>
  </FullScreenDialog>
);

export default PrintBoardDialog;
