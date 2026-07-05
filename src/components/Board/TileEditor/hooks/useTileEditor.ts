import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import shortid from 'shortid';
import { Tile, Board } from '../../../../types/board';

interface TileColors {
  folder: string;
  button: string;
  board: string;
}

interface UseTileEditorReturn {
  activeStep: number;
  setActiveStep: (step: number) => void;
  tiles: Tile[];
  setTiles: Dispatch<SetStateAction<Tile[]>>;
  tile: Tile;
  setTile: Dispatch<SetStateAction<Tile>>;
  currentTile: Tile;
  isEditing: boolean;
  selectedBackgroundColor: string;
  setSelectedBackgroundColor: (color: string) => void;
  linkedBoard: string | Board;
  setLinkedBoard: (board: string | Board) => void;
  defaultTileColors: TileColors;
  resetState: () => void;
}

export function useTileEditor(
  editingTiles: Tile[],
  open: boolean,
): UseTileEditorReturn {
  const defaultTileColors: TileColors = {
    folder: '#bbdefb',
    button: '#fff176',
    board: '#999999',
  };

  const defaultTile: Tile = {
    id: shortid.generate(),
    label: '',
    labelKey: '',
    vocalization: '',
    image: '',
    loadBoard: '',
    sound: '',
    type: 'button',
    backgroundColor: defaultTileColors.button,
    linkedBoard: false,
  };

  const [activeStep, setActiveStep] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>(editingTiles);
  const [tile, setTile] = useState<Tile>(defaultTile);
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState('');
  const [linkedBoard, setLinkedBoard] = useState<string | Board>('');

  useEffect(() => {
    setTiles(editingTiles);
    if (editingTiles.length && open) {
      setLinkedBoard(findLinkedBoard(editingTiles[activeStep]));
    }
  }, [editingTiles, open, activeStep]);

  const findLinkedBoard = (currentTile: Tile): string => {
    if (!currentTile?.linkedBoard) return '';
    // This would need boards prop to find the actual board
    return currentTile.loadBoard || '';
  };

  const currentTile = tiles[activeStep] || tile;
  const isEditing = Boolean(tiles.length);

  const resetState = () => {
    setActiveStep(0);
    setSelectedBackgroundColor('');
    setTile({ ...defaultTile, id: shortid.generate() });
    setLinkedBoard('');
  };

  return {
    activeStep,
    setActiveStep,
    tiles,
    setTiles,
    tile,
    setTile,
    currentTile,
    isEditing,
    selectedBackgroundColor,
    setSelectedBackgroundColor,
    linkedBoard,
    setLinkedBoard,
    defaultTileColors,
    resetState,
  };
}
