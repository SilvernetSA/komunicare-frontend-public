import type { Board } from '@/types/board';

export const isMarkedBoardForApiUpdate = (
  board: Board,
  userEmail: string,
): boolean =>
  board.id.length > 14 &&
  (board as Record<string, unknown>).hasOwnProperty('email') &&
  (board as any).email === userEmail &&
  (board as Record<string, unknown>).hasOwnProperty('markToUpdate') &&
  Boolean((board as any).markToUpdate);
