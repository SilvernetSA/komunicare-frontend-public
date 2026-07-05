// BoardState is defined in src/store/boardsStore/types.ts where it is used.
// ApiUpdateParams is defined in src/types/board/handleApiUpdates/HandleApiUpdates.ts

export interface Tile {
  id?: string;
  label?: string;
  labelKey?: string;
  image?: string;
  loadBoard?: string;
  sound?: string;
  type?: 'button' | 'folder' | 'board' | 'live';
  backgroundColor?: string;
  borderColor?: string;
  vocalization?: string;
  action?: string;
  linkedBoard?: boolean;
  name?: string;
  keyPath?: string;
  [key: string]: unknown;
}

export interface GridStructure {
  rows: number;
  columns: number;
  order: (string | null)[][];
}

export interface Board {
  id: string;
  name: string;
  author: string;
  email: string;
  isPublic?: boolean;
  tiles?: Tile[];
  cellSize?: string;
  locale?: string;
  caption?: string;
  format?: string;
  lastEdited?: Date | string;
  description?: string;
  isFixed?: boolean;
  grid?: GridStructure;
  compactGrid?: boolean;
  nameKey?: string;
  hidden?: boolean;
  [key: string]: unknown;
}

export interface Position {
  row: number;
  column: number;
}
