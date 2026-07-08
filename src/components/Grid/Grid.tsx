import classNames from 'classnames';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { Responsive as ResponsiveReactGridLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

import './Grid.css';
import { GRID_BREAKPOINTS } from './Grid.constants';

interface ColsRowsShape {
  lg: number;
  md: number;
  sm: number;
  xs: number;
  xxs: number;
}

interface GridContainerProps {
  cols?: ColsRowsShape;
  rows?: ColsRowsShape;
  breakpoints?: ColsRowsShape;
  gap?: number;
  children?: React.ReactNode;
  edit?: boolean;
  onLayoutChange?: (
    layout: unknown[],
    layouts: Record<string, unknown[]>,
  ) => void;
  isBigScrollBtns?: boolean;
  setIsScroll?: (isScroll: boolean, totalRows: number) => void;
}

const defaultProps = {
  cols: { lg: 6, md: 6, sm: 5, xs: 4, xxs: 3 },
  rows: { lg: 3, md: 3, sm: 3, xs: 4, xxs: 3 },
  breakpoints: GRID_BREAKPOINTS,
  gap: 10,
  edit: false,
};

export const GridContainer: React.FC<GridContainerProps> = (props) => {
  const {
    cols = defaultProps.cols,
    rows = defaultProps.rows,
    breakpoints = defaultProps.breakpoints,
    gap = defaultProps.gap,
    edit = defaultProps.edit,
    children,
    onLayoutChange,
    isBigScrollBtns,
    setIsScroll,
  } = props;

  const [dragging, setDragging] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const getBreakpointFromWidth = useCallback(
    (breakpoints: ColsRowsShape, width: number): keyof ColsRowsShape => {
      const sorted = Object.keys(breakpoints).sort(
        (a, b) =>
          breakpoints[a as keyof ColsRowsShape] -
          breakpoints[b as keyof ColsRowsShape],
      );
      let matching = sorted[0] as keyof ColsRowsShape;

      for (let i = 1; i < sorted.length; i += 1) {
        const bp = sorted[i] as keyof ColsRowsShape;
        if (width > breakpoints[bp]) matching = bp;
      }
      return matching;
    },
    [],
  );

  // Stable key string — only changes when tile IDs or their order changes,
  // not on every re-render of the parent.
  const childKeyString = useMemo(
    () =>
      (
        React.Children.map(
          children,
          (child: React.ReactElement) => child.key,
        ) || []
      ).join('|'),
    [children],
  );

  const generateLayout = useCallback(
    (colCount: number) =>
      childKeyString
        .split('|')
        .filter(Boolean)
        .map((key, index) => ({
          x: index % colCount,
          y: Math.floor(index / colCount),
          w: 1,
          h: 1,
          i: key,
        })),
    [childKeyString],
  );

  // Memoize the full layouts object so react-grid-layout only sees a new
  // reference when tiles actually change (added / removed / reordered).
  const layouts = useMemo(() => {
    const result: Record<string, unknown[]> = {};
    Object.keys(breakpoints).forEach((bp) => {
      result[bp] = generateLayout(cols[bp as keyof ColsRowsShape]);
    });
    return result;
  }, [breakpoints, cols, generateLayout]);

  const calcRowHeight = useCallback(() => {
    if (!size.width) return 80;

    const currentBp = getBreakpointFromWidth(breakpoints, size.width);
    const currentCols = cols[currentBp];

    const horizontalGaps = gap * (currentCols - 1);
    const horizontalMargins = gap * 2;

    const availableWidth = size.width - horizontalGaps - horizontalMargins;
    const colWidth = availableWidth / currentCols;

    return Math.max(Math.round(colWidth), 80);
  }, [size.width, breakpoints, cols, gap, getBreakpointFromWidth]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        // Guard against sub-pixel jitter that could trigger unnecessary re-renders
        // and feed back into a layout oscillation loop.
        setSize((prev) => {
          if (
            Math.abs(prev.width - width) < 1 &&
            Math.abs(prev.height - height) < 1
          ) {
            return prev;
          }
          return { width, height };
        });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!isBigScrollBtns || !size.width || !setIsScroll) return;

    const breakPoint = getBreakpointFromWidth(breakpoints, size.width);
    const childrenCount = React.Children.count(children);
    const currentCols = cols[breakPoint];

    const isScroll = childrenCount / currentCols > rows[breakPoint];
    const totalRows = Math.ceil(childrenCount / currentCols);
    setIsScroll(isScroll, totalRows);
  }, [
    isBigScrollBtns,
    size.width,
    setIsScroll,
    breakpoints,
    children,
    cols,
    rows,
    getBreakpointFromWidth,
  ]);

  return (
    <div ref={containerRef} className={classNames('Grid', { dragging })}>
      {size.width > 0 && (
        <ResponsiveReactGridLayout
          breakpoints={breakpoints as any}
          cols={cols as any}
          layouts={layouts as any}
          width={size.width}
          rowHeight={calcRowHeight()}
          containerPadding={[gap, gap]}
          margin={[gap, gap]}
          isDraggable={edit}
          isResizable={false}
          onLayoutChange={onLayoutChange as any}
          onDragStart={() => setDragging(true)}
          onDragStop={() => setDragging(false)}
        >
          {children}
        </ResponsiveReactGridLayout>
      )}
    </div>
  );
};

export default GridContainer;
