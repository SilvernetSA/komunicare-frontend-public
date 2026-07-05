import { Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import React from 'react';
import { IntlShape, FormattedMessage } from 'react-intl';

import { TAB_INDEXES } from './CommunicatorDialog.constants';
import messages from './CommunicatorDialog.messages';
import CommunicatorDialogBoardItem from './CommunicatorDialogBoardItem.component';
import './CommunicatorDialog.css';
import CommunicatorDialogButtons from './CommunicatorDialogButtons.component';
import CommunicatorDialogTour from './CommunicatorDialogTour.component';
import { UserData } from '../../../types/app';
import { Board } from '../../../types/board';
import FullScreenDialog from '../../UI/FullScreenDialog/FullScreenDialog';
import { FullScreenDialogContent } from '../../UI/FullScreenDialog/FullScreenDialogContent';

interface Communicator {
  id: string;
  name?: string;
  boards: string[];
  [key: string]: unknown;
}

interface CommunicatorTour {
  [key: string]: unknown;
}

interface CommunicatorDialogProps {
  open?: boolean;
  intl?: IntlShape;
  selectedTab?: number;
  loading?: boolean;
  nextPageLoading?: boolean;
  boards?: Board[];
  total?: number;
  limit?: number;
  page?: number;
  totalPages?: number;
  userData?: UserData | null;
  communicatorBoardsIds?: string[];
  communicator?: Communicator;
  communicators?: Communicator[];
  activeBoardId?: string;
  search?: string;
  isSearchOpen?: boolean;
  loadNextPage?: () => void;
  onClose?: () => void;
  onTabChange?: (event: React.SyntheticEvent, newValue: number) => void;
  onSearch?: (searchValue: string) => void;
  openSearchBar?: () => void;
  addOrRemoveBoard: (board: Board) => void;
  copyBoard: (board: Board) => void;
  deleteMyBoard: (board: Board) => void;
  updateMyBoard: (board: Board) => void;
  setRootBoard: (board: Board) => void;
  publishBoard: (board: Board) => void;
  boardReport: (reportData: Record<string, unknown>) => Promise<void>;
  dark?: boolean;
  communicatorTour: CommunicatorTour;
  disableTour: () => void;
}

const CommunicatorDialog: React.FC<CommunicatorDialogProps> = ({
  open = false,
  intl,
  selectedTab = 0,
  loading = false,
  nextPageLoading = false,
  boards = [],
  total = 0,
  limit = 10,
  page = 1,
  totalPages = 1,
  userData = null,
  communicatorBoardsIds = [],
  communicator,
  activeBoardId,
  search,
  isSearchOpen,
  loadNextPage = () => {},
  onClose = () => {},
  onTabChange = () => {},
  onSearch = () => {},
  openSearchBar,
  addOrRemoveBoard,
  copyBoard,
  deleteMyBoard,
  updateMyBoard,
  setRootBoard,
  publishBoard,
  boardReport,
  dark = false,
  communicatorTour,
  disableTour,
}) => (
  <FullScreenDialog
    disableSubmit={true}
    fullWidth
    open={open}
    title={
      communicator?.name ||
      (intl ? intl.formatMessage(messages.title) : 'Dialog')
    }
    onClose={onClose}
    buttons={
      <CommunicatorDialogButtons
        intl={intl}
        onSearch={onSearch}
        openSearchBar={openSearchBar}
        isSearchOpen={isSearchOpen}
        searchValue={search}
        dark={dark}
      />
    }
  >
    <Paper className={dark ? 'is-dark' : ''}>
      <FullScreenDialogContent className="CommunicatorDialog__container">
        <div className="CommunicatorDialog__tabs" role="tablist">
          <Button
            color="inherit"
            onClick={(event) =>
              onTabChange(event, TAB_INDEXES.COMMUNICATOR_BOARDS)
            }
            className={`CommunicatorDialog__tabButton ${
              selectedTab === TAB_INDEXES.COMMUNICATOR_BOARDS ? 'is-active' : ''
            }`}
            id="CommunicatorDialog__BoardBtn"
            aria-selected={selectedTab === TAB_INDEXES.COMMUNICATOR_BOARDS}
          >
            {intl
              ? intl.formatMessage(messages.communicatorBoards)
              : 'Communicator'}
          </Button>
          <Button
            color="inherit"
            onClick={(event) => onTabChange(event, TAB_INDEXES.PUBLIC_BOARDS)}
            className={`CommunicatorDialog__tabButton ${
              selectedTab === TAB_INDEXES.PUBLIC_BOARDS ? 'is-active' : ''
            }`}
            id="CommunicatorDialog__PublicBoardsBtn"
            aria-selected={selectedTab === TAB_INDEXES.PUBLIC_BOARDS}
          >
            {intl ? intl.formatMessage(messages.allBoards) : 'Public Boards'}
          </Button>
          <Button
            color="inherit"
            disabled={!userData?.authToken}
            onClick={(event) => onTabChange(event, TAB_INDEXES.MY_BOARDS)}
            className={`CommunicatorDialog__tabButton ${
              selectedTab === TAB_INDEXES.MY_BOARDS ? 'is-active' : ''
            }`}
            id="CommunicatorDialog__AllMyBoardsBtn"
            aria-selected={selectedTab === TAB_INDEXES.MY_BOARDS}
          >
            {intl ? intl.formatMessage(messages.myBoards) : 'My Boards'}
          </Button>
        </div>

        <div className="CommunicatorDialog__content">
          {!loading && (
            <React.Fragment>
              {selectedTab === TAB_INDEXES.COMMUNICATOR_BOARDS && (
                <div className="CommunicatorDialog__communicatorData">
                  <div className="CommunicatorDialog__communicatorData__boardsQty">
                    {intl
                      ? intl.formatMessage(messages.communicatorsQty, {
                          qty: total,
                        })
                      : `${total} communicators`}
                  </div>
                </div>
              )}

              <div className="CommunicatorDialog__boards">
                {!boards.length && (
                  <div className="CommunicatorDialog__boards__emptyMessage">
                    <FormattedMessage {...messages.emptyBoardsList} />
                  </div>
                )}

                {boards.slice(0, limit).map((board, i) => (
                  <CommunicatorDialogBoardItem
                    key={i}
                    board={board}
                    intl={intl}
                    selectedTab={selectedTab}
                    addOrRemoveBoard={addOrRemoveBoard}
                    copyBoard={copyBoard}
                    deleteMyBoard={deleteMyBoard}
                    updateMyBoard={updateMyBoard}
                    publishBoard={publishBoard}
                    setRootBoard={setRootBoard}
                    boardReport={boardReport}
                    selectedIds={communicatorBoardsIds}
                    userData={userData}
                    communicator={communicator as any}
                    activeBoardId={activeBoardId}
                  />
                ))}

                <CommunicatorDialogTour
                  communicatorTour={communicatorTour}
                  selectedTab={selectedTab}
                  disableTour={disableTour}
                  intl={intl}
                />

                {page < totalPages && (
                  <Button color="primary" onClick={loadNextPage}>
                    <FormattedMessage {...messages.loadNextPage} />
                  </Button>
                )}

                {nextPageLoading && (
                  <CircularProgress
                    size={35}
                    className="CommunicatorDialog__spinner"
                    thickness={7}
                  />
                )}
              </div>
            </React.Fragment>
          )}

          {loading && (
            <CircularProgress
              size={35}
              className="CommunicatorDialog__spinner"
              thickness={7}
            />
          )}
        </div>
      </FullScreenDialogContent>
    </Paper>
  </FullScreenDialog>
);

export default CommunicatorDialog;
