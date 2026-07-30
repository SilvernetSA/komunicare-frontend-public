import { isArray } from 'lodash';

import { Tile, Board } from '@/types/board';

interface SymbolSource {
  value: number;
  name: string;
}

export const getSymbolSources = (boards: Board[]): SymbolSource[] => {
  try {
    const images = boards
      .map((board) => {
        return isArray(board.tiles)
          ? board.tiles.map((tile) => (tile ? tile.image : 'invalid'))
          : [];
      })
      .reduce(
        (accumulator, currentValue) => accumulator.concat(currentValue),
        [],
      );
    const sources = ['mulberry', 'komunicare', 'globalsymbols'];
    const summary = images.reduce(function (
      all: Record<string, number>,
      image: string,
    ) {
      sources.forEach((source) => {
        try {
          if (image && image.match(source)) {
            if (source in all) {
              all[source]++;
            } else {
              all[source] = 1;
            }
          }
        } catch {
          //just skip the image in counting
        }
      });
      return all;
    }, {});
    const summaryData: SymbolSource[] = Object.entries(summary).map(
      ([key, value]) => {
        return {
          value: value as number,
          name: key,
        };
      },
    );
    return summaryData;
  } catch (err) {
    console.log((err as Error).message);
    return [{ value: 0, name: 'No data' }];
  }
};

export const getTileFromLabel = (
  label: string,
  boards: Board[],
): Tile | undefined => {
  for (let i = 0; i < boards.length; i++) {
    for (let j = 0; j < boards[i].tiles.length; j++) {
      const tile = boards[i].tiles[j];
      if (
        (tile.label &&
          tile.label.trim().toLowerCase() === label.trim().toLowerCase()) ||
        (tile.labelKey &&
          tile.labelKey
            .split(' ')
            [tile.labelKey.split(' ').length - 1].trim()
            .toLowerCase() === label.trim().replace(' ', '').toLowerCase())
      ) {
        return tile;
      }
    }
  }
  return undefined;
};
