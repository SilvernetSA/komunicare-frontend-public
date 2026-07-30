import CloseIcon from '@mui/icons-material/Close';
import CopyIcon from '@mui/icons-material/FilterNone';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import React from 'react';
import { FormattedMessage, IntlShape } from 'react-intl';
import {
  EmailShareButton,
  EmailIcon,
  FacebookShareButton,
  FacebookIcon,
  RedditShareButton,
  RedditIcon,
  TwitterShareButton,
  WhatsappShareButton,
  WhatsappIcon,
  XIcon,
} from 'react-share';

import PremiumFeature from '@/domains/subscription/components/PremiumFeature/PremiumFeature';
import IconButton from '@/domains/shared/components/UI/IconButton/IconButton';
import messages from '../PhraseShare.messages';

const SITE_URL = 'https://komuni.care';

interface SharePhraseDialogProps {
  open: boolean;
  fullScreen?: boolean;
  phrase: string;
  intl: IntlShape;
  onClose: () => void;
  onCopyPhrase: (phrase: string) => void;
}

// Modal dialog that lets the user share the current phrase via copy, email,
// WhatsApp, Facebook, Twitter/X, or Reddit.  Premium-gated: share buttons are
// only visible to premium users.
const SharePhraseDialog: React.FC<SharePhraseDialogProps> = ({
  open,
  fullScreen,
  phrase,
  intl,
  onClose,
  onCopyPhrase,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    fullScreen={fullScreen}
    className="SharePhraseDialog__container"
  >
    <DialogTitle className="SharePhraseDialog__title">
      <FormattedMessage {...messages.title} />
      <IconButton
        label={intl.formatMessage(messages.close)}
        onClick={onClose}
        size="large"
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent className="SharePhraseDialog__content">
      <Typography
        variant="body1"
        className="SharePhraseDialog__phraseText"
        gutterBottom
      >
        {phrase}
      </Typography>
      <PremiumFeature>
        <div className="SharePhraseDialog__socialIcons">
          <Button onClick={() => onCopyPhrase(phrase)} color="primary">
            <div className="SharePhraseDialog__socialIcons__copyAction">
              <CopyIcon />
              <span>
                <FormattedMessage {...messages.copyLink} />
              </span>
            </div>
          </Button>
          <Button>
            <EmailShareButton
              subject={intl.formatMessage(messages.subject)}
              body={phrase}
              url={SITE_URL}
            >
              <div className="SharePhraseDialog__socialIcons__copyAction">
                <EmailIcon round size={48} />
                <span>
                  <FormattedMessage id="email" {...messages.email} />
                </span>
              </div>
            </EmailShareButton>
          </Button>
          <Button>
            <WhatsappShareButton
              title={phrase}
              url={SITE_URL}
              onShareWindowClose={onClose}
            >
              <div className="SharePhraseDialog__socialIcons__copyAction">
                <WhatsappIcon round size={48} />
                <span>
                  <FormattedMessage id="whatsapp" {...messages.whatsapp} />
                </span>
              </div>
            </WhatsappShareButton>
          </Button>
          <Button>
            <FacebookShareButton url={SITE_URL} onShareWindowClose={onClose}>
              <div className="SharePhraseDialog__socialIcons__copyAction">
                <FacebookIcon round size={48} />
                <span>
                  <FormattedMessage id="facebook" {...messages.facebook} />
                </span>
              </div>
            </FacebookShareButton>
          </Button>
          <Button>
            <TwitterShareButton
              title={phrase}
              hashtags={['komunicare', 'AAC']}
              url={SITE_URL}
              onShareWindowClose={onClose}
            >
              <div className="SharePhraseDialog__socialIcons__copyAction">
                <XIcon round size={48} />
                <span>
                  <FormattedMessage id="twitter" {...messages.twitter} />
                </span>
              </div>
            </TwitterShareButton>
          </Button>
          <Button>
            <RedditShareButton
              title={phrase}
              url={SITE_URL}
              onShareWindowClose={onClose}
            >
              <div className="SharePhraseDialog__socialIcons__copyAction">
                <RedditIcon round size={48} />
                <span>
                  <FormattedMessage id="reddit" {...messages.reddit} />
                </span>
              </div>
            </RedditShareButton>
          </Button>
        </div>
      </PremiumFeature>
    </DialogContent>
  </Dialog>
);

export default SharePhraseDialog;
