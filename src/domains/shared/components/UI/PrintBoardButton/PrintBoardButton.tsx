import PrintBoardIcon from '@mui/icons-material/Print';
import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';

import IconButton from '../IconButton/IconButton';
import PrintBoardDialog from './components/PrintBoardDialog';
import messages from './PrintBoardButton.messages';
import { useBoardsStore } from '@/domains/board/stores/boardsStore';
import { useNotificationStore } from '@/domains/notifications/stores/notificationStore';

interface PrintBoardButtonProps {
  disabled?: boolean;
}

const PrintBoardButton: React.FC<PrintBoardButtonProps> = ({ disabled }) => {
  const intl = useIntl();
  const boardData = useBoardsStore((state) => state);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exportHelpers, setExportHelpers] = useState<{
    pdfExportAdapter: (boards: unknown[], intl: unknown) => Promise<void>;
  } | null>(null);

  useEffect(() => {
    const loadExportHelpers = async (): Promise<void> => {
      try {
        const helpers = await import('@/domains/settings/components/Settings/Export/Export.helpers');
        setExportHelpers(helpers);
      } catch (error) {
        console.error('Error loading export helpers', error);
      }
    };

    void loadExportHelpers();
  }, []);

  const onPrintCurrentBoard = async () => {
    setLoading(true);
    try {
      if (!exportHelpers) return;

      const currentBoard = boardData.boards.find(
        (board: { id: string }) => board.id === boardData.activeBoardId,
      );

      if (!currentBoard) return;

      const { pdfExportAdapter } = exportHelpers;
      await pdfExportAdapter([currentBoard], intl);
      useNotificationStore
        .getState()
        .showNotification(intl.formatMessage(messages.boardDownloaded));
    } catch (error) {
      console.error('Error printing current board', error);
    } finally {
      setLoading(false);
    }
  };

  const label = intl.formatMessage(messages.printBoard);

  return (
    <div>
      <IconButton
        label={label}
        disabled={disabled}
        onClick={() => setOpenDialog(true)}
        size="large"
      >
        <PrintBoardIcon />
      </IconButton>

      <PrintBoardDialog
        title={label}
        loading={loading}
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onPrintCurrentBoard={onPrintCurrentBoard}
      />
    </div>
  );
};

export default PrintBoardButton;
