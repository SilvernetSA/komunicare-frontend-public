import { IntlShape } from 'react-intl';

import { toDataURL } from './imageUtils';
import { useAppStore } from '../../../../store/appStore';
import { DisplaySettings } from '../../../../types/app';
import { Board, Tile } from '../../../../types/board';
import * as utils from '../../../FixedGrid/utils';
import {
  LABEL_POSITION_ABOVE,
  LABEL_POSITION_BELOW,
} from '../../Display/Display.constants';
import {
  KOMUNICARE_COLUMNS,
  KOMUNICARE_ROWS,
  NOT_FOUND_IMAGE,
} from '../Export.constants';

interface PDFTileData {
  label: string;
  image: string;
}

interface PDFImageData {
  image: string;
  alignment: string;
  width: string | number;
  pageBreak?: string;
}

interface PDFLabelData {
  text: string;
  alignment: string;
  fontSize?: number;
}

export function getPDFTileData(tile: Tile, intl: IntlShape): PDFTileData {
  const label = tile.label || tile.labelKey || '';
  return {
    label: label.length ? intl.formatMessage({ id: label }) : label,
    image: tile.image || '',
  };
}

export function chunks<T>(array: T[], size: number): T[][] {
  const newArray = [...array];
  const results: T[][] = [];

  while (newArray.length) {
    results.push(newArray.splice(0, size));
  }

  return results;
}

export const getDisplaySettings = (): DisplaySettings => {
  return useAppStore.getState().displaySettings;
};

export const addTileToGrid = async (
  tile: Tile,
  intl: IntlShape,
  grid: unknown[],
  rows: number,
  columns: number,
  currentRow: number,
  pageBreak: boolean = false,
  picsee: boolean = false,
): Promise<unknown[]> => {
  const { label, image } = getPDFTileData(tile, intl);
  const fixedRow = currentRow * 2;
  let dataURL = image;

  if (
    !image.startsWith('data:') ||
    image.startsWith('data:image/svg+xml') ||
    image.startsWith('data:image/png')
  ) {
    const styles = {
      backgroundColor: tile.backgroundColor,
      borderColor: tile.borderColor,
    };
    try {
      dataURL = await toDataURL(image, styles);
    } catch (err) {
      console.log((err as Error).message);
      dataURL = NOT_FOUND_IMAGE;
    }
  }

  const imageData: PDFImageData = {
    image: dataURL,
    alignment: 'center',
    width: '100',
  };

  const labelData: PDFLabelData = {
    text: label,
    alignment: 'center',
  };

  if (picsee) {
    const colImgWidths: Record<number, number> = {
      1: 130,
      2: 130,
      3: 80,
      4: 84,
      5: 75,
      6: 60,
      7: 55,
      8: 55,
      9: 45,
      10: 45,
      11: 40,
      12: 37,
    };
    const rowImgWidths: Record<number, number> = {
      1: 130,
      2: 130,
      3: 86,
      4: 59,
      5: 45,
      6: 33,
      7: 32,
      8: 26,
      9: 21,
      10: 17,
      11: 14,
      12: 11,
    };

    imageData.width = Math.min(colImgWidths[columns], rowImgWidths[rows]);

    if (imageData.width <= 37) {
      labelData.fontSize = 7;
    } else if (imageData.width <= 40) {
      labelData.fontSize = 8;
    } else if (imageData.width <= 45) {
      labelData.fontSize = 9;
    }
  } else {
    if (11 === columns || columns === 12 || rows >= 6) {
      imageData.width = '59';
      labelData.fontSize = 9;
    } else if (9 === columns || columns === 10 || rows === 5) {
      imageData.width = '70';
    } else if (7 === columns || columns === 8) {
      imageData.width = '90';
    }
  }

  const displaySettings = getDisplaySettings();
  let value1: Record<string, unknown>,
    value2: Record<string, unknown> = {};

  if (
    displaySettings.labelPosition &&
    displaySettings.labelPosition === LABEL_POSITION_BELOW
  ) {
    value1 = imageData as any;
    value2 = labelData as any;
  } else if (
    displaySettings.labelPosition &&
    displaySettings.labelPosition === LABEL_POSITION_ABOVE
  ) {
    value2 = imageData as any;
    value1 = labelData as any;
  } else {
    value1 = { text: ' ' };
    value2 = imageData as any;
  }

  if (pageBreak) {
    value2.pageBreak = 'after';
  }

  if (grid[fixedRow]) {
    (grid[fixedRow] as any).push(value1);
    (grid[fixedRow + 1] as any).push(value2);
  } else {
    grid[fixedRow] = [value1];
    grid[fixedRow + 1] = [value2];
  }
  return grid;
};

export async function generateFixedBoard(
  board: Board,
  rows: number,
  columns: number,
  intl: IntlShape,
  picsee: boolean = false,
): Promise<any[]> {
  let currentRow = 0;
  let cont = 0;

  const defaultTile: Tile = {
    id: '',
    label: '',
    labelKey: '',
    image: '',
    backgroundColor: '#d9d9d9',
  };

  const itemsPerPage = rows * columns;
  const pages = chunks(board.tiles || [], itemsPerPage);
  const grid = new Array((board.grid?.rows || rows) * 2 * pages.length);

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const items = pages[pageIndex];
    const order = utils.getNewOrder({
      columns,
      rows,
      order: board.grid?.order || [],
      items: items as any[],
    });
    for (let rowIndex = 0; rowIndex < order.length; rowIndex++) {
      for (
        let columnIndex = 0;
        columnIndex < order[rowIndex].length;
        columnIndex++
      ) {
        const tileId = order[rowIndex][columnIndex];
        let tile = (board.tiles || []).find((tile: Tile) => tile.id === tileId);
        if (tile === undefined) {
          tile = defaultTile;
        }
        currentRow =
          cont >= (currentRow + 1) * columns ? currentRow + 1 : currentRow;
        let pageBreak = false;
        if (
          (currentRow + 1) % rows === 0 &&
          pages.length > 0 &&
          currentRow + 1 < pages.length * rows
        ) {
          pageBreak = true;
        }

        await addTileToGrid(
          tile,
          intl,
          grid,
          rows,
          columns,
          currentRow,
          pageBreak,
          picsee,
        );
        cont++;
      }
    }
  }
  return grid;
}

export async function generateNonFixedBoard(
  board: Board,
  rows: number,
  columns: number,
  intl: IntlShape,
  picsee: boolean = false,
): Promise<any[]> {
  const tiles = board.tiles || [];
  const grid = new Array(Math.ceil(tiles.length / columns) * 2);
  let currentRow = 0;

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    currentRow = i >= (currentRow + 1) * columns ? currentRow + 1 : currentRow;
    await addTileToGrid(
      tile,
      intl,
      grid,
      rows,
      columns,
      currentRow,
      false,
      picsee,
    );
  }
  return grid;
}

export async function generatePDFBoard(
  board: Board,
  intl: IntlShape,
  breakPage: boolean = true,
  picsee: boolean = false,
): Promise<any[]> {
  const header = board.name || '';
  const columns =
    board.isFixed && board.grid ? board.grid.columns : KOMUNICARE_COLUMNS;
  const rows = board.isFixed && board.grid ? board.grid.rows : KOMUNICARE_ROWS;
  const table = {
    table: {
      widths: '*',
      body: [{}],
    },
    layout: 'noBorders',
  };

  if (breakPage) {
    (table as any).pageBreak = 'after';
  }

  if (!board.tiles || !board.tiles.length) {
    return [header, table];
  }

  const grid = board.isFixed
    ? await generateFixedBoard(board, rows, columns, intl, picsee)
    : await generateNonFixedBoard(board, rows, columns, intl, picsee);

  const lastGridRowDiff = columns - grid[grid.length - 2].length;
  if (lastGridRowDiff > 0) {
    const emptyCells = new Array(lastGridRowDiff).fill('');
    grid[grid.length - 2] = grid[grid.length - 2].concat(emptyCells);
    grid[grid.length - 1] = grid[grid.length - 1].concat(emptyCells);
  }

  table.table.body = grid;

  return [header, table];
}
