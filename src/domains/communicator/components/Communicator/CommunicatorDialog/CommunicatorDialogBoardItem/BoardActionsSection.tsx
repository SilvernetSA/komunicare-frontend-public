import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

import { TAB_INDEXES } from '../CommunicatorDialog.constants';
import CommunicatorBoardsActions from './CommunicatorBoardsActions';
import MyBoardsActions from './MyBoardsActions';

interface BoardActionsSectionProps {
  loading: boolean;
  displayActions: boolean;
  selectedTab: number;
  [key: string]: unknown;
}

const BoardActionsSection: React.FC<BoardActionsSectionProps> = ({
  loading,
  displayActions,
  selectedTab,
  ...props
}) => {
  const renderActions = (): JSX.Element | null => {
    if (!displayActions) return null;

    switch (selectedTab) {
      case TAB_INDEXES.COMMUNICATOR_BOARDS:
        return <CommunicatorBoardsActions {...(props as any)} />;
      case TAB_INDEXES.MY_BOARDS:
        return <MyBoardsActions {...(props as any)} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div>{loading && <CircularProgress size={25} thickness={7} />}</div>
      <div className="CommunicatorDialog__boards__item__actions">
        {renderActions()}
      </div>
    </>
  );
};

export default BoardActionsSection;
