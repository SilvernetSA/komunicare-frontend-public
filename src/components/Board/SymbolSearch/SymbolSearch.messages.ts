import { defineMessages } from 'react-intl';

interface SymbolSearchMessages {
  [key: string]: {
    id: string;
    defaultMessage: string;
  };
}

const messages: SymbolSearchMessages = defineMessages({
  searchSymbolLibrary: {
    id: 'komunicare.components.SymbolSearch.searchSymbolLibrary',
    defaultMessage: 'Search symbol library',
  },
  clearText: {
    id: 'komunicare.components.SymbolSearch.clearText',
    defaultMessage: 'Clear text',
  },
  uploadAnImage: {
    id: 'komunicare.components.InputImage.uploadImage',
    defaultMessage: 'Upload an image',
  },
  typeToSearch: {
    id: 'komunicare.components.SymbolSearch.typeToSearch',
    defaultMessage:
      'Escriba arriba para buscar simbolos. Presione enter para realizar la busqueda.',
  },
  noResults: {
    id: 'komunicare.components.SymbolSearch.noResults',
    defaultMessage: 'No se encontro ningun resultado',
  },
});

export default messages;
