import HomeIcon from '@mui/icons-material/Home';
import VerifiedIcon from '@mui/icons-material/Verified';
import { CardContent } from '@mui/material';
import { Card, CardMedia, Chip, Typography } from '@mui/material';
import React, { useState } from 'react';
import { IntlShape } from 'react-intl';

import styles from './DefaultBoardSelector.module.css';
import { Board } from '@/types/board';
import { getBoardDisplayTitle } from '@/utils/getBoardDisplayTitle';
import messages from '../CommunicatorToolbar.messages';

interface RootBoard {
  caption?: string;
  name: string;
  nameKey?: string;
  id?: string;
  description?: string;
  [key: string]: unknown;
}

interface DefaultBoardOptionProps {
  rootBoard: RootBoard;
  onClick: () => void;
  intl: IntlShape;
  descriptionText?: string;
  titleText?: string;
  isOfficial?: boolean;
  isUserCopy?: boolean;
  isActive?: boolean;
}

const DefaultBoardOption: React.FC<DefaultBoardOptionProps> = ({
  rootBoard,
  onClick,
  intl,
  descriptionText,
  titleText,
  isOfficial = false,
  isUserCopy = false,
  isActive = false,
}) => {
  const [shadow, setShadow] = useState(false);
  const title =
    titleText || getBoardDisplayTitle(rootBoard as Board, intl as any);

  const description = descriptionText
    ? descriptionText
    : rootBoard.description && messages[rootBoard.description]
      ? intl.formatMessage(messages[rootBoard.description])
      : '';

  return (
    <Card
      className={styles.card}
      onClick={onClick}
      onMouseOver={() => setShadow(true)}
      onMouseOut={() => setShadow(false)}
      raised={shadow}
      sx={{ position: 'relative' }}
    >
      {isOfficial && (
        <Chip
          icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
          label="Komunicare"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: 'rgba(57, 73, 171, 0.9)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 11,
            '& .MuiChip-icon': { color: '#fff' },
          }}
        />
      )}
      {isUserCopy && (
        <Chip
          label="Mi versión"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: 'rgba(0, 132, 200, 0.85)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 11,
          }}
        />
      )}
      {rootBoard.caption ? (
        <CardMedia
          component="img"
          alt={intl.formatMessage(messages.defaultBoardImageAlt)}
          height="160"
          image={rootBoard.caption}
          sx={{ objectFit: 'contain', background: '#f5f5f5', p: 1 }}
        />
      ) : (
        <div
          style={{
            height: 160,
            background: '#e8eaf6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            color: '#3949ab',
            fontWeight: 700,
          }}
        >
          {(rootBoard.name || '?')[0].toUpperCase()}
        </div>
      )}
      <CardContent className={styles.cardContent}>
        {isActive && (
          <Chip
            icon={<HomeIcon sx={{ fontSize: 14 }} />}
            label="Home"
            size="small"
            sx={{
              mb: 1,
              backgroundColor: 'rgba(46, 125, 50, 0.9)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 11,
              '& .MuiChip-icon': { color: '#fff' },
            }}
          />
        )}
        <Typography gutterBottom variant="h6">
          {title}
        </Typography>
        <Typography variant="body2">{description}</Typography>
      </CardContent>
    </Card>
  );
};

export default DefaultBoardOption;
