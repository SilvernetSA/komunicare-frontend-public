import React from 'react';
import { IntlShape } from 'react-intl';

import { EditTilesButton } from './EditToolbarStartGroup/EditTilesButton';
import { FixedBoardToggle } from './EditToolbarStartGroup/FixedBoardToggle';
import { SavingSpinner } from './EditToolbarStartGroup/SavingSpinner';

interface EditToolbarStartGroupProps {
  isSelecting: boolean;
  isSaving: boolean;
  isFixed: boolean;
  onSelectClick?: () => void;
  onBoardTypeChange?: () => void;
  intl: IntlShape;
}

export const EditToolbarStartGroup: React.FC<EditToolbarStartGroupProps> = ({
  isSelecting,
  isSaving,
  isFixed,
  onSelectClick,
  onBoardTypeChange,
  intl,
}) => (
  <div className="EditToolbar__group EditToolbar__group--start">
    <EditTilesButton
      isSelecting={isSelecting}
      isSaving={isSaving}
      onSelectClick={onSelectClick}
      intl={intl}
    />
    <FixedBoardToggle
      isSelecting={isSelecting}
      isFixed={isFixed}
      onBoardTypeChange={onBoardTypeChange}
      intl={intl}
    />
    <SavingSpinner isSaving={isSaving} />
  </div>
);
