import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from '../../App/App.messages';
import BackButton from '../BackButton/BackButton';
import './FullScreenDialog.css';

interface FullScreenDialogProps {
  disableSubmit?: boolean;
  open?: boolean;
  fullWidth?: boolean;
  title?: string | React.ReactNode;
  onClose?: () => void;
  onSubmit?: () => void;
  className?: string;
  children?: React.ReactNode;
  buttons?: React.ReactNode;
  transition?: string;
}

const StyledAppBar = styled(AppBar)({
  position: 'static',
  flexShrink: 0,
  backgroundColor: '#ffffff',
  color: '#424242',
  boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
  borderBottom: '1px solid #f0f0f0',
});

const StyledTitle = styled(Typography)({
  flex: 1,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
});

const StyledContainer = styled('div')<{ dark?: boolean }>(({ dark }) => ({
  background: dark ? '#111' : '#f5f5f7',
  height: '100%',
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch',
}));

const StyledContent = styled('div')<{ fullWidth?: boolean }>(
  ({ fullWidth }) => ({
    maxWidth: fullWidth ? 'none' : '680px',
    margin: '0 auto',
  }),
);

const transitions = {
  UP: 'up',
  FADE: 'fade',
};

const TransitionUp = React.forwardRef<any, any>((props, ref) => (
  <Slide direction="up" {...props} ref={ref} />
));

const TransitionFade = React.forwardRef<any, any>((props, ref) => (
  <Fade {...props} ref={ref} />
));

function getTransition(transition: string) {
  switch (transition) {
    case transitions.UP:
      return TransitionUp;
    case transitions.FADE:
      return TransitionFade;
    default:
      return TransitionUp;
  }
}

function FullScreenDialog({
  children,
  open,
  title,
  buttons,
  disableSubmit,
  onClose = () => {},
  onSubmit,
  transition = transitions.UP,
  fullWidth,
}: FullScreenDialogProps) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  return (
    <Dialog
      fullScreen
      open={open}
      TransitionComponent={getTransition(transition)}
      onClose={onClose}
    >
      <StyledAppBar>
        <Toolbar disableGutters>
          <BackButton onClick={onClose} />

          {title && (
            <div className="FullScreenDialog__title">
              <StyledTitle variant="h6" color="inherit">
                {title}
              </StyledTitle>
            </div>
          )}
          {buttons && (
            <div className="FullScreenDialog__buttons">{buttons}</div>
          )}
          {onSubmit && (
            <Button
              id="save-button"
              disabled={disableSubmit}
              onClick={() => {
                onSubmit();
                onClose();
              }}
              sx={{
                color: disableSubmit ? 'rgba(0,0,0,0.26)' : '#7b1fa2',
                fontWeight: 600,
                '&:hover': { bgcolor: 'rgba(123,31,162,0.06)' },
              }}
            >
              <FormattedMessage {...messages.save} />
            </Button>
          )}
        </Toolbar>
      </StyledAppBar>
      <StyledContainer dark={dark}>
        <StyledContent fullWidth={fullWidth}>{children}</StyledContent>
      </StyledContainer>
    </Dialog>
  );
}

export default FullScreenDialog;
