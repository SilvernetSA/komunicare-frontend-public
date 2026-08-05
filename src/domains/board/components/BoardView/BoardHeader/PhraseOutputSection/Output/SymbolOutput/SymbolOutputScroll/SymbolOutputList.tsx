import ClearIcon from '@mui/icons-material/Clear';
import { IconButton as MUIIconButton } from '@mui/material';
import React from 'react';
import { useIntl } from 'react-intl';

import Symbol from '../../../../../../TileEditor/components/TileEditorContent/Symbol';

import { NavigationSettings } from '@/types/app';

interface SymbolItem {
  image?: string;
  label: string | React.ReactNode;
  type?: 'live' | string;
  [key: string]: unknown;
}

interface SymbolOutputListProps {
  symbols: SymbolItem[];
  navigationSettings: NavigationSettings;
  onWriteSymbol: (
    index: number,
  ) => (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onRemoveClick: (index: number) => (event: React.MouseEvent) => void;
  isScreenKeyboardMode?: boolean;
}

export const SymbolOutputList: React.FC<SymbolOutputListProps> = ({
  symbols,
  navigationSettings,
  onWriteSymbol,
  onRemoveClick,
  isScreenKeyboardMode,
}) => {
  const intl = useIntl();

  const removeButtonStyle: React.CSSProperties = {
    visibility: navigationSettings.removeOutputActive ? 'visible' : 'hidden',
  };

  return (
    <>
      {symbols.map(({ image, label, type }, index) => (
        <div
          className={
            type === 'live' ? 'LiveSymbolOutput__value' : 'SymbolOutput__value'
          }
          key={index}
        >
          <Symbol
            className="SymbolOutput__symbol"
            image={image}
            label={label}
            type={type}
            labelpos="Below"
            onWrite={onWriteSymbol(index)}
            suppressNativeKeyboard={!!isScreenKeyboardMode}
            intl={intl}
          />
          <div className="SymbolOutput__value__IconButton">
            <MUIIconButton
              color="inherit"
              size="small"
              onClick={onRemoveClick(index)}
              disabled={!navigationSettings.removeOutputActive}
              style={removeButtonStyle}
            >
              <ClearIcon />
            </MUIIconButton>
          </div>
        </div>
      ))}
    </>
  );
};
