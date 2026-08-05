import Button from '@mui/material/Button';
import classNames from 'classnames';
import React from 'react';

interface EditToolbarTitleProps {
  isSaving: boolean;
  isLoggedIn: boolean;
  boardTitle: string;
  onBoardTitleClick?: () => void;
}

export const EditToolbarTitle: React.FC<EditToolbarTitleProps> = ({
  isSaving,
  isLoggedIn,
  boardTitle,
  onBoardTitleClick,
}) => {
  if (isSaving || !isLoggedIn) {
    return <span className="EditToolbar__BoardTitle">{boardTitle}</span>;
  }

  return (
    <Button
      className={classNames('EditToolbar__BoardTitle', {
        'logged-in': isLoggedIn,
      })}
      onClick={onBoardTitleClick}
    >
      {boardTitle}
    </Button>
  );
};
