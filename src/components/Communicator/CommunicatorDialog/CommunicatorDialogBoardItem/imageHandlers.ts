import { Board } from '../../../../types/board';

type SetState = (state: Record<string, unknown>) => void;

interface ImageState {
  imageBoard?: string | null;
  isSymbolSearchOpen?: boolean;
  openImageBoard?: boolean;
  loading?: boolean;
}

interface SymbolSearchData {
  image: string;
}

export const handleSymbolSearchChange = async (
  { image }: SymbolSearchData,
  setState: SetState,
): Promise<void> => {
  setState({ imageBoard: image });
};

export const handleBoardImage = (
  board: Board,
  state: ImageState,
  setState: SetState,
  updateMyBoard: (board: Board) => void,
): void => {
  setState({
    openImageBoard: false,
    loading: true,
  });

  if (state.imageBoard) {
    const newBoard: Board = {
      ...board,
      caption: state.imageBoard,
    };
    updateMyBoard(newBoard);
  }
  setState({
    imageBoard: null,
    loading: false,
  });
};
