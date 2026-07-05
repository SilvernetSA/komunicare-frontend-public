import { Tile, Board } from '../../types/board';

export interface Grid {
  rows: number;
  columns: number;
  order: (string | null)[][];
}

// Re-export shared types for API compatibility
export type { Tile, Board };

export interface IkomuninicareBoard {
  board: Board;
  tile: Tile;
  id: string;
}

export interface Boards {
  komunicare: Board[];
  advanced: Board[];
  picSeePal: Board[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  sort?: string;
  search?: string;
}
