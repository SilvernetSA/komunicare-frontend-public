import React from 'react';
import ReactEcharts from 'echarts-for-react';
import { useTheme, Theme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import './Doughnut.css';

interface DoughnutDataItem {
  name: string;
  value: number;
}

interface DoughnutChartProps {
  data: DoughnutDataItem[];
  title: string;
  height: string;
  color?: string[];
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({
  data,
  title,
  height,
  color = [],
}) => {
  const theme = useTheme();
  const option = {
    legend: {
      show: true,
      itemGap: 20,
      icon: 'circle',
      bottom: 0,
      textStyle: {
        color: theme?.palette?.text?.secondary || '#666666',
        fontSize: 13,
        fontFamily: 'Helvetica',
      },
    },
    tooltip: {
      show: false,
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    xAxis: [
      {
        axisLine: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
    ],
    yAxis: [
      {
        axisLine: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['45%', '72.55%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        hoverOffset: 5,
        stillShowZeroSum: false,
        label: {
          normal: {
            show: false,
            position: 'center',
            textStyle: {
              color: theme?.palette?.text?.secondary || '#666666',
              fontSize: 13,
              fontFamily: 'Helvetica',
            },
            formatter: '{a}',
          },
          emphasis: {
            show: true,
            textStyle: {
              fontSize: '14',
              fontWeight: 'normal',
            },
            formatter: '{b} \\n{c} ({d}%)',
          },
        },
        labelLine: {
          normal: {
            show: false,
          },
        },
        data: data,
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  return (
    <Card className="Doughnut__Card">
      <div className="Doughnut__Card__Title">{title}</div>
      <ReactEcharts
        style={{ height: height }}
        option={{
          ...option,
          color: [...color],
        }}
      />
    </Card>
  );
};

export default DoughnutChart;
