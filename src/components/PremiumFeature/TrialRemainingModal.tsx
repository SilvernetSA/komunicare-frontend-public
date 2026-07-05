import InfoIcon from '@mui/icons-material/Info';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from './PremiumFeature.messages';
import style from './PremiumRequiredModal.module.css';
import { useSubscriptionStore } from '../../store/subscriptionStore';

const TrialRemainingModal: React.FC = () => {
  const open = useSubscriptionStore((state) => state.trialRemainingModalOpen);
  const expiryDate = useSubscriptionStore((state) => state.expiryDate);
  const closeTrialRemainingModal = useSubscriptionStore(
    (state) => state.closeTrialRemainingModal,
  );

  const daysRemaining = expiryDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  return (
    <Dialog
      open={open}
      onClose={closeTrialRemainingModal}
      maxWidth="md"
      aria-labelledby="trial-remaining-dialog"
    >
      <DialogContent className={style.content}>
        <InfoIcon fontSize="large" color="primary" />
        <Typography variant="h3">
          <FormattedMessage {...messages.trialRemainingTitle} />
        </Typography>
        <Typography className={style.dialogText} variant="h6">
          <FormattedMessage
            {...messages.trialRemainingBody}
            values={{ days: daysRemaining }}
          />
        </Typography>
        <Button
          onClick={closeTrialRemainingModal}
          color="primary"
          variant="contained"
          size="large"
        >
          <FormattedMessage {...messages.trialRemainingClose} />
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default TrialRemainingModal;
