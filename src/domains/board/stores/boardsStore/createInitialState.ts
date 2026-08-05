import { createInitialBoards } from './createInitialBoards';

import type { BoardState } from './types';

const initialBoardsState: BoardState = {
  boards: createInitialBoards(),
  output: [],
  activeBoardId: null,
  navHistory: [],
  isFetching: false,
  images: [],
  isFixed: false,
  improvedPhrase: '',
  improvedPhraseSource: '',
  isLiveMode: false,
  isScreenKeyboardMode: false,
};

export const cloneInitialState = (): BoardState =>
  JSON.parse(JSON.stringify(initialBoardsState)) as BoardState;
