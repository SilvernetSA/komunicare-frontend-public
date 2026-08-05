import { Card } from '@mui/material';
import React from 'react';

import StyledTable from '@/domains/shared/components/UI/StyledTable/StyledTable.component';
import './TableCard.css';

interface TableCardProps {
  title: string;
  data: Record<string, unknown>[];
  tableHead: Record<string, unknown>[];
}

const TableCard: React.FC<TableCardProps> = ({ data, tableHead, title }) => {
  return (
    <Card elevation={3} className="TableCard">
      <div className="TableCard__Title">{title}</div>
      <StyledTable isDense={true} data={data} tableHead={tableHead} />
    </Card>
  );
};

export default TableCard;
