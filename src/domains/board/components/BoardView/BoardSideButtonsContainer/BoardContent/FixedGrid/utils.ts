export interface Grid {
  rows: number;
  columns: number;
  order: GridOrder;
}

export type GridOrder = (string | null)[][];

export function createGrid(rows: number = 2, columns: number = 2): Grid {
  const order = createMatrix(rows, columns);

  const grid = {
    order,
    rows,
    columns,
  };

  return grid;
}

function createMatrix(rows: number, columns: number): null[][] {
  const matrix = [...Array(rows)].map(() => [...Array(columns)]);

  return matrix;
}

// TODO: refactor below??

export function moveOrderItem(
  itemId: string,
  position: { row: number; column: number },
  order: GridOrder,
) {
  const mappedOrder = order.map((row) => {
    return row.map((cell) => {
      return cell;
    });
  });

  const oldItem = mappedOrder[position.row][position.column];

  for (let i = 0; i < mappedOrder.length; i++) {
    const itemIndex = mappedOrder[i].indexOf(itemId);

    if (itemIndex !== -1) {
      mappedOrder[i][itemIndex] = oldItem;
      break;
    }
  }

  mappedOrder[position.row][position.column] = itemId;

  return mappedOrder;
}

export function sortGrid({
  columns,
  rows,
  order,
  items,
  compact = false,
}: {
  columns: number;
  rows: number;
  order: GridOrder;
  items: { id: string; [key: string]: unknown }[];
  compact?: boolean;
}) {
  // Raw board data can carry 0/NaN dimensions; clamping keeps the overflow
  // fill loop below from spinning forever on an empty row.
  const safeColumns = Math.max(1, Math.floor(Number(columns) || 0));
  const safeRows = Math.max(1, Math.floor(Number(rows) || 0));
  const grid = createMatrix(safeRows, safeColumns);
  const itemsToSort = [...items];

  order.forEach((row, rowIndex) => {
    row.forEach((id, columnIndex) => {
      const itemIndex = itemsToSort.findIndex((item) => item.id === id);
      const itemExists = itemIndex > -1;
      const exceedsBoundaries =
        rowIndex >= safeRows || columnIndex >= safeColumns;

      if (itemExists && !exceedsBoundaries) {
        const item = itemsToSort.splice(itemIndex, 1)[0];
        grid[rowIndex][columnIndex] = item as any;
      }
    });
  });

  const sortedGrid = fillEmptyGridCells(grid, itemsToSort, safeColumns);
  return compact
    ? compactSortedGrid(sortedGrid, safeRows, safeColumns)
    : sortedGrid;
}

function fillEmptyGridCells(
  grid: unknown[][],
  items: unknown[],
  columns: number,
) {
  const itemQueue = [...items];

  const filled = grid.map((row) =>
    row.map((item) => {
      return item || itemQueue.shift();
    }),
  );

  // Items beyond rows*columns keep rendering on extra rows below the
  // selected viewport (they scroll) instead of silently disappearing.
  while (itemQueue.length) {
    filled.push([...Array(columns)].map(() => itemQueue.shift()));
  }

  return filled;
}

function compactSortedGrid(
  grid: unknown[][],
  rows: number,
  columns: number,
): unknown[][] {
  const compactItems = grid.flat().filter(Boolean);
  // At least the selected rows, plus as many extra rows as the items need.
  const totalRows = Math.max(rows, Math.ceil(compactItems.length / columns));
  const compactGrid = createMatrix(totalRows, columns);
  let compactIndex = 0;

  return compactGrid.map((row) =>
    row.map(() => compactItems[compactIndex++] || null),
  );
}

export function getNewOrder({
  columns,
  rows,
  order,
  items,
}: {
  columns: number;
  rows: number;
  order: GridOrder;
  items: { id: string; [key: string]: unknown }[];
}): string[][] {
  const grid = sortGrid({ columns, rows, order, items });
  grid.forEach((row, rowIndex) => {
    row.forEach((tile, columnIndex) => {
      grid[rowIndex][columnIndex] = (tile as any)?.id;
    });
  });
  return grid as any;
}

export function removeOrderItems(ids: string, order: GridOrder): GridOrder {
  return order.map((row) =>
    row.map((id) => (id && ids.includes(id) ? null : id)),
  );
}
