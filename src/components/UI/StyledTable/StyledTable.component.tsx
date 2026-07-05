import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import {
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';

import { speak } from '../../../providers/SpeechProvider/speechService';
import { useBoardsStore } from '../../../store/boardsStore';
import { Tile } from '../../../types/board';
import './StyledTable.css';

interface StyledTableProps {
  data: any[];
  tableHead: any[];
  isDense?: boolean;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: theme?.palette?.primary?.main || '#2196f3',
    color: theme?.palette?.common?.white || '#ffffff',
  },
  '&.MuiTableCell-body': {
    fontSize: 13,
    paddingRight: '6px',
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme?.palette?.action?.hover || '#f5f5f5',
  },
}));

const StyledTable: React.FC<StyledTableProps> = ({
  data,
  tableHead,
  isDense = false,
}) => {
  const boards = useBoardsStore((state) => state.boards);
  const [imageView, setImageView] = useState<(Tile & { name: string }) | false>(
    false,
  );

  const getTileFromLabel = (label: string): Tile | undefined => {
    for (let i = 0; i < boards.length; i++) {
      for (let j = 0; j < boards[i].tiles.length; j++) {
        const tile = boards[i].tiles[j];
        if (
          (tile.label &&
            tile.label.trim().toLowerCase() === label.trim().toLowerCase()) ||
          (tile.labelKey &&
            tile.labelKey
              .split(' ')
              [tile.labelKey.split(' ').length - 1].trim()
              .toLowerCase() === label.trim().replace(' ', '').toLowerCase())
        ) {
          return tile;
        }
      }
    }
    return undefined;
  };

  const handleRowAction = (item: any) => {
    if (item.type === 'sound') {
      speak(item.name || '');
    } else if (item.type === 'view') {
      const tile = getTileFromLabel(item.name);
      if (tile) {
        setImageView({ ...tile, name: item.name });
      }
    }
  };

  return (
    <div className="StyledTable">
      <div className="StyledTable__Container">
        {!imageView && (
          <Table
            className="StyledTable__Table"
            size={isDense ? 'small' : 'medium'}
          >
            <TableHead>
              <TableRow key="headRow">
                {tableHead &&
                  tableHead.length > 0 &&
                  tableHead.map((item, index) => (
                    <StyledTableCell
                      key={item}
                      colSpan={index === 0 ? 3 : 0}
                      align={index > 0 ? 'right' : 'left'}
                    >
                      {item}
                    </StyledTableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data &&
                data.length > 0 &&
                data.map((item) => (
                  <StyledTableRow key={item.name}>
                    <StyledTableCell colSpan={3} component="th" scope="row">
                      <div className="StyledTable__Table__StyledTableCell__Items">
                        {item.name}
                      </div>
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {item.total > 999
                        ? (item.total / 1000).toFixed(1) + 'k'
                        : item.total}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <IconButton
                        onClick={() => handleRowAction(item)}
                        size="large"
                      >
                        {item.type === 'view' ? (
                          <VisibilityIcon color="secondary" />
                        ) : (
                          <VolumeUpIcon color="secondary" />
                        )}
                      </IconButton>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
        )}
        {imageView && (
          <div className="StyledTable__ImageView">
            <IconButton onClick={() => setImageView(false)} size="large">
              <CloseIcon />
            </IconButton>
            <img alt={imageView.name} src={imageView.image} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StyledTable;
