import { Grid, Typography } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import React from 'react';
import { IntlShape } from 'react-intl';

import DefaultBoardOption from './DefaultBoardOption';
import { DEFAULT_BOARDS } from '../../../../helpers';
import { useCommunicatorsStore } from '../../../../store/communicatorsStore';
import { systemCommunicatorIds } from '../../../../store/communicatorsStore/fetchSystemCommunicatorsFactory';
import { Board } from '../../../../types/board';
import messages from '../CommunicatorToolbar.messages';

interface DefaultBoardsGalleryProps {
  onOptionClick: (defaultBoardName: string) => void;
  intl: IntlShape;
}

const DEFAULT_BOARD_COPY: Record<
  string,
  {
    title: keyof typeof messages;
    description: keyof typeof messages;
  }
> = {
  komunicare: {
    title: 'komunicareBoardTitle',
    description: 'komunicareDescription',
  },
};

const DefaultBoardsGallery: React.FC<DefaultBoardsGalleryProps> = ({
  onOptionClick,
  intl,
}) => {
  const communicators = useCommunicatorsStore((state) => state.communicators);
  const systemCommunicators = communicators.filter((c) =>
    systemCommunicatorIds.has(String(c.id)),
  );

  return (
    <DialogContent>
      <Grid container spacing={2} justifyContent="center">
        {systemCommunicators.map((c) => {
          const staticBoards = DEFAULT_BOARDS[
            c.id as keyof typeof DEFAULT_BOARDS
          ] as Board[] | undefined;
          const boardCopy = DEFAULT_BOARD_COPY[c.id];

          let rootBoard: Board | { name: string; caption?: string } | undefined;
          if (staticBoards && staticBoards.length > 0) {
            rootBoard = staticBoards[0];
          } else if ((c as any).caption) {
            rootBoard = { name: c.name, caption: (c as any).caption };
          }

          if (!rootBoard) {
            rootBoard = { name: c.name };
          }

          const titleText = boardCopy
            ? intl.formatMessage(messages[boardCopy.title])
            : c.name;
          const descriptionText = boardCopy
            ? intl.formatMessage(messages[boardCopy.description])
            : (c as any).description || '';

          return (
            <Grid key={String(c.id)} size={{ xs: 12, sm: 6, md: 4 }}>
              <DefaultBoardOption
                onClick={() => onOptionClick(String(c.id))}
                rootBoard={rootBoard as Board}
                titleText={titleText}
                descriptionText={descriptionText}
                intl={intl}
              />
            </Grid>
          );
        })}
      </Grid>
      <Typography
        variant="body2"
        align="center"
        sx={{ mt: 3, color: 'text.secondary', fontStyle: 'italic' }}
      >
        Próximamente más
      </Typography>
    </DialogContent>
  );
};

export interface CustomBoardsGalleryProps {
  boards: Board[];
  intl: IntlShape;
  onBoardClick: (boardId: string) => void;
  showIncludedOption?: boolean;
  onIncludedOptionClick?: () => void;
}

export const CustomBoardsGallery: React.FC<CustomBoardsGalleryProps> = ({
  boards,
  intl,
  onBoardClick,
  showIncludedOption = false,
  onIncludedOptionClick,
}) => {
  const customBoardPreview = boards[0] || DEFAULT_BOARDS.komunicare[0];

  if (!boards.length && !showIncludedOption) {
    return (
      <DialogContent>
        <Typography variant="body1">
          {intl.formatMessage(messages.noCustomBoardsAvailable)}
        </Typography>
      </DialogContent>
    );
  }

  return (
    <DialogContent>
      <Grid container spacing={2}>
        {boards.map((board) => (
          <Grid key={board.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <DefaultBoardOption
              onClick={() => onBoardClick(board.id)}
              rootBoard={board}
              descriptionText={intl.formatMessage(messages.customBoardTiles, {
                qty: board.tiles?.length || 0,
              })}
              intl={intl}
            />
          </Grid>
        ))}
        {showIncludedOption && (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <DefaultBoardOption
              onClick={() => onIncludedOptionClick?.()}
              rootBoard={{
                ...customBoardPreview,
                name: intl.formatMessage(messages.includedBoardsOption),
                description: '',
              }}
              descriptionText={intl.formatMessage(
                messages.includedBoardsOptionDescription,
              )}
              intl={intl}
            />
          </Grid>
        )}
      </Grid>
    </DialogContent>
  );
};

export default DefaultBoardsGallery;
