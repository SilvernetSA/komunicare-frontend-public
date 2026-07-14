import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import React from 'react';
import { IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';

import { useBoardsStore } from '../../../../../store/boardsStore';
import messages from '../../../Board.messages';
import OutputContainer from '../Output/Output';

interface DisplaySettings {
  hideOutputActive?: boolean;
  [key: string]: unknown;
}

interface BoardHeaderProps {
  intl: IntlShape;
  displaySettings: DisplaySettings;
  emptyVoiceAlert?: boolean;
  offlineVoiceAlert?: boolean;
}

const BoardHeader: React.FC<BoardHeaderProps> = ({
  intl,
  displaySettings,
  emptyVoiceAlert,
  offlineVoiceAlert,
}) => {
  const hasOutput = useBoardsStore((state) => state.output.length > 0);

  return (
    <div className="BoardHeader">
      {!displaySettings.hideOutputActive && hasOutput && (
        <div className="Board__output">
          <OutputContainer />
        </div>
      )}

      {emptyVoiceAlert && (
        <Alert variant="filled" severity="error">
          {intl.formatMessage(messages.emptyVoiceAlert)}
        </Alert>
      )}

      {offlineVoiceAlert && (
        <Alert
          variant="filled"
          severity="warning"
          action={
            <Button
              size="small"
              variant="outlined"
              style={{ color: 'white', borderColor: 'white' }}
              component={Link}
              to="/settings/speech"
            >
              {intl.formatMessage(messages.offlineChangeVoice)}
            </Button>
          }
        >
          {intl.formatMessage(messages.offlineVoiceAlert)}
        </Alert>
      )}
    </div>
  );
};

export default BoardHeader;
