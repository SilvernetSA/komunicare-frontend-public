import React, { useState, useCallback } from 'react';
import { useIntl } from 'react-intl';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

import IconButton from '../IconButton/IconButton';
import messages from './FullScreenButton.messages';

interface FullScreenButtonProps {
  disabled?: boolean;
}

const FullScreenButton: React.FC<FullScreenButtonProps> = ({ disabled }) => {
  const [fullscreen, setFullscreen] = useState(false);
  const intl = useIntl();

  const requestFullscreen = useCallback(
    (
      element: HTMLElement & {
        mozRequestFullScreen?: () => void;
        webkitRequestFullScreen?: (flag: number) => void;
      },
    ) => {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullScreen) {
        (element as any).webkitRequestFullScreen(
          (Element as any).ALLOW_KEYBOARD_INPUT,
        );
      }
      setFullscreen(true);
    },
    [],
  );

  const exitFullscreen = useCallback(() => {
    if ((document as any).exitFullscreen) {
      (document as any).exitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    }
    setFullscreen(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (fullscreen) {
      exitFullscreen();
    } else {
      requestFullscreen(window.document.documentElement);
    }
  }, [fullscreen, exitFullscreen, requestFullscreen]);

  const handleClick = useCallback(() => {
    toggleFullscreen();
  }, [toggleFullscreen]);

  const fullScreenLabel = fullscreen
    ? intl.formatMessage(messages.exitFullscreen)
    : intl.formatMessage(messages.fullscreen);

  return (
    <IconButton
      disabled={disabled}
      label={fullScreenLabel}
      onClick={handleClick}
      size="large"
    >
      {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
    </IconButton>
  );
};

export default FullScreenButton;
