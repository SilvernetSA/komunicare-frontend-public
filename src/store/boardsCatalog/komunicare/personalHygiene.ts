import { handWashingBoard } from './handWashingBoard';
import { toothBrushingBoard } from './toothBrushingBoard';
import { KomunicareBoard } from './types';

export const personalHygiene: KomunicareBoard = {
  id: 'personalHygiene',
  tile: {
    labelKey: 'symbol.komunicare.personalHygiene',
    image: '/symbols/komunicare/personalHygiene/crema_de_enjuague.svg',
    loadBoard: 'personalHygieneBoard',
    sound: '',
    type: 'folder',
    backgroundColor: '#2196F3',
    linkedBoard: false,
    id: 'personalHygiene',
  },
  board: {
    name: 'Personal Hygiene',
    isPublic: true,
    tiles: [
      {
        id: 'mouthwash',
        labelKey: 'symbol.komunicare.personalHygiene.mouthwash',
        image: '/symbols/komunicare/personalHygiene/crema_de_enjuague.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'perfume',
        labelKey: 'symbol.komunicare.personalHygiene.perfume',
        image: '/symbols/komunicare/personalHygiene/perfume.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'wet_wipes',
        labelKey: 'symbol.komunicare.personalHygiene.toallita',
        image: '/symbols/komunicare/personalHygiene/toallita.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'towel',
        labelKey: 'symbol.komunicare.personalHygiene.towel',
        image: '/symbols/komunicare/personalHygiene/toalla.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'comb',
        labelKey: 'symbol.komunicare.personalHygiene.comb',
        image: '/symbols/komunicare/personalHygiene/peine.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'toilet_paper',
        labelKey: 'symbol.komunicare.personalHygiene.toiletPaper',
        image: '/symbols/komunicare/personalHygiene/papel_higienico.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'shampoo',
        labelKey: 'symbol.komunicare.personalHygiene.shampoo',
        image: '/symbols/komunicare/personalHygiene/shampoo.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'hair_dryer',
        labelKey: 'symbol.komunicare.personalHygiene.hairDryer',
        image: '/symbols/komunicare/personalHygiene/secador_de_pelo.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'toothpaste',
        labelKey: 'symbol.komunicare.personalHygiene.toothpaste',
        image: '/symbols/komunicare/personalHygiene/pasta_dental.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'soap',
        labelKey: 'symbol.komunicare.personalHygiene.soap',
        image: '/symbols/komunicare/personalHygiene/jabon.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },

      {
        id: 'pliers',
        labelKey: 'symbol.komunicare.personalHygiene.pliers',
        image: '/symbols/komunicare/personalHygiene/alicate.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'makeup',
        labelKey: 'symbol.komunicare.personalHygiene.makeup',
        image: '/symbols/komunicare/personalHygiene/maquillajes.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        id: 'creams',
        labelKey: 'symbol.komunicare.personalHygiene.creams',
        image: '/symbols/komunicare/personalHygiene/cremas.svg',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      handWashingBoard.tile,
      toothBrushingBoard.tile,
    ],
    id: 'personalHygieneBoard',
    locale: 'es-ES',
    format: 'komunicare',
    description: 'personalHygieneDescription',
    isFixed: true,
    nameKey: 'symbol.komunicare.personalHygiene',
    author: 'Komunicare',
    email: 'info@komuni.care',
    caption: '/symbols/komunicare/cover/personalHygiene.svg',
    grid: {
      rows: 4,
      columns: 5,
      order: [],
    },
  },
};
