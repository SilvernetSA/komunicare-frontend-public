interface ReportData {
  rows?: { dimensions: string[]; metrics: { values: string[] }[] }[];
  rowCount?: number;
  totals?: Array<{ values: string[] }>;
}

interface Report {
  reports?: Array<{
    data: ReportData;
  }>;
}

interface ReportRow {
  name: string;
  total: string;
  type: string;
}

export const getReportTotal = (
  report: Report,
  index: number = 0,
  type: string = 'totals',
): number => {
  let total = 0;
  if (
    report &&
    report.reports &&
    report.reports.length > index &&
    report.reports[index].data['rows']
  ) {
    if (type === 'rowCount') {
      total = report.reports[index].data['rowCount'] || 0;
    } else {
      total =
        Number(report.reports[index].data['totals']?.[0]?.['values']?.[0]) || 0;
    }
  }
  return total;
};

export const getReportRows = (
  report: Report,
  index: number = 0,
  type: string = 'view',
  max: number = 10,
): ReportRow[] => {
  let rows: ReportRow[] = [];
  if (
    report &&
    report.reports &&
    report.reports.length > index &&
    report.reports[index].data['rows']
  ) {
    rows = report.reports[index].data['rows']
      .slice(0, max)
      .map(
        (row: { dimensions: string[]; metrics: { values: string[] }[] }) => ({
          name: row['dimensions'][1],
          total: row['metrics'][0]['values'][0],
          type: type,
        }),
      );
  }
  return rows;
};
