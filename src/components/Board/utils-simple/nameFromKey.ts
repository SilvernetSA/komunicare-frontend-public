import { Board } from '../../../types/board';

export function nameFromKey(board: Board): string | undefined {
  let nameFromKey: string | undefined = undefined;
  if (board.nameKey) {
    const nameKeyArray = board.nameKey.split('.');
    nameFromKey = nameKeyArray[nameKeyArray.length - 1];
  }
  return nameFromKey;
}
