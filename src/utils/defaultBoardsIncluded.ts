import { DEFAULT_BOARDS } from '../helpers';
import { Board } from '../types/board';
import { Communicator, DefaultBoardIncluded } from '../types/communicator';

const FIXED_DEFAULT_BOARD_NAMES = ['komunicare'] as const;
const CUSTOM_DEFAULT_BOARD_NAME = 'custom';

const getDefaultBoardCollection = (boardName: string): Board[] => {
  return (
    (DEFAULT_BOARDS as unknown as Record<string, Board[]>)[boardName] || []
  );
};

export const getCanonicalDefaultBoardHomeId = (boardName: string): string => {
  return getDefaultBoardCollection(boardName)[0]?.id || '';
};

export const getCanonicalDefaultBoardsIncluded = (): DefaultBoardIncluded[] => {
  return FIXED_DEFAULT_BOARD_NAMES.map((nameOnJSON) => ({
    nameOnJSON,
    homeBoard: getCanonicalDefaultBoardHomeId(nameOnJSON),
  })).filter(({ homeBoard }) => Boolean(homeBoard));
};

export const normalizeDefaultBoardsIncluded = (
  defaultBoardsIncluded?: DefaultBoardIncluded[],
): DefaultBoardIncluded[] => {
  const customEntry = defaultBoardsIncluded
    ?.filter(
      (entry): entry is DefaultBoardIncluded =>
        entry?.nameOnJSON === CUSTOM_DEFAULT_BOARD_NAME &&
        typeof entry.homeBoard === 'string' &&
        Boolean(entry.homeBoard),
    )
    .slice(-1);

  return [...getCanonicalDefaultBoardsIncluded(), ...(customEntry || [])];
};

export const normalizeCommunicatorDefaultBoardsIncluded = (
  communicator: Communicator,
): Communicator => {
  return {
    ...communicator,
    defaultBoardsIncluded: normalizeDefaultBoardsIncluded(
      communicator.defaultBoardsIncluded,
    ),
  };
};
