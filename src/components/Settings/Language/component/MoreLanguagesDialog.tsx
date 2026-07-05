import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slide,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import messages from '../Language.messages';

const Transition = React.forwardRef<any, any>(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface MoreLanguagesDialogProps {
  open: boolean;
  onClose: () => void;
  markdown: string;
}

export const MoreLanguagesDialog: React.FC<MoreLanguagesDialogProps> = ({
  open,
  onClose,
  markdown,
}) => (
  <Dialog
    onClose={onClose}
    aria-labelledby="more-languages-dialog"
    open={open}
    slots={{ transition: Transition }}
    aria-describedby="more-languages-dialog-desc"
  >
    <DialogTitle id="more-languages-dialog-title">
      <FormattedMessage {...messages.moreLanguages} />
    </DialogTitle>
    <DialogContent aria-label="more-languages-dialog-content">
      <div className="Settings__Language__MoreLang__Dialog">
        <ReactMarkdown children={markdown} />
      </div>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        <FormattedMessage {...messages.close} />
      </Button>
    </DialogActions>
  </Dialog>
);
