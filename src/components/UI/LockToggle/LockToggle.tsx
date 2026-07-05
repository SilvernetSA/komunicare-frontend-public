import React from 'react';
import { useIntl } from 'react-intl';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import withChildProof from './childProof';
import IconButton from '../IconButton/IconButton';
import messages from './LockToggle.messages';

interface LockToggleProps {
  locked?: boolean;
  [key: string]: unknown;
}

function LockToggle(props: LockToggleProps) {
  const intl = useIntl();
  const { locked, ...rest } = props;

  const lockButtonLabel = locked
    ? intl.formatMessage(messages.unlock)
    : intl.formatMessage(messages.lock);

  return (
    <IconButton label={lockButtonLabel} {...rest} size="large">
      {locked ? <LockOutlinedIcon /> : <LockOpenIcon />}
    </IconButton>
  );
}

const ChildProofLockToggle = withChildProof(LockToggle);

export default ChildProofLockToggle;
