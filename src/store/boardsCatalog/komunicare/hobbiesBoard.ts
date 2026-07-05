import { KomunicareBoard } from './types';

export const hobbiesBoard: KomunicareBoard = {
  id: 'hobbiesBoard',
  tile: {
    labelKey: 'symbol.komunicare.hobbies',
    image: '/symbols/komunicare/cover/hobbies.svg',
    loadBoard: 'hobbiesBoard',
    sound: '',
    type: 'folder',
    backgroundColor: '#2196F3',
    linkedBoard: false,
    id: 'hobbies',
  },
  board: {
    name: 'Hobbies',
    isPublic: true,
    tiles: [
      {
        id: 'play_computer',
        labelKey: 'symbol.komunicare.hobbies.playComputer',
        image: '/symbols/komunicare/hobbies/play_compu.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'pool',
        labelKey: 'symbol.komunicare.hobbies.pool',
        image: '/symbols/komunicare/hobbies/pool.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'puzzle',
        labelKey: 'symbol.komunicare.hobbies.puzzle',
        image: '/symbols/komunicare/hobbies/rompecabezas.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'board_games',
        labelKey: 'symbol.komunicare.hobbies.boardGames',
        image: '/symbols/komunicare/hobbies/juegos_de_mesa.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'watch_tv',
        labelKey: 'symbol.komunicare.hobbies.watchTv',
        image: '/symbols/komunicare/hobbies/ver_tv.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'darts',
        labelKey: 'symbol.komunicare.hobbies.darts',
        image: '/symbols/komunicare/hobbies/dardos.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'cards',
        labelKey: 'symbol.komunicare.hobbies.cards',
        image: '/symbols/komunicare/hobbies/cartas.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'bingo',
        labelKey: 'symbol.komunicare.hobbies.bingo',
        image: '/symbols/komunicare/hobbies/bingo.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
    ],
    id: 'hobbiesBoard',
    locale: 'es-ES',
    format: 'komunicare',
    description: 'hobbiesDescription',
    isFixed: true,
    nameKey: 'symbol.komunicare.hobbies',
    author: 'Komunicare',
    email: 'info@komuni.care',
    caption: '/symbols/komunicare/cover/hobbies.svg',
    grid: {
      rows: 2,
      columns: 4,
      order: [
        ['play_computer', 'pool', 'puzzle', 'board_games'],
        ['darts', 'cards', 'bingo', 'watch_tv', null],
      ],
    },
  },
};
