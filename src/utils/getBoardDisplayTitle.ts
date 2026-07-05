import { Board } from '../types/board';

interface IntlLike {
  formatMessage: (message: { id: string; defaultMessage: string }) => string;
  messages?: Record<string, unknown>;
}

const hasTranslation = (intl: IntlLike | undefined, id?: string): boolean => {
  if (!intl || !id) {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(intl.messages || {}, id);
};

export const getBoardDisplayTitle = (board: Board, intl?: IntlLike): string => {
  const fallbackTitle = board.name || board.id;

  if (hasTranslation(intl, board.nameKey)) {
    return intl!.formatMessage({
      id: board.nameKey!,
      defaultMessage: fallbackTitle,
    });
  }

  if (hasTranslation(intl, board.name)) {
    return intl!.formatMessage({
      id: board.name,
      defaultMessage: board.name,
    });
  }

  return fallbackTitle;
};
