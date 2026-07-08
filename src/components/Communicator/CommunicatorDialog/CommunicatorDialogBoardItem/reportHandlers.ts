import { UserData } from '../../../../types/app';
import { Board } from '../../../../types/board';

type SetState = (state: Record<string, unknown>) => void;

interface ReportDialogState {
  reportReason: string;
  loading: boolean;
  error: boolean;
  success: boolean;
}

interface ReportHandlerProps {
  boardReport: (reportData: ReportData) => Promise<void>;
  board: Board;
  userData: UserData;
}

interface ReportHandlerState {
  reportDialogState: ReportDialogState;
}

interface ReportedBoardData {
  id: string;
  name: string;
  author: string;
  description: string;
  url: string;
  reason: string;
}

interface Whistleblower {
  name: string;
  email: string;
}

interface ReportData extends ReportedBoardData {
  whistleblower: Whistleblower;
}

export const handleBoardReport = async (
  boardUrl: string,
  props: ReportHandlerProps,
  state: ReportHandlerState,
  setState: SetState,
): Promise<void> => {
  const {
    boardReport,
    board: { id, name, author, description },
    userData: { name: whistleblowerName, email: whistleblowerEmail },
  } = props;
  const { reportDialogState } = state;

  const reportedBoardData: ReportedBoardData = {
    id,
    name,
    author,
    description,
    url: boardUrl,
    reason: reportDialogState.reportReason,
  };

  const whistleblower: Whistleblower = {
    name: whistleblowerName,
    email: whistleblowerEmail,
  };

  const reportData: ReportData = {
    ...reportedBoardData,
    whistleblower,
  };

  setState({
    reportDialogState: { ...reportDialogState, loading: true },
  });
  try {
    await boardReport(reportData);
    setState({
      reportDialogState: {
        ...reportDialogState,
        error: false,
        success: true,
        loading: false,
      },
    });
  } catch (error) {
    setState({
      reportDialogState: {
        ...reportDialogState,
        error: true,
        loading: false,
      },
    });
  }
};
