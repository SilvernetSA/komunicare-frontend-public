import { UserData } from '../../../../types/app';
import { Board } from '../../../../types/board';
import { getBoardShareUrl } from '../../../../platform/browser';
import { getBoardDisplayTitle } from '../../../../utils/getBoardDisplayTitle';
import { TAB_INDEXES } from '../CommunicatorDialog.constants';

export const getBoardUrl = (board: Board): string => {
  return getBoardShareUrl(board.id);
};

export const getBoardCaption = (board: Board): string => {
  return board.caption;
};

export const getImageBoard = (imageBoard: string): string => {
  return imageBoard;
};

export const shouldDisplayActions = (
  selectedTab: number,
  userData: UserData,
): boolean => {
  return (
    selectedTab === TAB_INDEXES.MY_BOARDS ||
    selectedTab === TAB_INDEXES.PUBLIC_BOARDS ||
    (selectedTab === TAB_INDEXES.COMMUNICATOR_BOARDS && !!userData.authToken)
  );
};

export const getTitle = (
  board: Board,
  intl?: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
    messages?: Record<string, unknown>;
  },
): string => {
  return getBoardDisplayTitle(board, intl);
};
