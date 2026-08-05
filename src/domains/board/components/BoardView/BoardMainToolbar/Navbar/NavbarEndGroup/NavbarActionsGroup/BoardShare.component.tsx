import ShareIcon from '@mui/icons-material/Share';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';

import { ShareDialog } from '@/domains/board/components/BoardView/BoardMainToolbar/Navbar/NavbarEndGroup/NavbarActionsGroup/BoardShare/ShareDialog';

import './BoardShare.css';

const withMobileDialog =
  () =>
  <P extends object>(WrappedComponent: React.ComponentType<P>) =>
  (props: P) => <WrappedComponent {...props} width="lg" fullScreen={false} />;

const MIN_TILES_TO_PUBLISH = 5;
const DISABLED_ICON_BUTTON_STYLE = {
  color: 'rgba(0, 0, 0, 0.26)',
};

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
      {disabled || open ? (
        <IconButton
          aria-label={label}
          color="inherit"
          data-tour-id="toolbar-share"
          disabled
          onClick={onShareClick}
          size="large"
          style={DISABLED_ICON_BUTTON_STYLE}
        >
          <ShareIcon />
        </IconButton>
      ) : (
        <Tooltip placement="bottom" title={label}>
          <IconButton
            aria-label={label}
            color="inherit"
            data-tour-id="toolbar-share"
            onClick={onShareClick}
            size="large"
          >
            <ShareIcon />
          </IconButton>
        </Tooltip>
      )}
      <ShareDialog
        open={open}
        fullScreen={fullScreen}
        url={url}
        isOwnBoard={isOwnBoard}
        hasMinimumTiles={hasMinimumTiles}
        isLogged={isLogged}
        isPublic={isPublic}
        intl={intl}
        onShareClose={onShareClose}
        publishBoard={publishBoard}
        onCopyLink={onCopyLink}
      />
    </React.Fragment>
  );
};

export default withMobileDialog()(BoardShare);
