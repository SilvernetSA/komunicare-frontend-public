import type { Board, Tile } from '@/types/board';

export interface BoardState {
  boards: Board[];
  output: Tile[];
  activeBoardId: string | null;
  navHistory: string[];
  isFetching: boolean;
  images: unknown[];
  isFixed: boolean;
  improvedPhrase: string;
  improvedPhraseSource: string;
  isLiveMode: boolean;
  isScreenKeyboardMode: boolean;
}

export interface BoardPageParams {
  limit?: number;
  page?: number;
  search?: string;
}

export interface BoardPageResponse {
  data: Board[];
  total?: number;
  page?: number;
  limit?: number;
  offset?: number;
}
