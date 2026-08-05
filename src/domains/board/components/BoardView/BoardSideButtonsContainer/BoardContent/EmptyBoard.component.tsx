import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from './EmptyBoard.messages';
import './EmptyBoard.css';

interface EmptyBoardProps {
  canAccessToContent?: boolean;
}

const EmptyBoard: React.FC<EmptyBoardProps> = ({
  canAccessToContent: _canAccessToContent,
}) => {
  const theme = useTheme();

  return (
    <div
      className="EmptyBoard"
      style={{ background: theme?.palette?.background?.default || '#ffffff' }}
    >
      <ViewModuleIcon
        sx={{
          width: 120,
          height: 120,
          color: '#aaa',
        }}
      />
      <div style={{ color: '#aaa' }}>
        <FormattedMessage {...messages.boardIsEmpty} />
      </div>
    </div>
  );
};

export default EmptyBoard;
