import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/Flag';
import { Board } from '../../../../types/board';

interface ReportDialogState {
  openBoardReport: boolean;
  reportReason: string;
  loading: boolean;
  error: boolean;
  success: boolean;
}

interface ReportBoardDialogProps {
  reportDialogState: ReportDialogState;
  board: Board;
  intl?: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  messages: Record<string, { id: string; defaultMessage: string }>;
  onClose: () => void;
  onReportReasonChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmitReport: (boardUrl: string) => void;
  boardUrl: string;
}

const ReportBoardDialog: React.FC<ReportBoardDialogProps> = ({
  reportDialogState,
  board,
  intl,
  messages,
  onClose,
  onReportReasonChange,
  onSubmitReport,
  boardUrl,
}) => {
  const ReportSuccessContent = (
    <>
      <DialogContent>
        <div className="CommunicatorDialog__board-report-success">
          <CheckCircleIcon
            className="CommunicatorDialog__board-report-success-icon"
            color="primary"
          />
          <DialogContentText>
            {intl
              ? intl.formatMessage(messages.boardReportSuccesSubtitle)
              : 'Report submitted successfully'}
            <br />
            {intl
              ? intl.formatMessage(messages.boardReportSuccesGratitude)
              : 'Thank you'}
          </DialogContentText>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          {intl ? intl.formatMessage(messages.boardReportClose) : 'Close'}
        </Button>
      </DialogActions>
    </>
  );

  const ReportingContent = (
    <>
      <DialogContent>
        <DialogContentText>
          {intl
            ? intl.formatMessage(messages.boardReportContentSubtitle)
            : 'Report this board'}
          <br />
          <br />
          {intl ? intl.formatMessage(messages.boardInfoName) : 'Name'}
          <br />
          <b>{board.name}</b>
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="report-reason"
          label="Report reason"
          multiline={true}
          minRows={1}
          required={true}
          type="text"
          fullWidth
          onChange={onReportReasonChange}
        />
        {reportDialogState.error && (
          <div style={{ color: '#f44336' }}>
            <Typography color="inherit">
              {intl
                ? intl.formatMessage(messages.boardReportError)
                : 'Error submitting report'}
            </Typography>
          </div>
        )}

        {reportDialogState.loading && (
          <LinearProgress style={{ margin: '1em' }} />
        )}
      </DialogContent>

      {!reportDialogState.loading && (
        <DialogActions>
          <Button onClick={onClose} variant="contained">
            {intl ? intl.formatMessage(messages.boardReportCancel) : 'Cancel'}
          </Button>

          <Button
            onClick={() => onSubmitReport(boardUrl)}
            variant="contained"
            color="primary"
            disabled={!reportDialogState.reportReason}
          >
            {intl ? intl.formatMessage(messages.boardReportSend) : 'Send'}
          </Button>
        </DialogActions>
      )}
    </>
  );

  return (
    <Dialog
      open={reportDialogState.openBoardReport}
      onClose={onClose}
      aria-labelledby="board-reoport-title"
    >
      {reportDialogState.openBoardReport && (
        <>
          <DialogTitle id="form-dialog-title">
            <div className="CommunicatorDialog__board-report-dialog-title">
              {intl ? intl.formatMessage(messages.boardReport) : 'Report Board'}
              <FlagIcon fontSize="large" />
            </div>
          </DialogTitle>
          <div className="CommunicatorDialog__board-report-dialog">
            {reportDialogState.success
              ? ReportSuccessContent
              : ReportingContent}
          </div>
        </>
      )}
    </Dialog>
  );
};

export default ReportBoardDialog;
