import React from 'react';

import { CopyLinkButton } from '@/domains/board/components/BoardView/BoardMainToolbar/Navbar/NavbarEndGroup/NavbarActionsGroup/BoardShare/ShareDialog/ShareDialogContent/ShareSocialIcons/CopyLinkButton';
import { WhatsappButton } from '@/domains/board/components/BoardView/BoardMainToolbar/Navbar/NavbarEndGroup/NavbarActionsGroup/BoardShare/ShareDialog/ShareDialogContent/ShareSocialIcons/WhatsappButton';
import PremiumFeature from '@/domains/subscription/components/PremiumFeature/PremiumFeature';

interface ShareSocialIconsProps {
  url: string;
  isLogged?: boolean;
  isPublic?: boolean;
  intl: {
    formatMessage: (
      message: { id: string; defaultMessage: string },
      values?: Record<string, unknown>,
    ) => string;
  };
  onCopyLink: () => void;
}

export const ShareSocialIcons: React.FC<ShareSocialIconsProps> = ({
  url,
  isLogged,
  isPublic,
  intl,
  onCopyLink,
}) => {
  if (!isLogged) return null;

  return (
    <div className="ShareDialog__socialIcons">
      <PremiumFeature>
        <CopyLinkButton isPublic={isPublic} onCopyLink={onCopyLink} />
        <WhatsappButton url={url} isPublic={isPublic} intl={intl} />
      </PremiumFeature>
    </div>
  );
};
