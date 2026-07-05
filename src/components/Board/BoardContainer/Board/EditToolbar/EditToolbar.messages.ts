import { defineMessages, MessageDescriptor } from 'react-intl';

interface Messages {
  [key: string]: MessageDescriptor;
}

const messages: Messages = defineMessages({
  select: {
    id: 'komunicare.components.Board.EditToolbar.select',
    defaultMessage: 'Select',
  },
  cancel: {
    id: 'komunicare.components.Board.EditToolbar.cancel',
    defaultMessage: 'Cancel',
  },
  deleteTiles: {
    id: 'komunicare.components.Board.EditToolbar.deleteTiles',
    defaultMessage: 'Delete selected tiles',
  },
  editTiles: {
    id: 'komunicare.components.Board.EditToolbar.editTiles',
    defaultMessage: 'Edit selected tiles',
  },
  createTiles: {
    id: 'komunicare.components.Board.EditToolbar.createTiles',
    defaultMessage: 'Create tiles',
  },
  editTilesButton: {
    id: 'komunicare.components.Board.EditToolbar.editTilesButton',
    defaultMessage: 'Edit',
  },
  addTileButton: {
    id: 'komunicare.components.Board.EditToolbar.addTileButton',
    defaultMessage: 'Add Tile',
  },
  fixedBoard: {
    id: 'komunicare.components.Board.EditToolbar.fixedBoard',
    defaultMessage: 'Fixed',
  },
  copyTiles: {
    id: 'komunicare.components.Board.EditToolbar.copyTiles',
    defaultMessage: 'Copy tiles',
  },
  pasteTiles: {
    id: 'komunicare.components.Board.EditToolbar.pasteTiles',
    defaultMessage: 'Paste tiles',
  },
});

export default messages;
