import React from 'react';

import { CatalogBoardAlert } from './SharePublishSection/CatalogBoardAlert';
import { InsufficientTilesAlert } from './SharePublishSection/InsufficientTilesAlert';
import { PublishBoardButton } from './SharePublishSection/PublishBoardButton';
import { UnregisteredWarning } from './SharePublishSection/UnregisteredWarning';

interface SharePublishSectionProps {
  isOwnBoard: boolean;
  hasMinimumTiles: boolean;
  isLogged?: boolean;
  isPublic?: boolean;
  publishBoard: () => void;
}

export const SharePublishSection: React.FC<SharePublishSectionProps> = ({
  isOwnBoard,
  hasMinimumTiles,
  isLogged,
  isPublic,
  publishBoard,
}) => (
  <div className="ShareDialog__content__publish">
    {!isOwnBoard ? (
      <CatalogBoardAlert />
    ) : !hasMinimumTiles ? (
      <InsufficientTilesAlert />
    ) : isLogged ? (
      <PublishBoardButton isPublic={isPublic} publishBoard={publishBoard} />
    ) : (
      <UnregisteredWarning />
    )}
  </div>
);
