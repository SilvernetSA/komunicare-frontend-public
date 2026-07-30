import moment from 'moment';
import React from 'react';

import ModifiedAreaChart from '@/domains/shared/components/UI/ModifiedAreaChart/ModifiedAreaChart.component';

interface Usage {
  data: number[];
  max: number;
  min: number;
}

interface AnalyticsChartProps {
  usage: Usage;
  days: number;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ usage, days }) => {
  const getDates = (range: number): string[] => {
    const dates = [];
    const dateEnd = moment();
    const dateStart = moment().subtract(range, 'days');
    while (dateEnd.diff(dateStart, 'days') >= 0) {
      dates.push(dateStart.format('DD/MM'));
      dateStart.add(1, 'days');
    }
    return dates;
  };

  return (
    <ModifiedAreaChart
      height="200px"
      option={{
        series: [
          {
            data: usage.data,
            type: 'line',
          },
        ],
        xAxis: {
          data: getDates(days),
        },
        yAxis: {
          max: usage.max,
          min: usage.min,
          offset: -13,
        },
      }}
    />
  );
};

export default AnalyticsChart;
