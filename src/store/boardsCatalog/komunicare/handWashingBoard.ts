import { KomunicareBoard } from './types';

export const handWashingBoard: KomunicareBoard = {
  id: 'handWashingBoard',
  tile: {
    labelKey: 'symbol.komunicare.handWashingBoard',
    image: '/symbols/komunicare/cover/lavado_de_manos.svg',
    loadBoard: 'handWashingBoard',
    sound: '',
    type: 'folder',
    backgroundColor: '#4CAF50',
    linkedBoard: false,
    id: 'handWashing',
  },
  board: {
    name: 'Hand Washing',
    isPublic: false,
    tiles: [
      {
        label: 'Enjabonar Manos',
        labelKey: 'symbol.komunicare.handWashing.soapHands',
        image: '/symbols/komunicare/handWashing/enjabonar_manos.svg',
        id: 'soapHands',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        label: 'Lavar',
        labelKey: 'symbol.komunicare.handWashing.wash',
        image: '/symbols/komunicare/handWashing/lavar.svg',
        id: 'wash',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        label: 'Poner Jabón',
        labelKey: 'symbol.komunicare.handWashing.putSoap',
        image: '/symbols/komunicare/handWashing/poner_jabon.svg',
        id: 'putSoap',
        backgroundColor: 'rgb(187, 222, 251)',
      },
      {
        label: 'Secar Manos',
        labelKey: 'symbol.komunicare.handWashing.dryHands',
        image: '/symbols/komunicare/handWashing/secar_manos.svg',
        id: 'dryHands',
        backgroundColor: 'rgb(187, 222, 251)',
      },
    ],
    id: 'handWashingBoard',
    locale: 'es-ES',
    format: 'komunicare',
    description: '',
    isFixed: true,
    nameKey: 'symbol.komunicare.handWashing',
    author: 'Komunicare',
    email: 'info@komuni.care',
    caption: '/symbols/komunicare/cover/lavado_de_manos.svg',
    grid: {
      rows: 2,
      columns: 2,
      order: [
        ['putSoap', 'soapHands'],
        ['wash', 'dryHands'],
      ],
    },
  },
};
