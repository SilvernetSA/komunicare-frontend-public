import { useMemo } from 'react';
import { IntlShape } from 'react-intl';

import { Board as BoardModel } from '@/types/board';

function translateBoard(
  board: BoardModel | null,
  intl: IntlShape,
): (BoardModel & { name: string }) | null {
  if (!board) {
    return null;
  }

  let name: string;
  let nameFromKey: string | undefined;

  if (board.nameKey) {
    const nameKeyArray = board.nameKey.split('.');
    nameFromKey = nameKeyArray[nameKeyArray.length - 1];
  }

  const resolveMessage = (id?: string): string | undefined => {
    if (!id || !intl.messages) return undefined;
    if (intl.messages[id]) return intl.formatMessage({ id });

    const lower = id.toLowerCase();
    if (intl.messages[lower]) return intl.formatMessage({ id: lower });

    const fixedKomuni = id.replace('komunicate', 'komunicare');
    if (fixedKomuni !== id && intl.messages[fixedKomuni]) {
      return intl.formatMessage({ id: fixedKomuni });
    }

    const parts = id.split('.');
    const last = parts.pop();
    if (last) {
      const camelLast = last.replace(/(?:_|-|\s)+(.)/g, (_match, char) =>
        char.toUpperCase(),
      );
      const candidate = parts
        .concat(camelLast.charAt(0).toLowerCase() + camelLast.slice(1))
        .join('.');
      if (intl.messages[candidate]) {
        return intl.formatMessage({ id: candidate });
      }
    }

    return undefined;
  };

  if (board.nameKey) {
    const resolved = resolveMessage(board.nameKey);
    if (resolved) {
      name = resolved;
    } else if (board.nameKey && !board.name) {
      name = board.nameKey;
    } else if (
      board.nameKey &&
      board.name &&
      nameFromKey === board.name &&
      intl.messages &&
      intl.messages[board.nameKey]
    ) {
      name = intl.formatMessage({ id: board.nameKey });
    } else {
      name = board.name || '';
    }
  } else {
    name = board.name || '';
  }

  const validTiles = board.tiles.filter((tile) => Boolean(tile));
  const tiles = validTiles.map((tile) => ({
    ...tile,
    label:
      tile.labelKey && intl.messages && intl.messages[tile.labelKey]
        ? intl.formatMessage({ id: tile.labelKey })
        : tile.label,
  }));

  return {
    ...board,
    name,
    tiles,
  };
}

export const useTranslatedBoard = (board: BoardModel | null, intl: IntlShape) =>
  useMemo(() => translateBoard(board, intl), [board, intl]);
