import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import {
  EMPTY_PRODUCT,
  ERROR,
  INCLUDED_FEATURES,
  ON_TRIAL_PERIOD,
} from './Subscribe.constants';
import { formatTitle } from './Subscribe.helpers';
import messages from './Subscribe.messages';
import { IS_ANDROID, IS_IOS } from '../../../platform';
import {
  EXPIRED,
  NOT_SUBSCRIBED,
  ON_HOLD,
  PROCCESING,
  UNVERIFIED,
} from '../../../providers/SubscriptionProvider/SubscriptionProvider.constants';
import { Product, SubscriptionData } from '../../../types/subscription';

import './Subscribe.css';

export interface Subscription extends SubscriptionData {}

interface SubscriptionPlansProps {
  subscription: SubscriptionData;
  onRefreshSubscription: () => void;
  isLogged: boolean;
  onSubscribe: (product: Product) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  subscription,
  onRefreshSubscription,
  isLogged,
  onSubscribe,
}) => {
  const { status, expiryDate, error, isOnTrialPeriod, isSubscribed, products } =
    subscription;

  const canPurchase =
    [NOT_SUBSCRIBED, EXPIRED, ON_HOLD].includes(status as any) || !status;

  const subscriptionStatus = (function (): string {
    if (error.showError) return ERROR;
    if (status === UNVERIFIED) return UNVERIFIED;
    if (isOnTrialPeriod && !isSubscribed && status !== PROCCESING)
      return ON_TRIAL_PERIOD;
    if (status && status !== NOT_SUBSCRIBED) return status;
    if (products.length > 0) return NOT_SUBSCRIBED; // tiene planes disponibles
    return EMPTY_PRODUCT; // sin planes cargados
  })();

  const alertProps: {
    [key: string]: 'success' | 'warning' | 'info' | 'error';
  } = {
    active: 'success',
    canceled: 'warning',
    in_grace_period: 'warning',
    proccesing: 'info',
    not_subscribed: 'info',
    error: 'error',
    empty_product: 'warning',
    on_trial_period: 'info',
    unverified: 'warning',
    on_hold: 'warning',
    paused: 'info',
    expired: 'warning',
  };

  const expiryDateFormated = expiryDate
    ? new Date(expiryDate).toLocaleString()
    : '';

  const getMessage = () => {
    function errorMessage(): { id: string; defaultMessage: string } {
      if (error && error.code === '0001') {
        if (IS_ANDROID) return messages.googleAccountAlreadyOwns;
        if (IS_IOS) return messages.appleAccountAlreadyOwns;
      }
      return messages.error;
    }
    return subscriptionStatus === ERROR
      ? errorMessage()
      : messages[subscriptionStatus] || messages.fallback;
  };

  return (
    <>
      <Alert
        variant="filled"
        severity={alertProps[subscriptionStatus]}
        className="Subscribe__Alert"
        icon={
          subscriptionStatus === PROCCESING ? (
            <CircularProgress size={20} />
          ) : (
            ''
          )
        }
        action={
          ![ERROR, EMPTY_PRODUCT, ON_TRIAL_PERIOD].includes(
            subscriptionStatus as any,
          ) && (
            <Button
              color="inherit"
              size="small"
              onClick={onRefreshSubscription}
            >
              <RefreshIcon />
            </Button>
          )
        }
      >
        <FormattedMessage
          {...getMessage()}
          values={{ e: `${expiryDateFormated}` }}
        />
      </Alert>

      <Grid
        container
        spacing={0}
        alignItems="center"
        justifyContent="space-around"
      >
        {products.map((product: Product) => (
          <Grid
            key={product.id}
            size={{ xs: 12, sm: 6 }}
            style={{ padding: '5px', maxWidth: 328 }}
          >
            <Card style={{ minWidth: 275 }} variant="outlined">
              <CardContent>
                <Typography
                  color="secondary"
                  gutterBottom
                  sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}
                >
                  {formatTitle(product.name)}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'baseline',
                    mb: 2,
                  }}
                >
                  <Typography component="h2" variant="h3" color="text.primary">
                    {product.currency} {product.price}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {/* {formatDuration(product.billingPeriod)} */}
                    {/* {product.interval} */}
                  </Typography>
                </Box>

                {!isLogged && (
                  <Button
                    variant="contained"
                    fullWidth={true}
                    color="primary"
                    component={Link}
                    to="/login-signup"
                    disabled={!canPurchase}
                  >
                    <FormattedMessage {...messages.subscribe} />
                  </Button>
                )}
                {isLogged && (
                  <>
                    {product.provider === 'paypal' && (
                      <Button
                        color="primary"
                        variant="contained"
                        size="large"
                        onClick={() => onSubscribe(product)}
                      >
                        Paypal
                      </Button>
                    )}

                    {product.provider === 'mercadopago' && (
                      <Button
                        color="primary"
                        variant="contained"
                        size="large"
                        component={Link}
                        to="/settings/mercado-pago"
                      >
                        Mercado Pago
                      </Button>
                    )}
                  </>
                )}
                <Typography color="secondary">
                  <br />
                  <br />
                  <FormattedMessage {...messages.includedFeatures} />
                </Typography>
                <List disablePadding style={{ padding: '5px' }}>
                  {INCLUDED_FEATURES.map((feature: string) => {
                    return [
                      <ListItem key={feature}>
                        <ListItemIcon sx={{ color: 'green' }}>
                          <CheckCircleIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <FormattedMessage
                              {...(messages[feature] || {
                                ...messages.fallback,
                              })}
                            />
                          }
                          secondary={null}
                        />
                      </ListItem>,
                    ];
                  })}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default SubscriptionPlans;
