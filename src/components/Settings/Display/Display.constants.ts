export const DISPLAY_SIZE_STANDARD = 'Standard';
export const DISPLAY_SIZE_LARGE = 'Large';
export const DISPLAY_SIZE_EXTRALARGE = 'ExtraLarge';

// Add label positioning options
export const LABEL_POSITION_ABOVE = 'Above';
export const LABEL_POSITION_BELOW = 'Below';
export const LABEL_POSITION_HIDDEN = 'Hidden';

interface GridCols {
  lg: number;
  md: number;
  sm: number;
  xs: number;
  xxs: number;
}

interface DisplaySizeGridCols {
  [DISPLAY_SIZE_STANDARD]: GridCols;
  [DISPLAY_SIZE_LARGE]: GridCols;
  [DISPLAY_SIZE_EXTRALARGE]: GridCols;
  [key: string]: GridCols;
}

export const DISPLAY_SIZE_GRID_COLS: DisplaySizeGridCols = {
  [DISPLAY_SIZE_STANDARD]: {
    lg: 6,
    md: 6,
    sm: 5,
    xs: 4,
    xxs: 3,
  },
  [DISPLAY_SIZE_LARGE]: {
    lg: 4,
    md: 4,
    sm: 3,
    xs: 2,
    xxs: 2,
  },
  [DISPLAY_SIZE_EXTRALARGE]: {
    lg: 3,
    md: 3,
    sm: 2,
    xs: 1,
    xxs: 1,
  },
};
