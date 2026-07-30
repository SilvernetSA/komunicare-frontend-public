import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';

import { useAppStore } from '@/domains/app/stores/appStore';

interface BoardToolbarProps {
  boardName: string;
  isEditMode: boolean;
  onToggleEdit: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onAddTile?: () => void;
  onSettings?: () => void;
  hasChanges?: boolean;
}

const BoardToolbar: React.FC<BoardToolbarProps> = ({
  boardName,
  isEditMode,
  onToggleEdit,
  onSave,
  onCancel,
  onAddTile,
  onSettings,
  hasChanges = false,
}) => {
  const userData = useAppStore((s) => s.userData);
  const isLoggedIn = !!(userData as any)?.email;

  return (
    <Toolbar className="Board__Toolbar">
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        {boardName}
      </Typography>

      {isLoggedIn && (
        <>
          {!isEditMode ? (
            <>
              <IconButton onClick={onToggleEdit} color="primary">
                <EditIcon />
              </IconButton>
              {onSettings && (
                <IconButton onClick={onSettings}>
                  <SettingsIcon />
                </IconButton>
              )}
            </>
          ) : (
            <>
              {onAddTile && (
                <IconButton onClick={onAddTile} color="primary">
                  <AddIcon />
                </IconButton>
              )}
              {onCancel && (
                <IconButton onClick={onCancel}>
                  <CancelIcon />
                </IconButton>
              )}
              {onSave && (
                <IconButton
                  onClick={onSave}
                  color="primary"
                  disabled={!hasChanges}
                >
                  <SaveIcon />
                </IconButton>
              )}
            </>
          )}
        </>
      )}
    </Toolbar>
  );
};

export default BoardToolbar;
