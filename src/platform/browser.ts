import { buildPublicAppUrl } from './runtime';

export const openExternalUrl = async (url: string): Promise<void> => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const getBoardShareUrl = (boardId: string): string =>
  buildPublicAppUrl(`/board/${boardId}`);
