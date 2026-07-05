import WarningIcon from '@mui/icons-material/Warning';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';

import messages from './PremiumFeature.messages';
import style from './PremiumRequiredModal.module.css';
import { useSubscriptionStore } from '../../store/subscriptionStore';

interface PremiumRequiredModalState {
  open: boolean;
  showTryPeriodFinishedMessages: boolean;
}

const SUBSCRIPTION_PATHS = new Set([
  '/settings/subscribe',
  '/settings/subscription',
  '/settings/mercado-pago',
]);

export const isSubscriptionPath = (pathname: string): boolean =>
  SUBSCRIPTION_PATHS.has(pathname);

const PremiumRequiredModal: React.FC = () => {
  const location = useLocation();
  const premiumRequiredModalState = useSubscriptionStore(
    (state) => state.premiumRequiredModalState,
  ) as PremiumRequiredModalState;
  const hidePremiumRequired = useSubscriptionStore(
    (state) => state.hidePremiumRequired,
  );

  const { open, showTryPeriodFinishedMessages } = premiumRequiredModalState || {
    open: false,
    showTryPeriodFinishedMessages: false,
  };

  // Modal bloqueante: trial expirado o sin suscripción — no se puede cerrar
  const isBlocking = showTryPeriodFinishedMessages;

  // La pantalla que permite recuperar el acceso nunca debe quedar bloqueada.
  if (isSubscriptionPath(location.pathname)) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={isBlocking ? undefined : hidePremiumRequired}
      disableEscapeKeyDown={isBlocking}
      maxWidth="md"
      aria-labelledby="dialog"
      // Evita cerrar al hacer click fuera cuando es bloqueante
      slotProps={
        isBlocking ? { backdrop: { onClick: (e) => e.stopPropagation() } } : {}
      }
    >
      <DialogContent className={style.content}>
        <WarningIcon fontSize="large" color="action" />
        <Typography variant="h3">
          {isBlocking ? (
            <FormattedMessage {...messages.tryPeriodFinishTittle} />
          ) : (
            <FormattedMessage {...messages.featureBlockedTittle} />
          )}
        </Typography>
        <Typography className={style.dialogText} variant="h6">
          {isBlocking ? (
            <FormattedMessage {...messages.tryPeriodFinishBody} />
          ) : (
            <FormattedMessage {...messages.featureBlockedText} />
          )}
        </Typography>
        <Button
          // Solo cierra el modal si NO es bloqueante
          onClick={isBlocking ? undefined : hidePremiumRequired}
          color="primary"
          variant="contained"
          size="large"
          component={Link}
          to="/settings/subscribe"
        >
          <FormattedMessage {...messages.upgradeNow} />
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumRequiredModal;
