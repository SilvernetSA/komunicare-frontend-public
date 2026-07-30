import { reconcileBoards } from './boardHelpers';

import type { Board } from '@/types/board';

export const mergeRemoteBoards = (
  currentBoards: Board[],
  remoteBoards: Board[],
): Board[] => {
  const merged = [...currentBoards];
  remoteBoards.forEach((remote) => {
    const localIndex = merged.findIndex((board) => board.id === remote.id);
    if (localIndex >= 0) {
      merged[localIndex] = reconcileBoards(
        merged[localIndex] as any,
        remote as any,
      ) as Board;
    } else {
      merged.push(remote);
    }
  });
  return merged;
};

export const mergeUserBoards = (
  currentBoards: Board[],
  remoteBoards: Board[],
  userEmail: string,
): Board[] => {
  const cleanEmail = String(userEmail || '')
    .trim()
    .toLowerCase();
  const nonUserBoards = currentBoards.filter(
    (board) =>
      String((board as any)?.email || '')
        .trim()
        .toLowerCase() !== cleanEmail,
  );
  return mergeRemoteBoards(nonUserBoards, remoteBoards);
};

export const reconcileActiveBoardState = (
  nextBoards: Board[],
  prevActiveBoardId: string,
  prevNavHistory: string[],
): { activeBoardId: string; navHistory: string[] } => {
  const boardIds = new Set(nextBoards.map((board) => String(board.id || '')));

  // Keep the navigation history intact even if some of its boards aren't loaded
  // in the current `boards` snapshot. Boards load lazily/paginated, and a
  // background user-boards sync can momentarily drop the root (e.g. when it
  // isn't on the fetched page). Pruning the history here was removing that root,
  // leaving `[folder]` after opening a folder and hiding the "back" button.
  // Stale entries are harmless — back navigation re-fetches missing boards.
  // Drop only empty/falsy ids (they'd produce a `/board/` 404 on back nav).
  const navHistory = (prevNavHistory || []).filter(Boolean);

  const hasActiveBoard = boardIds.has(String(prevActiveBoardId || ''));
  // If the active board itself isn't loaded, fall back to the most recent
  // history entry that *is* loaded (same intent as before).
  const lastLoadedInHistory = [...navHistory]
    .reverse()
    .find((boardId) => boardIds.has(String(boardId || '')));
  const activeBoardId = hasActiveBoard
    ? prevActiveBoardId
    : lastLoadedInHistory || '';

  return {
    activeBoardId,
    navHistory,
  };
};
