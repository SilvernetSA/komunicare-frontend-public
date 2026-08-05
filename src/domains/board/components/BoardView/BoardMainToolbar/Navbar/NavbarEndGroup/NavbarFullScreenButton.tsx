import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  fullscreen: {
    id: 'komunicare.components.FullScreenButton.fullscreen',
    defaultMessage: 'Full screen',
  },
  exitFullscreen: {
    id: 'komunicare.components.FullScreenButton.exitFullscreen',
    defaultMessage: 'Exit full screen',
  },
});

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

interface NavbarFullScreenButtonProps {
  disabled?: boolean;
}

export const NavbarFullScreenButton: React.FC<NavbarFullScreenButtonProps> = ({
  disabled,
}) => {
  const intl = useIntl();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const syncFullscreenState = () => {
      const fullscreenDocument = document as FullscreenDocument;
      setIsFullscreen(
        Boolean(
          document.fullscreenElement ||
          fullscreenDocument.webkitFullscreenElement,
        ),
      );
    };

    syncFullscreenState();
    document.addEventListener('fullscreenchange', syncFullscreenState);
    document.addEventListener(
      'webkitfullscreenchange',
      syncFullscreenState as EventListener,
    );

    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState);
      document.removeEventListener(
        'webkitfullscreenchange',
        syncFullscreenState as EventListener,
      );
    };
  }, []);

  const handleClick = async () => {
    const fullscreenDocument = document as FullscreenDocument;
    const fullscreenElement = document.documentElement as FullscreenElement;

    if (
      document.fullscreenElement ||
      fullscreenDocument.webkitFullscreenElement
    ) {
      await (document.exitFullscreen?.() ||
        fullscreenDocument.webkitExitFullscreen?.());
      return;
    }

    await (fullscreenElement.requestFullscreen?.() ||
      fullscreenElement.webkitRequestFullscreen?.());
  };

  const label = intl.formatMessage(
    isFullscreen ? messages.exitFullscreen : messages.fullscreen,
  );

  const button = (
    <IconButton
      aria-label={label}
      color="inherit"
      data-tour-id="toolbar-fullscreen"
      disabled={disabled}
      onClick={() => {
        void handleClick();
      }}
      size="large"
      sx={disabled ? { color: 'rgba(0, 0, 0, 0.26)' } : undefined}
    >
      {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
    </IconButton>
  );

  return disabled ? button : <Tooltip title={label}>{button}</Tooltip>;
};
