import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Grid, IconButton, Typography } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import React from 'react';
import { IntlShape } from 'react-intl';

import DefaultBoardOption from './DefaultBoardOption';
import { DEFAULT_BOARDS } from '@/helpers';
import { useCommunicatorsStore } from '@/domains/communicator/stores/communicatorsStore';
import { systemCommunicatorIds } from '@/domains/communicator/stores/communicatorsStore/fetchSystemCommunicatorsFactory';
import { Board } from '@/types/board';
import messages from '../CommunicatorToolbar.messages';

interface DefaultBoardsGalleryProps {
  onOptionClick: (defaultBoardName: string) => void;
  intl: IntlShape;
  onClickOfficialNoCopy?: (
    systemCommunicatorId: string,
    systemCommunicatorName: string,
  ) => void;
  onDeleteCopy?: (copyId: string) => void;
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

const isCopyOfOfficial = (c: any): boolean => {
  const copySource = String(c.copySource || '').trim();
  const copySourceCommunicatorId = String(
    c.copySourceCommunicatorId || '',
  ).trim();
  return copySource.length > 0 || copySourceCommunicatorId.length > 0;
};

const DefaultBoardsGallery: React.FC<DefaultBoardsGalleryProps> = ({
  onOptionClick,
  intl,
  onClickOfficialNoCopy,
  onDeleteCopy,
}) => {
  const communicators = useCommunicatorsStore((state) => state.communicators);

  // Deduplicate system communicators by rootBoard.
  // Prefer the one with a DEFAULT_BOARDS image for display; track all IDs for copy lookup.
  const systemCommunicatorsByRootBoard = new Map<
    string,
    { comm: (typeof communicators)[0]; alternateIds: string[] }
  >();
  communicators
    .filter((c) => systemCommunicatorIds.has(String(c.id)))
    .forEach((c) => {
      const rootKey = String(c.rootBoard || c.id);
      const existing = systemCommunicatorsByRootBoard.get(rootKey);
      if (!existing) {
        systemCommunicatorsByRootBoard.set(rootKey, {
          comm: c,
          alternateIds: [],
        });
      } else {
        // Prefer the one with a static image entry; track alternate ID for copy matching
        const hasStaticImage =
          !!DEFAULT_BOARDS[String(c.id) as keyof typeof DEFAULT_BOARDS];
        const existingHasStaticImage =
          !!DEFAULT_BOARDS[
            String(existing.comm.id) as keyof typeof DEFAULT_BOARDS
          ];
        if (hasStaticImage && !existingHasStaticImage) {
          systemCommunicatorsByRootBoard.set(rootKey, {
            comm: c,
            alternateIds: [String(existing.comm.id), ...existing.alternateIds],
          });
        } else {
          existing.alternateIds.push(String(c.id));
        }
      }
    });

  const deduplicatedSystemCommunicators = Array.from(
    systemCommunicatorsByRootBoard.values(),
  );

  // Build lookup: systemCommunicatorId or copySource string -> user's personal copy
  const userCopiesBySourceId = new Map<string, (typeof communicators)[0]>();
  communicators.forEach((c) => {
    if (systemCommunicatorIds.has(String(c.id))) return;
    const srcId = String((c as any).copySourceCommunicatorId || '').trim();
    const srcName = String((c as any).copySource || '').trim();
    // Set BOTH keys so we match either the MongoDB ID or the string alias
    if (srcId) userCopiesBySourceId.set(srcId, c);
    if (srcName) userCopiesBySourceId.set(srcName, c);
  });

  const userCommunicators = communicators.filter(
    (c) =>
      !systemCommunicatorIds.has(String(c.id)) &&
      !isCopyOfOfficial(c) &&
      c.email &&
      c.id,
  );

  return (
    <DialogContent>
      <Grid container spacing={2} justifyContent="center">
        {deduplicatedSystemCommunicators.map(({ comm: c, alternateIds }) => {
          // Find user copy by the primary ID, alternate IDs, or rootBoard alias
          const userCopy =
            userCopiesBySourceId.get(String(c.id)) ||
            alternateIds.reduce<(typeof communicators)[0] | undefined>(
              (found, altId) => found || userCopiesBySourceId.get(altId),
              undefined,
            ) ||
            (c.rootBoard ? userCopiesBySourceId.get(c.rootBoard) : undefined);

          const staticBoards = DEFAULT_BOARDS[
            c.id as keyof typeof DEFAULT_BOARDS
          ] as Board[] | undefined;
          const boardCopy = DEFAULT_BOARD_COPY[c.id];

          let rootBoard: Board | { name: string; caption?: string } | undefined;
          if (staticBoards && staticBoards.length > 0) {
            rootBoard = staticBoards[0];
          } else if (userCopy && (userCopy as any).caption) {
            rootBoard = {
              name: userCopy.name || c.name,
              caption: (userCopy as any).caption,
            };
          } else if ((c as any).caption) {
            rootBoard = { name: c.name, caption: (c as any).caption };
          }

          if (!rootBoard) {
            rootBoard = { name: userCopy ? userCopy.name || c.name : c.name };
          }

          const titleText = userCopy
            ? userCopy.name || c.name
            : boardCopy
              ? intl.formatMessage(messages[boardCopy.title])
              : c.name;

          const descriptionText = userCopy
            ? (userCopy as any).description || (c as any).description || ''
            : boardCopy
              ? intl.formatMessage(messages[boardCopy.description])
              : (c as any).description || '';

          const handleClick = () => {
            if (userCopy) {
              onOptionClick(String(userCopy.id));
            } else if (onClickOfficialNoCopy) {
              onClickOfficialNoCopy(String(c.id), c.name || '');
            } else {
              onOptionClick(String(c.id));
            }
          };

          return (
            <Grid key={String(c.id)} size={{ xs: 12, sm: 6, md: 4 }}>
              <div style={{ position: 'relative' }}>
                <DefaultBoardOption
                  onClick={handleClick}
                  rootBoard={rootBoard as Board}
                  titleText={titleText}
                  descriptionText={descriptionText}
                  intl={intl}
                  isOfficial={!userCopy}
                  isUserCopy={!!userCopy}
                />
                {userCopy && onDeleteCopy && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCopy(String(userCopy.id));
                    }}
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      '&:hover': {
                        backgroundColor: '#ffebee',
                        color: '#d32f2f',
                      },
                    }}
                    title="Eliminar mi copia"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                )}
              </div>
            </Grid>
          );
        })}

        {userCommunicators.map((c) => {
          const rootBoard: Board | { name: string; caption?: string } = {
            name: c.name || 'My Communicator',
            caption: (c as any).caption,
          };

          return (
            <Grid key={String(c.id)} size={{ xs: 12, sm: 6, md: 4 }}>
              <DefaultBoardOption
                onClick={() => onOptionClick(String(c.id))}
                rootBoard={rootBoard as Board}
                titleText={c.name || 'My Communicator'}
                descriptionText={(c as any).description || ''}
                intl={intl}
              />
            </Grid>
          );
        })}
      </Grid>
      {!userCommunicators.length && (
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 3, color: 'text.secondary', fontStyle: 'italic' }}
        >
          Próximamente más
        </Typography>
      )}
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
  const customBoardPreview: Board = boards[0] ?? ({} as Board);

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
