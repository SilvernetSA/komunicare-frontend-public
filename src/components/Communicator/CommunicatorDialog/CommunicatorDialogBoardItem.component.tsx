import React, { useState } from 'react';

import { TAB_INDEXES } from './CommunicatorDialog.constants';
import messages from './CommunicatorDialog.messages';
import BoardActionsSection from './CommunicatorDialogBoardItem/BoardActionsSection';
import BoardDataSection from './CommunicatorDialogBoardItem/BoardDataSection';
import BoardEditTitleDialog from './CommunicatorDialogBoardItem/BoardEditTitleDialog';
import {
  handleBoardPublishOpen,
  handleBoardCopy,
  handleBoardDelete,
  handleBoardPublish,
} from './CommunicatorDialogBoardItem/boardHandlers';
import BoardImageDialog from './CommunicatorDialogBoardItem/BoardImageDialog';
import BoardImageSection from './CommunicatorDialogBoardItem/BoardImageSection';
import {
  getBoardUrl,
  getBoardCaption,
  getImageBoard,
  shouldDisplayActions,
  getTitle,
} from './CommunicatorDialogBoardItem/boardUtils';
import {
  handleBoardDescriptionChange,
  handleBoardTitleChange,
  handleBoardTitleDesc,
} from './CommunicatorDialogBoardItem/formHandlers';
import {
  handleSymbolSearchChange,
  handleBoardImage,
} from './CommunicatorDialogBoardItem/imageHandlers';
import { handleBoardReport } from './CommunicatorDialogBoardItem/reportHandlers';
import { useCommunicatorsStore } from '../../../store/communicatorsStore';
import { Board } from '../../../types/board';
import SymbolSearch from '../../Board/SymbolSearch/SymbolSearch';

const COPY_SOURCE_LABELS: Record<string, string> = {
  komunicare: 'Komunicare',
};

interface ReportDialogState {
  openBoardReport: boolean;
  reportReason: string;
  loading: boolean;
  error: boolean;
  success: boolean;
}

interface ComponentState {
  loading: boolean;
  reportDialogState: ReportDialogState;
  openBoardInfo: boolean;
  openDeleteBoard: boolean;
  openPublishBoard: boolean;
  openCopyBoard: boolean;
  openImageBoard: boolean;
  openEditBoardTitle: boolean;
  imageBoard: { image?: string } | null;
  isSymbolSearchOpen: boolean;
  editBoardTitleDialogValue: string;
  editBoardDescriptionDialogValue: string;
}

interface Props {
  intl: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  communicator: { id: string; rootBoard: string; boards: string[] };
  activeBoardId: string;
  selectedTab: number;
  board: Board;
  userData: { email?: string; authToken?: string };
  copyBoard: (board: Board) => void;
  addOrRemoveBoard: (board: Board) => void;
  deleteMyBoard: (board: Board) => void;
  updateMyBoard: (board: Board) => void;
  publishBoard: (board: Board) => void;
  boardReport: (reportData: Record<string, unknown>) => Promise<void>;
  setRootBoard: (board: Board) => void;
  selectedIds?: string[];
}

const defaultReportDialogState: ReportDialogState = {
  openBoardReport: false,
  reportReason: '',
  loading: false,
  error: false,
  success: false,
};

const CommunicatorDialogBoardItem: React.FC<Props> = ({
  board,
  selectedTab,
  intl,
  userData,
  communicator,
  activeBoardId,
  addOrRemoveBoard,
  copyBoard,
  deleteMyBoard,
  updateMyBoard,
  publishBoard,
  boardReport,
  setRootBoard: setRootBoardProp,
}) => {
  const [state, setState] = useState<ComponentState>({
    loading: false,
    reportDialogState: defaultReportDialogState,
    openBoardInfo: false,
    openDeleteBoard: false,
    openPublishBoard: false,
    openCopyBoard: false,
    openImageBoard: false,
    openEditBoardTitle: false,
    imageBoard: null,
    isSymbolSearchOpen: false,
    editBoardTitleDialogValue: board.name,
    editBoardDescriptionDialogValue: board.description || '',
  });

  const handleBoardReportClick = async (boardUrl: string) => {
    await handleBoardReport(
      boardUrl,
      { boardReport: boardReport as any, board, userData: userData as any },
      state as any,
      setState as any,
    );
  };

  const closeItemDialogs = () => {
    setState((prev) => ({
      ...prev,
      reportDialogState: defaultReportDialogState,
      openBoardInfo: false,
      openCopyBoard: false,
      openDeleteBoard: false,
      openPublishBoard: false,
      openEditBoardTitle: false,
      openImageBoard: false,
    }));
  };

  const { reportDialogState } = state;
  const rawTitle = getTitle(board, intl as any);
  const allCommunicators = useCommunicatorsStore((s) => s.communicators);
  const owningCommunicator =
    selectedTab !== TAB_INDEXES.PUBLIC_BOARDS
      ? allCommunicators.find((c) => c.rootBoard === board.id)
      : undefined;
  const communicatorLabel = owningCommunicator
    ? COPY_SOURCE_LABELS[(owningCommunicator as any).copySource] ||
      owningCommunicator.name
    : undefined;
  const title = communicatorLabel || rawTitle;
  const boardUrl = getBoardUrl(board);
  const displayActions = shouldDisplayActions(selectedTab, userData as any);
  const boardCaption = getBoardCaption(board);
  const imageBoard = getImageBoard(state.imageBoard as any);

  return (
    <div className="CommunicatorDialog__boards__item">
      <BoardImageSection
        boardCaption={boardCaption}
        title={title}
        selectedTab={selectedTab}
        onImageEditClick={() =>
          setState((prev) => ({ ...prev, openImageBoard: true }))
        }
      />
      <BoardImageDialog
        open={state.openImageBoard}
        board={board}
        imageBoard={imageBoard}
        intl={intl}
        messages={messages}
        onClose={closeItemDialogs}
        onImageChange={(image: { image?: string }) =>
          setState((prev) => ({ ...prev, imageBoard: image as any }))
        }
        onSymbolSearchClick={() =>
          setState((prev) => ({ ...prev, isSymbolSearchOpen: true }))
        }
        onAccept={() =>
          handleBoardImage(board, state as any, setState as any, updateMyBoard)
        }
      />
      <BoardDataSection
        title={title}
        board={board}
        selectedTab={selectedTab}
        intl={intl}
        messages={messages}
        communicator={communicator as any}
        activeBoardId={activeBoardId}
        onEditTitleClick={() =>
          setState((prev) => ({ ...prev, openEditBoardTitle: true }))
        }
      />
      <BoardEditTitleDialog
        open={state.openEditBoardTitle}
        titleValue={state.editBoardTitleDialogValue}
        descriptionValue={state.editBoardDescriptionDialogValue}
        intl={intl}
        messages={messages}
        onClose={closeItemDialogs}
        onTitleChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          handleBoardTitleChange(event, setState as any)
        }
        onDescriptionChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          handleBoardDescriptionChange(event, setState as any)
        }
        onAccept={() =>
          handleBoardTitleDesc(
            board,
            state as any,
            setState as any,
            updateMyBoard,
          )
        }
      />
      <BoardActionsSection
        loading={state.loading}
        displayActions={displayActions}
        selectedTab={selectedTab}
        communicator={communicator}
        board={board}
        userData={userData}
        activeBoardId={activeBoardId}
        intl={intl}
        messages={messages}
        boardUrl={boardUrl}
        reportDialogState={reportDialogState}
        openBoardInfo={state.openBoardInfo}
        openCopyBoard={state.openCopyBoard}
        openPublishBoard={state.openPublishBoard}
        openDeleteBoard={state.openDeleteBoard}
        editBoardDescriptionDialogValue={state.editBoardDescriptionDialogValue}
        addOrRemoveBoard={addOrRemoveBoard}
        setRootBoard={() => setRootBoardProp(board)}
        onBoardCopyOpen={() =>
          setState((prev) => ({ ...prev, openCopyBoard: true }))
        }
        onBoardInfoOpen={() =>
          setState((prev) => ({ ...prev, openBoardInfo: true }))
        }
        onBoardReportOpen={() =>
          setState((prev) => ({
            ...prev,
            reportDialogState: {
              ...state.reportDialogState,
              openBoardReport: true,
            },
          }))
        }
        onBoardPublishOpen={() =>
          handleBoardPublishOpen(
            board,
            state as any,
            setState as any,
            publishBoard,
          )
        }
        onBoardDeleteOpen={() =>
          setState((prev) => ({ ...prev, openDeleteBoard: true }))
        }
        onDialogClose={closeItemDialogs}
        onReportReasonChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setState((prev) => ({
            ...prev,
            reportDialogState: {
              ...reportDialogState,
              reportReason: event.target.value,
            },
          }))
        }
        onBoardReport={handleBoardReportClick}
        onBoardCopy={() => handleBoardCopy(board, setState as any, copyBoard)}
        onBoardPublish={() =>
          handleBoardPublish(
            board,
            state as any,
            setState as any,
            updateMyBoard,
            publishBoard,
          )
        }
        onBoardDelete={() =>
          handleBoardDelete(board, setState as any, deleteMyBoard)
        }
        onBoardDescriptionChange={(
          event: React.ChangeEvent<HTMLInputElement>,
        ) => handleBoardDescriptionChange(event, setState as any)}
      />
      <SymbolSearch
        open={state.isSymbolSearchOpen}
        onChange={({ image }: { image: { image?: string } }) =>
          handleSymbolSearchChange({ image } as any, setState as any)
        }
        onClose={() =>
          setState((prev) => ({ ...prev, isSymbolSearchOpen: false }))
        }
        autoFill=""
      />
    </div>
  );
};

export default CommunicatorDialogBoardItem;
