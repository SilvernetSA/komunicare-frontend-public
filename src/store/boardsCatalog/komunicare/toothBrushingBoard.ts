import { KomunicareBoard } from './types';

export const toothBrushingBoard: KomunicareBoard = {
  id: 'toothBrushingBoard',
  tile: {
    labelKey: 'symbol.komunicare.toothBrushingBoard',
    image: '/symbols/komunicare/cover/lavado_de_dientes.svg',
    loadBoard: 'toothBrushingBoard',
    sound: '',
    type: 'folder',
    backgroundColor: '#FF9800',
    linkedBoard: false,
    id: 'toothBrushing',
  },
  board: {
    name: 'Tooth Brushing',
    isPublic: false,
    tiles: [
      {
        label: 'Cepillar dientes',
        labelKey: 'symbol.komunicare.toothBrushing.brushTeeth',
        image: '/symbols/komunicare/toothBrushing/cepillar_dientes.svg',
        id: 'brushTeeth',
        backgroundColor: 'rgb(255, 236, 179)',
      },
      {
        label: 'Cepillo',
        labelKey: 'symbol.komunicare.toothBrushing.toothbrush',
        image: '/symbols/komunicare/toothBrushing/cepillo.svg',
        id: 'toothbrush',
        backgroundColor: 'rgb(255, 236, 179)',
      },
      {
        label: 'Enjuagar boca',
        labelKey: 'symbol.komunicare.toothBrushing.rinsemouth',
        image: '/symbols/komunicare/toothBrushing/enjuagar_boca.svg',
        id: 'rinsemouth',
        backgroundColor: 'rgb(255, 236, 179)',
      },
      {
        label: 'Limpiar cepillo',
        labelKey: 'symbol.komunicare.toothBrushing.cleanBrush',
        image: '/symbols/komunicare/toothBrushing/limpiar_cepillo.svg',
        id: 'cleanBrush',
        backgroundColor: 'rgb(255, 236, 179)',
      },
      {
        label: 'Poner pasta',
        labelKey: 'symbol.komunicare.toothBrushing.putToothpaste',
        image: '/symbols/komunicare/toothBrushing/poner_pasta.svg',
        id: 'putToothpaste',
        backgroundColor: 'rgb(255, 236, 179)',
      },
    ],
    id: 'toothBrushingBoard',
    locale: 'es-ES',
    format: 'komunicare',
    description: '',
    isFixed: true,
    nameKey: 'symbol.komunicare.toothBrushing',
    author: 'Komunicare',
    email: 'info@komuni.care',
    caption: '/symbols/komunicare/cover/cepillar_dientes.svg',
    grid: {
      rows: 2,
      columns: 3,
      order: [
        ['toothbrush', 'putToothpaste', 'brushTeeth'],
        ['rinsemouth', 'cleanBrush'],
      ],
    },
  },
};
