import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import * as _ from 'lodash';
import moment from 'moment';
import { IntlShape } from 'react-intl';

import { boardToOBF } from './obfUtils';
import { generatePDFBoard } from './pdfUtils';
import { Board } from '../../../../types/board';
import {
  EXPORT_CONFIG_BY_TYPE,
  KOMUNICARE_ZIP_OPTIONS,
} from '../Export.constants';

let pdfMakeInstance: any = null;
let pdfMakePromise: Promise<any> | null = null;

const getPdfMake = async () => {
  // Si ya está cargado, lo retornamos
  if (pdfMakeInstance) return pdfMakeInstance;

  // Si ya hay una carga en proceso, esperamos a que termine
  if (pdfMakePromise) return pdfMakePromise;

  // Iniciamos la carga de pdfmake
  pdfMakePromise = (async () => {
    try {
      // Importamos dinámicamente los módulos necesarios
      const [pdfMakeModule, pdfFontsModule] = await Promise.all([
        import('pdfmake/build/pdfmake'),
        import('pdfmake/build/vfs_fonts'),
      ]);

      // Obtenemos la instancia de pdfmake
      const instance = pdfMakeModule.default || pdfMakeModule;

      // Configuramos las fuentes
      instance.vfs =
        pdfFontsModule.pdfMake?.vfs || (pdfFontsModule as any).vfs || {};

      // Guardamos la instancia para futuras llamadas
      pdfMakeInstance = instance;
      return instance;
    } catch (error) {
      console.error('Error loading pdfmake:', error);
      throw error;
    } finally {
      pdfMakePromise = null;
    }
  })();

  return pdfMakePromise;
};

function getNestedBoards(allBoards: Board[], rootBoardId: string): Board[] {
  const boardsMap = _.fromPairs(_.map(allBoards, (b) => [b.id, b]));

  const unseen = [rootBoardId];
  const nestedBoardIds = [rootBoardId];

  while (!_.isEmpty(unseen)) {
    const curr = unseen.pop()!;
    const tiles = _.get(boardsMap[curr], 'tiles');
    _.forEach(tiles, (tile: { loadBoard?: string }) => {
      const id = tile.loadBoard;
      if (id && !_.includes(nestedBoardIds, id)) {
        nestedBoardIds.push(id);
        unseen.push(id);
      }
    });
  }

  return _.map(nestedBoardIds, (id) => boardsMap[id]);
}

export async function openboardExportAdapter(
  boardOrBoards: Board | Board[],
  intl: IntlShape,
): Promise<void> {
  return _.isArray(boardOrBoards)
    ? openboardExportManyAdapter(boardOrBoards as Board[], intl)
    : openboardExportOneAdapter(boardOrBoards as Board, intl);
}

export async function openboardExportOneAdapter(
  board: Board,
  intl: IntlShape,
): Promise<void> {
  const { obf } = await boardToOBF({ [board.id]: board }, board, intl, {
    embed: true,
  });
  const content = new Blob([JSON.stringify(obf, null, 2)], {
    type: 'application/json',
  });

  if (content) {
    const prefix = moment().format('YYYY-MM-DD_HH-mm-ss-') + board.name + ' ';
    saveAs(content, prefix + 'board.obf');
  }
}

export async function openboardExportManyAdapter(
  boards: Board[] = [],
  intl: IntlShape,
): Promise<void> {
  const boardsLength = boards.length;
  const boardsForManifest: Record<string, string> = {};
  const imagesMap: Record<string, string> = {};
  const zip = new JSZip();

  const boardsMap = boards.reduce(
    (prev, current) => {
      prev[current.id] = current;
      return prev;
    },
    {} as Record<string, Board>,
  );

  for (let i = 0; i < boardsLength; i++) {
    const board = boards[i];
    const boardMapFilename = `boards/${board.id}.obf`;
    const { obf, images } = await boardToOBF(boardsMap, board, intl, {
      embed: false,
    });

    if (!obf) {
      continue;
    }

    zip.file(boardMapFilename, JSON.stringify(obf, null, 2));

    const imagesKeys = Object.keys(images);
    imagesKeys.forEach((key) => {
      const image = images[key];
      const imageFilename = `images/${image.path}`;
      zip.file(imageFilename, (image as any).ab);
      imagesMap[key] = imageFilename;
    });

    boardsForManifest[board.id] = boardMapFilename;
  }

  const root = boardsForManifest.root
    ? boardsForManifest.root
    : boardsForManifest[Object.keys(boardsMap)[0]];

  const manifest = {
    format: 'open-board-0.1',
    root,
    paths: {
      boards: boardsForManifest,
      images: imagesMap,
    },
  };

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  try {
    const content = await zip.generateAsync(
      KOMUNICARE_ZIP_OPTIONS as JSZip.JSZipGeneratorOptions,
    );
    if (content) {
      let prefix = moment().format('YYYY-MM-DD_HH-mm-ss-');
      if (boards.length === 1) {
        prefix = prefix + boards[0].name + ' ';
      } else {
        prefix = prefix + 'boardsset ';
      }
      saveAs(content, prefix + EXPORT_CONFIG_BY_TYPE.openboard.filename);
    }
  } catch (error) {
    console.error('Error creating openboard export', error);
  }
}

export async function komunicareExportAdapter(
  allBoards: Board[] = [],
  board?: Board,
): Promise<void> {
  const boards = board ? getNestedBoards(allBoards, board.id) : allBoards;

  const jsonData = new Blob([JSON.stringify(boards)], {
    type: 'text/json;charset=utf-8;',
  });

  if (jsonData) {
    let prefix = moment().format('YYYY-MM-DD_HH-mm-ss-');
    if (boards.length === 1) {
      prefix = prefix + boards[0].name + ' ';
    } else {
      prefix = prefix + 'boardsset ';
    }
    if ((navigator as any).msSaveBlob) {
      (navigator as any).msSaveBlob(
        jsonData,
        prefix + EXPORT_CONFIG_BY_TYPE.komunicare.filename,
      );
    } else {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(jsonData);
      link.setAttribute(
        'download',
        prefix + EXPORT_CONFIG_BY_TYPE.komunicare.filename,
      );
      document.body.appendChild(link as Node);
      link.click();
      document.body.removeChild(link as Node);
    }
  }
}

export async function pdfExportAdapter(
  boards: Board[] = [],
  intl: IntlShape,
  picsee: boolean = false,
): Promise<void> {
  const docDefinition: Record<string, unknown> = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [20, 20],
    content: [],
  };

  if (picsee) {
    docDefinition.background = function () {
      return {
        stack: [
          {
            text: [
              {
                text: '\\nPicseePal compatible PDF',
                fontSize: 18,
                alignment: 'center',
                bold: true,
              },
            ],
          },
          {
            canvas: [
              {
                type: 'rect',
                x: 137.5,
                y: 48,
                w: 567,
                h: 374.22,
                r: 5,
                lineColor: 'black',
              },
              {
                type: 'rect',
                x: 101.65,
                y: 11.5,
                w: 638.7,
                h: 447,
                r: 55,
                dash: { length: 5 },
                lineColor: 'black',
              },
            ],
          },
          {
            text: [
              {
                text: `\\nPlease print on A4 / US Letter paper at 100% scale.\n                          Cut along dashed line before inserting into PicseePal device.`,
                fontSize: 15,
                alignment: 'center',
              },
            ],
          },
        ],
      };
    };

    docDefinition.pageMargins = [144, 93, 144, 130];
  }

  const lastBoardIndex = boards.length - 1;
  const content = await boards.reduce(
    async (prev, board, i) => {
      const prevContent = await prev;
      const breakPage = i !== lastBoardIndex;
      const boardPDFData = await generatePDFBoard(
        board,
        intl,
        breakPage,
        picsee,
      );
      return prevContent.concat(boardPDFData);
    },
    Promise.resolve([] as unknown[]),
  );

  docDefinition.content = content;
  const pdfMake = await getPdfMake();
  const pdfObj = pdfMake.createPdf(docDefinition);

  if (pdfObj) {
    let prefix = moment().format('YYYY-MM-DD_HH-mm-ss-');
    if (content.length === 2) {
      prefix = prefix + content[0] + ' ';
    } else {
      prefix = prefix + 'boardsset ';
    }
    pdfObj.download(prefix + EXPORT_CONFIG_BY_TYPE.pdf.filename);
  }
}
