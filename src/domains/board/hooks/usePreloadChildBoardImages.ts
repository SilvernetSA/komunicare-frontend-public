import { useEffect } from 'react';

import { Board as BoardModel } from '@/types/board';

const preloadedImages = new Set<string>();

const scheduleIdle = (callback: () => void) => {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(callback);
    return;
  }

  window.setTimeout(callback, 200);
};

export const usePreloadChildBoardImages = (
  board: BoardModel | null,
  availableBoards: BoardModel[],
): void => {
  useEffect(() => {
    if (!board) {
      return;
    }

    const childBoardIds = (board.tiles || [])
      .filter((tile) => tile?.loadBoard)
      .map((tile) => String(tile.loadBoard));

    if (!childBoardIds.length) {
      return;
    }

    const urls: string[] = [];
    for (const childId of childBoardIds) {
      const childBoard = availableBoards.find(
        (candidate) => candidate?.id === childId,
      );
      for (const tile of childBoard?.tiles || []) {
        const image = tile?.image;
        if (image && !preloadedImages.has(image)) {
          preloadedImages.add(image);
          urls.push(image);
        }
      }
    }

    if (!urls.length) {
      return;
    }

    scheduleIdle(() => {
      for (const url of urls) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [board, availableBoards]);
};
