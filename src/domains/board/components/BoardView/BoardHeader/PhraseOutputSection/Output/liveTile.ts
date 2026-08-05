import shortid from 'shortid';

import type { Tile } from '@/types/board';

export const DEFAULT_LIVE_TILE: Tile = {
  backgroundColor: 'rgb(255, 241, 118)',
  image: '',
  label: '',
  labelKey: '',
  type: 'live',
};

export const createLiveTile = (): Tile => ({
  ...DEFAULT_LIVE_TILE,
  id: shortid.generate(),
});
