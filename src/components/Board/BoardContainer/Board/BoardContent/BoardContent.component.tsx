import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import classNames from 'classnames';
import React from 'react';

import { DisplaySettings, NavigationSettings } from '../../../../../types/app';
import { Tile as TileData, Board as BoardData } from '../../../../../types/board';
import EditGridButtons from '../../../../EditGridButtons/EditGridButtons.component';
import FixedGrid from '../../../../FixedGrid/Grid';
import Grid from '../../../../Grid/Grid';
import { DISPLAY_SIZE_GRID_COLS } from '../../../../Settings/Display/Display.constants';
import messages from '../../../Board.messages';
import EmptyBoard from '../../../EmptyBoard/EmptyBoard.component';
import Symbol from '../../../Symbol/Symbol';
import Tile from '../../../Tile/Tile.component';

const DEFAULT_ROWS_NUMBER = 5;
const DEFAULT_COLUMNS_NUMBER = 5;

interface BoardContentProps {
  board: BoardData;
  intl: {
    formatMessage: (message: { id: string; defaultMessage: string }) => string;
  };
  isSelecting?: boolean;
  isSaving?: boolean;
  isFixedBoard?: boolean;
  selectedTileIds?: string[];
  displaySettings: DisplaySettings;
  navigationSettings: NavigationSettings;
  onTileClick?: (tile: TileData) => void;
  onTileFocus?: (tileId: string) => void;
  onLayoutChange?: (layout: unknown[]) => void;
  onTileDrop?: (
    item: TileData,
    position: { row: number; column: number },
  ) => void;
  onAddRemoveRow?: (isAdd: boolean) => void;
  onAddRemoveColumn?: (isAdd: boolean) => void;
  setIsScroll?: (isScroll: boolean, totalRows?: number) => void;
  boardContainerRef?: React.RefObject<HTMLDivElement>;
  fixedBoardContainerRef?: React.RefObject<HTMLDivElement>;
  onBoardKeyUp?: (event: React.KeyboardEvent) => void;
  canAccessToContent?: boolean;
}

const BoardContent: React.FC<BoardContentProps> = ({
  board,
  intl,
  isSelecting = false,
  isSaving = false,
  isFixedBoard = false,
  selectedTileIds = [],
  displaySettings,
  navigationSettings,
  onTileClick,
  onTileFocus,
  onLayoutChange,
  onTileDrop,
  onAddRemoveRow,
  onAddRemoveColumn,
  setIsScroll,
  boardContainerRef,
  fixedBoardContainerRef,
  onBoardKeyUp,
  canAccessToContent = true,
}) => {
  const renderTileFixedBoard = (tile: TileData) => {
    const isSelected = selectedTileIds.includes(tile.id);
    const isChatBoard = tile.labelKey?.includes('komunicare.chat.');
    const variant = Boolean(tile.loadBoard) ? 'folder' : 'button';

    return (
      <Tile
        backgroundColor={tile.backgroundColor}
        borderColor={tile.borderColor}
        variant={variant}
        {...({
          onClick: () => onTileClick?.(tile),
          onFocus: () => onTileFocus?.(tile.id),
        } as Record<string, unknown>)}
      >
        <Symbol
          image={tile.image}
          keyPath={tile.keyPath}
          label={isChatBoard ? '' : tile.label}
          labelpos={displaySettings.labelPosition}
        />

        {isSelecting && !isSaving && (
          <div className="CheckCircle">
            {isSelected && <CheckCircleIcon className="CheckCircle__icon" />}
          </div>
        )}
      </Tile>
    );
  };

  const cols = DISPLAY_SIZE_GRID_COLS[displaySettings.uiSize];
  const isNavigationButtonsOnTheSide =
    navigationSettings.navigationButtonsStyle === undefined ||
    navigationSettings.navigationButtonsStyle === 'sides';

  if (!canAccessToContent) {
    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          height: '10rem',
        }}
      >
        <div
          style={{
            width: '50%',
            marginTop: '2rem',
          }}
        >
          <Alert variant="filled" severity="info">
            {intl.formatMessage(messages.needSubscribe as any)}.
          </Alert>
        </div>

        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            href="/settings/subscribe"
            color="primary"
            variant="contained"
            style={{ height: '2rem' }}
          >
            {intl.formatMessage(messages.subscribe as any)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="BoardTilesContainer"
      className={classNames('Board__tiles', {
        ScrollButtonsOnTheSides:
          navigationSettings.bigScrollButtonsActive &&
          isNavigationButtonsOnTheSide,
      })}
      style={{ overflowY: 'auto', height: '100%', maxHeight: '100%', scrollbarGutter: 'stable' }}
      onKeyUp={onBoardKeyUp}
      ref={boardContainerRef}
    >
      {!board.isFixed &&
        (board.tiles.length ? (
          <Grid
            edit={isSelecting && !isSaving}
            cols={cols}
            onLayoutChange={onLayoutChange}
            setIsScroll={setIsScroll}
            isBigScrollBtns={navigationSettings.bigScrollButtonsActive}
          >
            {board.tiles.map((tile) => {
              const isSelected = selectedTileIds.includes(tile.id);
              const variant = Boolean(tile.loadBoard) ? 'folder' : 'button';
              const isChatBoard = tile.labelKey?.includes('komunicare.chat.');

              return (
                <Tile
                  key={tile.id}
                  backgroundColor={tile.backgroundColor}
                  borderColor={tile.borderColor}
                  variant={variant}
                  {...({
                    onClick: () => onTileClick?.(tile),
                    onFocus: () => onTileFocus?.(tile.id),
                  } as Record<string, unknown>)}
                >
                  <Symbol
                    image={tile.image}
                    keyPath={tile.keyPath}
                    label={isChatBoard ? '' : tile.label}
                    labelpos={displaySettings.labelPosition}
                  />

                  {isSelecting && !isSaving && (
                    <div className="CheckCircle">
                      {isSelected && (
                        <CheckCircleIcon className="CheckCircle__icon" />
                      )}
                    </div>
                  )}
                </Tile>
              );
            })}
          </Grid>
        ) : (
          <EmptyBoard />
        ))}

      {board.isFixed && (
        <FixedGrid
          order={board.grid ? board.grid.order : []}
          items={board.tiles}
          columns={board.grid ? board.grid.columns : DEFAULT_COLUMNS_NUMBER}
          rows={board.grid ? board.grid.rows : DEFAULT_ROWS_NUMBER}
          compactOrder={board.isFixed || Boolean(board.compactGrid)}
          dragAndDropEnabled={isSelecting}
          renderItem={(item) => renderTileFixedBoard(item)}
          onItemDrop={onTileDrop}
          fixedRef={fixedBoardContainerRef}
          setIsScroll={setIsScroll}
          isBigScrollBtns={navigationSettings.bigScrollButtonsActive}
          isNavigationButtonsOnTheSide={isNavigationButtonsOnTheSide}
        />
      )}

      <EditGridButtons
        active={isFixedBoard && isSelecting && !isSaving}
        columns={board.grid ? board.grid.columns : DEFAULT_COLUMNS_NUMBER}
        rows={board.grid ? board.grid.rows : DEFAULT_ROWS_NUMBER}
        onAddRemoveRow={(action) => onAddRemoveRow?.(action === 'add')}
        onAddRemoveColumn={(action) => onAddRemoveColumn?.(action === 'add')}
        moveColsButtonToLeft={isNavigationButtonsOnTheSide}
      />
    </div>
  );
};

export default BoardContent;
