import classNames from 'classnames';
import React from 'react';

import styles from './Row.module.css';

interface RowProps {
  className?: string;
  children?: React.ReactNode;
}

const Row: React.FC<RowProps> = ({ className, ...other }) => {
  const rowClassName = classNames(styles.root, className);

  return <div className={rowClassName} {...other} />;
};

export default Row;
