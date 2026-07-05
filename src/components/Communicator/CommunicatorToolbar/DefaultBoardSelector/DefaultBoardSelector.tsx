import AppsIcon from '@mui/icons-material/Apps';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import messages from '../CommunicatorToolbar.messages';
import styles from './DefaultBoardSelector.module.css';
import DefaultBoardsGallery from './DefaultBoardsGallery';
import { DefaultBoardSelection } from '../../../../utils/changeDefaultBoard';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} unmountOnExit />;
});

interface DefaultBoardSelectorProps {
  disabled?: boolean;
  isDarkMode?: boolean;
  changeDefaultBoard: (selection: string | DefaultBoardSelection) => void;
}

/**
 * Shows the official Komunicare starter board so the user can switch their
 * default communicator.  Custom user boards are accessed from the
 * boards drop-down in the toolbar, not from here.
 *
 * `disableScrollLock` prevents MUI Dialog from hiding the page scrollbar
 * and adding compensating padding to <body>, which would change the
 * Grid container's measured width and trigger a react-grid-layout
 * re-layout (with CSS transitions) that makes pictograms flicker.
 */
const DefaultBoardSelector: React.FC<DefaultBoardSelectorProps> = ({
  disabled = false,
  isDarkMode = false,
  changeDefaultBoard,
}) => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const handleClickOpen = () => setOpen(true);

  const handleOptionClick = (defaultBoardName: string) => {
    changeDefaultBoard(defaultBoardName);
    handleClose();
  };

  const dialogTitle = intl.formatMessage(messages.selectDefaultBoardTitle);

  return (
    <React.Fragment>
      <IconButton
        aria-label={intl.formatMessage(messages.defaultBoardsIconLabel)}
        disabled={disabled || open}
        onClick={handleClickOpen}
        className="default__boards__selector"
        size="large"
      >
        <AppsIcon />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        slots={{ transition: Transition }}
        scroll="paper"
        className={isDarkMode ? styles.isDark : ''}
        fullWidth={false}
        maxWidth="lg"
        disableScrollLock
      >
        <DialogTitle className={styles.dialogBar}>
          <Typography component="div" variant="h5" className={styles.header}>
            <span>{dialogTitle}</span>
            <span>
              <IconButton
                aria-label={intl.formatMessage(messages.close)}
                onClick={handleClose}
                className={styles.closeButton}
                size="large"
              >
                <CloseIcon className={styles.close} />
              </IconButton>
            </span>
          </Typography>
        </DialogTitle>

        <DefaultBoardsGallery onOptionClick={handleOptionClick} intl={intl} />
      </Dialog>
    </React.Fragment>
  );
};

export default DefaultBoardSelector;
