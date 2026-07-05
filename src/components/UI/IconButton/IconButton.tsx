import MUIIconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, { Fragment } from 'react';

interface IconButtonProps {
  children: React.ReactNode;
  component?: React.ElementType;
  disabled?: boolean;
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  to?: string;
  size?: 'small' | 'medium' | 'large';
}

const IconButton: React.FC<IconButtonProps> = ({
  children,
  component,
  to,
  label,
  disabled,
  onClick,
  size,
}) => {
  const child = React.Children.only(children);

  const iconButtonProps = {
    component,
    disabled,
    onClick,
    to,
    size,
    'aria-label': label,
    color: 'inherit' as const,
  };

  const disableIconButtondStyle = {
    color: 'rgba(0, 0, 0, 0.26)',
  };

  return (
    <Fragment>
      {disabled ? (
        <MUIIconButton {...iconButtonProps} style={disableIconButtondStyle}>
          {child}
        </MUIIconButton>
      ) : (
        <Tooltip placement="bottom" title={label}>
          <MUIIconButton {...iconButtonProps}>{child}</MUIIconButton>
        </Tooltip>
      )}
    </Fragment>
  );
};

export default IconButton;
