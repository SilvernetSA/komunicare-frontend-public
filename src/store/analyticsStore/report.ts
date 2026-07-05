export const getReportRows = (report: any, index: number, match?: string) => {
  const rows = report?.reports?.[index]?.data?.rows;
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows
    .map((row: any) => ({
      label: row.dimensions?.[0],
      value: Number(row.metrics?.[0]?.values?.[0] ?? 0),
      match: match ? row.dimensions?.[0]?.includes(match) : true,
    }))
    .filter((item) => (match ? item.match : true));
};

export const getReportTotal = (
  report: any,
  index: number,
  type: 'rowCount' | 'sum' = 'sum',
) => {
  const totals = report?.reports?.[index]?.data;
  if (!totals) {
    return 0;
  }
  if (type === 'rowCount') {
    return totals.rowCount || 0;
  }
  const total = totals.totals?.[0]?.values?.[0];
  return Number(total || 0);
};
