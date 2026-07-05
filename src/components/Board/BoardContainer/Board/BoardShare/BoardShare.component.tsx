import CloseIcon from '@mui/icons-material/Close';
import CopyIcon from '@mui/icons-material/FilterNone';
import ShareIcon from '@mui/icons-material/Share';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { WhatsappShareButton, WhatsappIcon } from 'react-share';

import messages from './BoardShare.messages';
import './BoardShare.css';
import PremiumFeature from '../../../../PremiumFeature/PremiumFeature';
import IconButton from '../../../../UI/IconButton/IconButton';

const withMobileDialog =
  () =>
  <P extends object>(WrappedComponent: React.ComponentType<P>) =>
  (props: P) => <WrappedComponent {...props} width="lg" fullScreen={false} />;

const MIN_TILES_TO_PUBLISH = 5;

interface BoardShareProps {
  label: string;
  url: string;
  intl: {
    formatMessage: (
      message: { id: string; defaultMessage: string },
      values?: Record<string, unknown>,
    ) => string;
  };
  disabled?: boolean;
  open?: boolean;
  isOwnBoard?: boolean;
  isPublic?: boolean;
  isLogged?: boolean;
  fullScreen?: boolean;
  tileCount?: number;
  onShareClick: () => void;
  onShareClose?: () => void;
  publishBoard: () => void;
  onCopyLink?: () => void;
}

const BoardShare = ({
  label,
  url,
  intl,
  disabled = false,
  open = false,
  isOwnBoard = true,
  isPublic,
  isLogged,
  fullScreen,
  tileCount = 0,
  onShareClick,
  onShareClose = () => {},
  publishBoard,
  onCopyLink = () => {},
}: BoardShareProps) => {
  const hasMinimumTiles = tileCount >= MIN_TILES_TO_PUBLISH;
  return (
    <React.Fragment>
      <IconButton
        label={label}
        disabled={disabled || open}
        onClick={onShareClick}
        size="large"
      >
        <ShareIcon />
      </IconButton>

      <Dialog
        open={open}
        onClose={onShareClose}
        fullScreen={fullScreen}
        className="ShareDialog__container"
        PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
      >
        <DialogTitle className="ShareDialog__title">
          <FormattedMessage {...messages.title} />

          <IconButton
            label={intl.formatMessage(messages.close)}
            onClick={onShareClose}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="ShareDialog__content">
          <div className="ShareDialog__content__publish">
            {!isOwnBoard ? (
              <Alert severity="info">
                <FormattedMessage {...messages.catalogBoardPublishInfo} />
              </Alert>
            ) : !hasMinimumTiles ? (
              <Alert severity="info">
                <FormattedMessage {...messages.insufficientTiles} />
              </Alert>
            ) : isLogged ? (
              <PremiumFeature>
                <Button
                  color="primary"
                  variant={isPublic ? 'outlined' : 'contained'}
                  onClick={publishBoard}
                >
                  {!isPublic ? (
                    <FormattedMessage {...messages.publishBoard} />
                  ) : (
                    <FormattedMessage {...messages.unpublishBoard} />
                  )}
                </Button>
              </PremiumFeature>
            ) : (
              <React.Fragment>
                <Alert severity="warning">
                  <FormattedMessage {...messages.unregisteredWarning} />
                </Alert>
                <Button
                  color="primary"
                  variant="contained"
                  component={Link}
                  to="/login-signup"
                >
                  <FormattedMessage {...messages.loginSignUp} />
                </Button>
              </React.Fragment>
            )}
          </div>
          {isLogged && (
            <div className="ShareDialog__socialIcons">
              <PremiumFeature>
                <Button
                  disabled={!isPublic}
                  onClick={onCopyLink}
                  color="primary"
                >
                  <div className="ShareDialog__socialIcons__action">
                    <div>
                      <CopyIcon />
                    </div>
                    <span>
                      <FormattedMessage {...messages.copyLink} />
                    </span>
                  </div>
                </Button>
                <Button disabled={!isPublic} color="primary">
                  <WhatsappShareButton
                    title={intl.formatMessage(messages.subject)}
                    url={url}
                  >
                    <div className="ShareDialog__socialIcons__action">
                      <div>
                        <WhatsappIcon round size={64} />
                      </div>
                      <span>
                        <FormattedMessage
                          id="whatsapp"
                          {...messages.whatsapp}
                        />
                      </span>
                    </div>
                  </WhatsappShareButton>
                </Button>
              </PremiumFeature>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default withMobileDialog()(BoardShare);
