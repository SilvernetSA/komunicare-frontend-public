import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import React from 'react';
import { useIntl } from 'react-intl';

import withChildProof from './childProof';
import messages from './LockToggle.messages';
import IconButton from '@/domains/shared/components/UI/IconButton/IconButton';

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
