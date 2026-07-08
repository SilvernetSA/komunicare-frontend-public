import { Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import React, { useState } from 'react';
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
import DefaultBoardsGallery from '../CommunicatorToolbar/DefaultBoardSelector/DefaultBoardsGallery';

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
  onCreateCommunicator?: () => void;
  changeCommunicator?: (communicatorId: string) => void;
  createCommunicatorCopy?: (systemCommunicatorId: string) => Promise<string>;
  deleteCommunicator?: (communicatorId: string) => void;
}

const CommunicatorDialog: React.FC<CommunicatorDialogProps> = ({
  open = false,
  intl,
  selectedTab = 0,
  loading = false,
  nextPageLoading = false,
  boards = [],
  total: _total = 0,
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
  onCreateCommunicator,
  changeCommunicator,
  createCommunicatorCopy,
  deleteCommunicator,
}) => {
  const [copyDialog, setCopyDialog] = useState<{
    open: boolean;
    systemId: string;
    systemName: string;
    loading: boolean;
  }>({ open: false, systemId: '', systemName: '', loading: false });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    copyId: string;
  }>({ open: false, copyId: '' });

  const handleDeleteCopyClick = (copyId: string) => {
    setDeleteDialog({ open: true, copyId });
  };

  const handleConfirmDelete = () => {
    if (!deleteCommunicator || !deleteDialog.copyId) return;
    deleteCommunicator(deleteDialog.copyId);
    setDeleteDialog({ open: false, copyId: '' });
  };

  const handleOfficialNoCopyClick = (systemId: string, systemName: string) => {
    setCopyDialog({ open: true, systemId, systemName, loading: false });
  };

  const handleConfirmCopy = async () => {
    if (!createCommunicatorCopy || !changeCommunicator) return;
    setCopyDialog((prev) => ({ ...prev, loading: true }));
    try {
      const newId = await createCommunicatorCopy(copyDialog.systemId);
      setCopyDialog({
        open: false,
        systemId: '',
        systemName: '',
        loading: false,
      });
      changeCommunicator(newId);
      onClose();
    } catch {
      setCopyDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCancelCopy = () => {
    setCopyDialog({
      open: false,
      systemId: '',
      systemName: '',
      loading: false,
    });
  };

  const handleCommunicatorClick = (communicatorId: string) => {
    if (!changeCommunicator) return;
    changeCommunicator(communicatorId);
    onClose();
  };

  return (
    <>
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
            onCreateCommunicator={onCreateCommunicator}
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
                  selectedTab === TAB_INDEXES.COMMUNICATOR_BOARDS
                    ? 'is-active'
                    : ''
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
                onClick={(event) =>
                  onTabChange(event, TAB_INDEXES.PUBLIC_BOARDS)
                }
                className={`CommunicatorDialog__tabButton ${
                  selectedTab === TAB_INDEXES.PUBLIC_BOARDS ? 'is-active' : ''
                }`}
                id="CommunicatorDialog__PublicBoardsBtn"
                aria-selected={selectedTab === TAB_INDEXES.PUBLIC_BOARDS}
              >
                {intl
                  ? intl.formatMessage(messages.allBoards)
                  : 'Public Boards'}
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
                  {selectedTab === TAB_INDEXES.COMMUNICATOR_BOARDS && intl && (
                    <DefaultBoardsGallery
                      intl={intl}
                      onOptionClick={handleCommunicatorClick}
                      onClickOfficialNoCopy={
                        createCommunicatorCopy
                          ? handleOfficialNoCopyClick
                          : undefined
                      }
                      onDeleteCopy={
                        deleteCommunicator ? handleDeleteCopyClick : undefined
                      }
                    />
                  )}

                  {selectedTab !== TAB_INDEXES.COMMUNICATOR_BOARDS && (
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
                  )}
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

      <Dialog
        open={copyDialog.open}
        onClose={handleCancelCopy}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Crear copia personal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Se creará una copia personal de{' '}
            <strong>{copyDialog.systemName}</strong> para vos. Podrás editarla
            sin afectar el comunicador oficial.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCopy} disabled={copyDialog.loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmCopy}
            variant="contained"
            disabled={copyDialog.loading}
          >
            {copyDialog.loading ? (
              <CircularProgress size={18} />
            ) : (
              'Crear copia'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, copyId: '' })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Eliminar mi copia</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar tu copia personal de este comunicador? Podrás volver a
            crearla en cualquier momento desde el comunicador oficial.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, copyId: '' })}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CommunicatorDialog;
