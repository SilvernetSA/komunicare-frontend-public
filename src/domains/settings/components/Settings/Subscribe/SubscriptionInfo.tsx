import RefreshIcon from '@mui/icons-material/Refresh';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import messages from './Subscribe.messages';
import { IS_ANDROID, IS_IOS } from '@/platform';
import {
  ACTIVE,
  CANCELED,
  CANCELLED,
  IN_GRACE_PERIOD,
} from '@/providers/SubscriptionProvider/SubscriptionProvider.constants';
import { useSubscriptionStore } from '@/domains/subscription/stores/subscriptionStore';
import IconButton from '@/domains/shared/components/UI/IconButton/IconButton';
import LoadingIcon from '@/domains/shared/components/UI/LoadingIcon/LoadingIcon';

interface SubscriptionInfoProps {
  onRefreshSubscription: () => void;
  intl?: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  onCancelSubscription: (data: any) => void;
  cancelSubscriptionStatus: string;
  subscriptions: any[];
}

// Mapa seguro: status → clave de mensaje existente
const STATUS_MSG: Record<string, keyof typeof messages> = {
  active: 'active',
  canceled: 'canceled',
  cancelled: 'cancelled',
  in_grace_period: 'in_grace_period',
  not_subscribed: 'not_subscribed',
};

const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({
  onRefreshSubscription,
  intl,
  onCancelSubscription,
  cancelSubscriptionStatus,
}) => {
  const [cancelDialog, setCancelDialog] = useState(false);
  const status = useSubscriptionStore((s) => s.status);
  const expirationDate = useSubscriptionStore((s) => s.expiryDate);

  const isActiveStatus = status === ACTIVE || status === IN_GRACE_PERIOD;
  const isCancelled = status === CANCELED || status === CANCELLED;

  const statusColor =
    status === ACTIVE
      ? { backgroundColor: 'green' }
      : { backgroundColor: 'darkorange' };

  const getPaymentLabel = (): keyof typeof messages => {
    if (status === ACTIVE) return 'nextPayment';
    if (status === IN_GRACE_PERIOD) return 'fixPaymentIssue';
    if (status === CANCELED || status === CANCELLED) return 'premiumWillEnd';
    return 'nextPayment';
  };

  const expiryDisplay = expirationDate
    ? new Date(expirationDate).toLocaleString()
    : '-';

  // Clave segura — nunca undefined
  const statusMsgKey = STATUS_MSG[status] ?? 'fallback';

  return (
    <>
      <Paper elevation={3} className="Subscribe__Info">
        <Typography variant="h5">
          <FormattedMessage {...messages.subscriptionInfo} />
        </Typography>

        <div className="Subscribe__Info__Container">
          <div className="Subscribe__Info__Table__Container">
            <Table aria-label="subscription info">
              <TableBody>
                {/* Fila: Status */}
                <TableRow>
                  <TableCell component="th" scope="row">
                    <FormattedMessage {...messages.status} />
                  </TableCell>
                  <TableCell align="right">
                    <div>
                      <Chip
                        label={<FormattedMessage {...messages[statusMsgKey]} />}
                        size="small"
                        color="primary"
                        style={statusColor}
                      />
                      <IconButton
                        label={
                          intl?.formatMessage(messages.refresh) || 'Refresh'
                        }
                        onClick={onRefreshSubscription}
                        size="large"
                      >
                        <RefreshIcon />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Fila: Fecha */}
                <TableRow>
                  <TableCell component="th" scope="row">
                    <FormattedMessage {...messages[getPaymentLabel()]} />
                  </TableCell>
                  <TableCell align="right">
                    <strong>{expiryDisplay}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="Subscribe__Info__Button__Container">
          {isActiveStatus && (
            <Button
              variant={IS_ANDROID || IS_IOS ? 'contained' : 'text'}
              color="primary"
              onClick={() => setCancelDialog(true)}
              style={{ marginLeft: '1em' }}
            >
              <FormattedMessage {...messages.cancelSubscription} />
            </Button>
          )}
          {isCancelled && (
            <Typography color="textSecondary" style={{ marginLeft: '1em' }}>
              <FormattedMessage {...messages.canceledSubscription} />
            </Typography>
          )}

          <Dialog
            onClose={() => setCancelDialog(false)}
            aria-labelledby="cancel-subscription-dialog"
            open={cancelDialog}
          >
            <DialogTitle id="cancel-subscription-title">
              <FormattedMessage {...messages.cancelSubscription} />
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                <FormattedMessage {...messages.cancelSubscriptionDescription} />
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setCancelDialog(false)}
                color="primary"
                variant="text"
              >
                <FormattedMessage {...messages.close} />
              </Button>
              <Button
                onClick={() => onCancelSubscription({})}
                variant="text"
                color="primary"
                disabled={
                  cancelSubscriptionStatus === 'cancelling' ||
                  cancelSubscriptionStatus === 'ok'
                }
              >
                {cancelSubscriptionStatus === 'cancelling' && <LoadingIcon />}
                <FormattedMessage {...messages.cancelSubscription} />
              </Button>
            </DialogActions>

            {(cancelSubscriptionStatus === 'ok' ||
              cancelSubscriptionStatus === 'error') && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  margin: '20px',
                  mb: 2,
                }}
              >
                {cancelSubscriptionStatus === 'ok' && (
                  <Typography color="primary" variant="body1">
                    <FormattedMessage {...messages.canceledSubscriptionOk} />
                  </Typography>
                )}
                {cancelSubscriptionStatus === 'error' && (
                  <Typography color="error" variant="body1">
                    <FormattedMessage {...messages.canceledSubscriptionError} />
                  </Typography>
                )}
              </Box>
            )}
          </Dialog>
        </div>
      </Paper>
    </>
  );
};

export default SubscriptionInfo;
