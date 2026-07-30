import * as _ from 'lodash';
import mime from 'mime-types';
import { IntlShape } from 'react-intl';

import { getBase64Image, getDataUri } from './imageUtils';
import { Board, Tile } from '@/types/board';
import {
  KOMUNICARE_COLUMNS,
  KOMUNICARE_EXT_PREFIX,
  KOMUNICARE_EXT_PROPERTIES,
  KOMUNICARE_OBF_CONSTANTS,
} from '../Export.constants';

interface OBFButton {
  id: string;
  label: string;
  action?: string;
  vocalization?: string;
  border_color?: string;
  background_color?: string;
  image_id?: string;
  load_board?: {
    name: string;
    path: string;
  };
  [key: string]: unknown;
}

interface OBFImage {
  id: string;
  path?: string;
  data?: string;
  content_type: string;
  width: number;
  height: number;
}

interface OBF {
  format: string;
  id: string;
  locale: string;
  name: string;
  url: string;
  license: Record<string, unknown>;
  images: OBFImage[];
  buttons: OBFButton[];
  sounds: unknown[];
  grid: {
    rows: number;
    columns: number;
    order: (string | null)[][];
  };
  description_html: string;
  [key: string]: unknown;
}

interface BoardToOBFResult {
  obf: OBF | null;
  images: Record<
    string,
    { path?: string; data?: string; content_type: string }
  > | null;
}

function toSnakeCase(str: string): string {
  const value = str.replace(/([A-Z])/g, ($1) => '_' + $1.toLowerCase());
  return value.startsWith('_') ? value.slice(1) : value;
}

const generateObjectId = (): string => {
  if (typeof globalThis !== 'undefined') {
    const globalCrypto = (globalThis as any).crypto;
    if (globalCrypto && typeof globalCrypto.getRandomValues === 'function') {
      const bytes = globalCrypto.getRandomValues(new Uint8Array(12));
      return Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, '0'),
      ).join('');
    }
  }

  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 256))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export function getOBFButtonProps(
  tile: Tile = {},
  intl: IntlShape,
): Partial<OBFButton> {
  const button: Partial<OBFButton> = {};

  const tileExtProps = KOMUNICARE_EXT_PROPERTIES.filter((key) => !!tile[key]);
  tileExtProps.forEach((key) => {
    const keyWithPrefix = `${KOMUNICARE_EXT_PREFIX}${toSnakeCase(key)}`;
    button[keyWithPrefix] = tile[key];
  });

  const label = tile.label || tile.labelKey || '';
  button.label = label.length ? intl.formatMessage({ id: label }) : label;

  if (tile.action) {
    button.action = tile.action;
  }

  if (tile.vocalization) {
    button.vocalization = tile.vocalization;
  }

  if (tile.borderColor) {
    button.border_color = tile.borderColor;
  }

  if (tile.backgroundColor) {
    button.background_color = tile.backgroundColor;
  }

  return button;
}

export async function boardToOBF(
  boardsMap: Record<string, Board>,
  board: Board,
  intl: IntlShape,
  { embed = false }: { embed?: boolean },
): Promise<BoardToOBFResult> {
  if (!board.tiles || board.tiles.length < 1) {
    return { obf: null, images: null };
  }

  const images: Record<string, OBFImage> = {};
  const fetchedImages: Record<
    string,
    { path?: string; data?: string; content_type: string }
  > = {};
  const grid = new Array(Math.ceil(board.tiles.length / KOMUNICARE_COLUMNS));
  let currentRow = 0;

  const buttons = await Promise.all(
    board.tiles.map(async (tile: Tile, i: number) => {
      currentRow =
        i >= (currentRow + 1) * KOMUNICARE_COLUMNS
          ? currentRow + 1
          : currentRow;

      if (tile) {
        if (grid[currentRow]) {
          grid[currentRow].push(tile.id);
        } else {
          grid[currentRow] = [tile.id];
        }

        const button: OBFButton = {
          id: tile.id,
          ...getOBFButtonProps(tile, intl),
        } as OBFButton;

        if (tile.image && tile.image.length) {
          const image = tile.image;

          const imageResponse = image.startsWith('data:')
            ? getBase64Image(image)
            : await getDataUri(image);

          const getCustomImagePath = () => {
            const components = [
              'custom',
              board.name || board.nameKey,
              tile.label || tile.labelKey || tile.id,
            ];
            const extension = mime.extension(imageResponse!['content_type']);
            return `/${_.join(components, '/')}.${extension}`;
          };

          const path = image.startsWith('data:')
            ? getCustomImagePath()
            : image.startsWith('/')
              ? image
              : `/${image}`;

          if (imageResponse) {
            const imageID = generateObjectId();
            fetchedImages[imageID] = _.defaults({ path }, imageResponse);
            button.image_id = imageID;
            images[imageID] = {
              id: imageID,
              path: embed ? undefined : path,
              data: embed ? imageResponse.data : undefined,
              content_type: imageResponse.content_type,
              width: 300,
              height: 300,
            };
          }
        }

        if (tile.loadBoard && boardsMap[tile.loadBoard]) {
          const loadBoardData = boardsMap[tile.loadBoard];
          button.load_board = {
            name: loadBoardData.nameKey
              ? intl.formatMessage({ id: loadBoardData.nameKey })
              : '',
            path: `boards/${tile.loadBoard}.obf`,
          };
        }

        return button;
      }
    }),
  );

  if (grid.length >= 1) {
    const lastGridRowDiff = KOMUNICARE_COLUMNS - grid[grid.length - 1].length;
    if (lastGridRowDiff > 0) {
      const emptyButtons = new Array(lastGridRowDiff).map(() => null);
      grid[grid.length - 1] = grid[grid.length - 1].concat(emptyButtons);
    }

    const obf: OBF = {
      format: 'open-board-0.1',
      id: board.id,
      locale: intl.locale,
      name: board.name || '',
      url: `${KOMUNICARE_OBF_CONSTANTS.URL}${board.id}`,
      license: KOMUNICARE_OBF_CONSTANTS.LICENSE,
      images: Object.values(images),
      buttons: buttons.filter(Boolean) as OBFButton[],
      sounds: [],
      grid: {
        rows: grid.length,
        columns: KOMUNICARE_COLUMNS,
        order: grid,
      },
      description_html: board.nameKey
        ? intl.formatMessage({ id: board.nameKey })
        : '',
    };

    const boardExtProps = KOMUNICARE_EXT_PROPERTIES.filter(
      (key) => typeof board[key] !== 'undefined',
    );
    boardExtProps.forEach((key) => {
      const keyWithPrefix = `${KOMUNICARE_EXT_PREFIX}${toSnakeCase(key)}`;
      obf[keyWithPrefix] = board[key];
    });

    return { obf, images: fetchedImages };
  } else {
    return { obf: null, images: null };
  }
}
