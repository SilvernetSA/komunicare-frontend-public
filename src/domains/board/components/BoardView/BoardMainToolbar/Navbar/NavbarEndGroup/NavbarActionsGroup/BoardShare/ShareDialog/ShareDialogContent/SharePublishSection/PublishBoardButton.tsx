import Button from '@mui/material/Button';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from '../../../../BoardShare.messages';

import PremiumFeature from '@/domains/subscription/components/PremiumFeature/PremiumFeature';

interface PublishBoardButtonProps {
  isPublic?: boolean;
  publishBoard: () => void;
}

export const PublishBoardButton: React.FC<PublishBoardButtonProps> = ({
  isPublic,
  publishBoard,
}) => (
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
);
